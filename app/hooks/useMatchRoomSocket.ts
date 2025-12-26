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
    | "YELLOW_CARD"
    | "RED_CARD"
    | "SHOT"
    | "CORNER"
    | "SUBSTITUTION";
  minute: number;
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

export function useMatchRoomSocket(matchId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!matchId || !Number.isFinite(matchId)) return;

    const s = getSocket();
    if (!s.connected) s.connect();

    s.emit("join", { matchId });

    const onNew: ServerToClientEvents["stats:new"] = ({
      matchId: mid,
      stat,
    }) => {
      if (mid !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        const exists = prev.some((x) => x.id === stat.id);
        return {
          ...old,
          stats: exists
            ? prev.map((x) => (x.id === stat.id ? stat : x))
            : [...prev, stat].sort(
                (a, b) => a.minute - b.minute || a.id - b.id,
              ),
        };
      });
    };

    const onUpdate: ServerToClientEvents["stats:update"] = ({
      matchId: mid,
      stat,
    }) => {
      if (mid !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        return {
          ...old,
          stats: prev
            .map((x) => (x.id === stat.id ? stat : x))
            .sort((a, b) => a.minute - b.minute || a.id - b.id),
        };
      });
    };

    const onDelete: ServerToClientEvents["stats:delete"] = ({
      matchId: mid,
      statId,
    }) => {
      if (mid !== matchId) return;
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        return { ...old, stats: prev.filter((x) => x.id !== statId) };
      });
    };

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

    s.on("stats:new", onNew);
    s.on("stats:update", onUpdate);
    s.on("stats:delete", onDelete);
    s.on("clock:update", onClock);
    s.on("counters:update", onCounters);
    s.on("match:update", onMatch);

    return () => {
      s.off("stats:new", onNew);
      s.off("stats:update", onUpdate);
      s.off("stats:delete", onDelete);
      s.off("clock:update", onClock);
      s.off("counters:update", onCounters);
      s.off("match:update", onMatch);
    };
  }, [matchId, queryClient]);
}
