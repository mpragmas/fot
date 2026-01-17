"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

type MatchStatus = "UPCOMING" | "LIVE" | "COMPLETED";
type MatchPhase = "PRE" | "FIRST_HALF" | "HT" | "SECOND_HALF" | "ET" | "FT";

type MatchStat = {
  id: number;
  matchId: number;
  playerId: number;
  type:
    | "GOAL"
    | "ASSIST"
    | "OWN_GOAL"
    | "PENALTY_GOAL"
    | "YELLOW_CARD"
    | "RED_CARD"
    | "SHOT"
    | "CORNER"
    | "SUBSTITUTION";
  minute: number;
  half?: number | null;
  createdAt: string;
};

type MatchCounters = {
  id: number;
  matchId: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
  updatedAt: string;
};

type ServerToClientEvents = {
  "stats:new": (payload: { matchId: number; stat: MatchStat }) => void;
  "stats:update": (payload: { matchId: number; stat: MatchStat }) => void;
  "stats:delete": (payload: { matchId: number; statId: number }) => void;
  "clock:update": (payload: {
    matchId: number;
    phase: MatchPhase;
    elapsedSeconds: number;
    clockStartedAt: string | null;
  }) => void;
  "counters:update": (payload: {
    matchId: number;
    counters: MatchCounters;
  }) => void;
  "match:update": (payload: { matchId: number; status: MatchStatus }) => void;
};

type ClientToServerEvents = {
  join: (payload: { matchId: number }) => void;
};

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

function getSocket() {
  if (!socket) {
    socket = io("http://localhost:4002", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

/* ------------------------------------------------------------------ */
/*  DELETE + CREATE SAFETY TRACKING (FIXED)                             */
/* ------------------------------------------------------------------ */

// Stats currently being deleted (short-term)
const pendingDeleteStatIds = new Set<number>();

// Stats that were deleted recently (tombstones)
export const deletedStatIds = new Set<number>();

// Pending creates (still OK as you had)
export const pendingCreateKeys = new Set<string>();

// Recently created real stats
const recentlyCreatedStatIds = new Set<number>();

// Recently updated stats (to prevent onError rollback)
export const recentlyUpdatedStatIds = new Set<number>();

export function addPendingDelete(statId: number) {
  pendingDeleteStatIds.add(statId);
  deletedStatIds.add(statId);
}

export function removePendingDelete(statId: number) {
  // IMPORTANT: keep tombstone long enough to catch late socket events
  setTimeout(() => {
    pendingDeleteStatIds.delete(statId);
    deletedStatIds.delete(statId);
  }, 30000); // ⬅️ extended to 30s for slow connections
}

export function addPendingCreate(
  playerId: number,
  type: string,
  minute: number,
) {
  pendingCreateKeys.add(`${playerId}:${type}:${minute}`);
}

export function removePendingCreate(
  playerId: number,
  type: string,
  minute: number,
) {
  setTimeout(
    () => pendingCreateKeys.delete(`${playerId}:${type}:${minute}`),
    500,
  );
}

export function markStatAsCreated(statId: number) {
  recentlyCreatedStatIds.add(statId);
  setTimeout(() => recentlyCreatedStatIds.delete(statId), 3000);
}

/* ------------------------------------------------------------------ */

function sortStats(stats: MatchStat[]): MatchStat[] {
  return [...stats].sort((a, b) => {
    const halfA = a.half === 2 ? 1 : 0;
    const halfB = b.half === 2 ? 1 : 0;
    if (halfA !== halfB) return halfA - halfB;
    if (a.minute !== b.minute) return a.minute - b.minute;
    return a.id - b.id;
  });
}

export function useMatchRoomSocket(matchId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId || !Number.isFinite(matchId)) return;

    const s = getSocket();
    if (!s.connected) s.connect();

    s.emit("join", { matchId });

    /* -------------------- stats:new -------------------- */
    const onStatNew: ServerToClientEvents["stats:new"] = (payload) => {
      if (payload.matchId !== matchId) return;

      // ⛔ NEVER resurrect deleted stats
      if (deletedStatIds.has(payload.stat.id)) return;

      const key = `${payload.stat.playerId}:${payload.stat.type}:${payload.stat.minute}`;
      if (pendingCreateKeys.has(key)) return;

      if (recentlyCreatedStatIds.has(payload.stat.id)) return;

      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: MatchStat[] = Array.isArray(old.stats) ? old.stats : [];
        
        // Check if this stat already exists (by ID) OR if there's a matching optimistic stat
        const isDuplicate = prev.some((s) => {
          // Exact ID match
          if (s.id === payload.stat.id) return true;
          // Optimistic match: negative ID + same properties
          if (s.id < 0 && 
              s.playerId === payload.stat.playerId && 
              s.type === payload.stat.type && 
              s.minute === payload.stat.minute) {
            return true;
          }
          return false;
        });

        if (isDuplicate) return old;

        return { ...old, stats: sortStats([...prev, payload.stat]) };
      });
    };

    /* -------------------- stats:update -------------------- */
    const onStatUpdate: ServerToClientEvents["stats:update"] = (payload) => {
      if (payload.matchId !== matchId) return;

      // ⛔ NEVER resurrect deleted stats
      if (deletedStatIds.has(payload.stat.id)) return;

      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: MatchStat[] = Array.isArray(old.stats) ? old.stats : [];
        // ⛔ Filter out any tombstoned stats before updating
        const filtered = prev.filter((s) => !deletedStatIds.has(s.id));
        const updated = filtered.map((s) =>
          s.id === payload.stat.id ? payload.stat : s,
        );
        return { ...old, stats: sortStats(updated) };
      });

      // Track this update as confirmed via socket
      recentlyUpdatedStatIds.add(payload.stat.id);
      setTimeout(() => recentlyUpdatedStatIds.delete(payload.stat.id), 30000);
    };

    /* -------------------- stats:delete -------------------- */
    const onStatDelete: ServerToClientEvents["stats:delete"] = (payload) => {
      if (payload.matchId !== matchId) return;

      const statId = payload.statId;

      // Already being deleted or recently deleted -> ignore
      if (pendingDeleteStatIds.has(statId) || deletedStatIds.has(statId)) {
        return;
      }

      // Mark as deleted (tombstone)
      deletedStatIds.add(statId);

      // Remove from local cache
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: MatchStat[] = Array.isArray(old.stats) ? old.stats : [];
        const filtered = prev.filter((s) => s.id !== statId);
        return { ...old, stats: sortStats(filtered) };
      });

      // Cleanup tombstone after 30 seconds for safety
      setTimeout(() => deletedStatIds.delete(statId), 30000);
    };

    /* -------------------- other events -------------------- */
    const onClock: ServerToClientEvents["clock:update"] = (payload) => {
      if (payload.matchId !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          phase: payload.phase,
          elapsedSeconds: payload.elapsedSeconds,
          clockStartedAt: payload.clockStartedAt,
        };
      });
    };

    const onCounters: ServerToClientEvents["counters:update"] = (payload) => {
      if (payload.matchId !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        return { ...old, counters: payload.counters };
      });
    };

    const onMatch: ServerToClientEvents["match:update"] = (payload) => {
      if (payload.matchId !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        return { ...old, status: payload.status };
      });
    };

    s.on("stats:new", onStatNew);
    s.on("stats:update", onStatUpdate);
    s.on("stats:delete", onStatDelete);
    s.on("clock:update", onClock);
    s.on("counters:update", onCounters);
    s.on("match:update", onMatch);

    s.onAny((event, payload) => {
      if (
        payload?.stat?.id === 235 ||
        payload?.id === 235 ||
        payload?.statId === 235
      ) {
        console.log("🔥 RESURRECTION EVENT", event, payload);
      }
    });

    return () => {
      s.off("stats:new", onStatNew);
      s.off("stats:update", onStatUpdate);
      s.off("stats:delete", onStatDelete);
      s.off("clock:update", onClock);
      s.off("counters:update", onCounters);
      s.off("match:update", onMatch);

      s.offAny();
    };
  }, [matchId, queryClient]);
}
