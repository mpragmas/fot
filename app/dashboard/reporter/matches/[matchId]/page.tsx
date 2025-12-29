"use client";

import React, { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import MatchReportHeader from "./_components/MatchReportHeader";
import MatchRecordEvents from "./_components/MatchRecordEvents";
import MatchVenue from "./_components/MatchVenue";
import LiveTimelineSection, {
  RecordedEvent,
} from "./_components/LiveTimelineSection";
import { useMatchClockControls } from "@/app/hooks/useMatchClockControls";
import { useMatchRoomSocket } from "@/app/hooks/useMatchRoomSocket";

// Fetch a single match by ID (includes phase/clock fields)
const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

type Counters = {
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homeCorners: number;
  awayCorners: number;
};

type PlayerLite = {
  id: number;
  firstName: string;
  lastName: string | null;
  number: number | null;
  teamId: number | null;
};

type MatchStatLite = {
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

function fullName(p: PlayerLite) {
  return p.lastName ? `${p.firstName} ${p.lastName}` : p.firstName;
}

function computeScore(
  stats: MatchStatLite[],
  homePlayerIds: Set<number>,
  awayPlayerIds: Set<number>,
) {
  let home = 0;
  let away = 0;

  for (const s of stats) {
    const isHomePlayer = homePlayerIds.has(s.playerId);
    const isAwayPlayer = awayPlayerIds.has(s.playerId);
    if (!isHomePlayer && !isAwayPlayer) continue;

    if (s.type === "GOAL") {
      if (isHomePlayer) home += 1;
      else away += 1;
    }
    if (s.type === "OWN_GOAL") {
      if (isHomePlayer) away += 1;
      else home += 1;
    }
  }

  return { home, away };
}

export default function MatchControlPage() {
  const params = useParams();
  const matchId = Number(params.matchId);

  const queryClient = useQueryClient();

  // We should ideally have a specific GET /api/matches/[id] endpoint.
  // For now, I'll assume we can get it from the list or I'll quickly fix the fetcher if needed.
  // Wait, params.matchId is the ID of the MATCH table, right?
  // The route is matches/[matchId].

  // Let's create a useMatch hook or just useQuery here.
  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: !!matchId,
    // Fast-ish polling to keep clock & stats fresh as a fallback to sockets
    refetchInterval: 3000,
  });

  useMatchRoomSocket(matchId);

  const rawControls = useMatchClockControls(matchId);
  const controls = {
    startMatch: rawControls.startFirstHalf,
    endFirstHalf: rawControls.endFirstHalf,
    startSecondHalf: rawControls.startSecondHalf,
    endMatch: rawControls.endMatch,
    addExtraTime: rawControls.addExtraTime,
    isLoading: rawControls.isLoading,
  };

  const counters: Counters = {
    homeShotsOnTarget: match?.counters?.homeShotsOnTarget ?? 0,
    awayShotsOnTarget: match?.counters?.awayShotsOnTarget ?? 0,
    homeCorners: match?.counters?.homeCorners ?? 0,
    awayCorners: match?.counters?.awayCorners ?? 0,
  };

  const homePlayers: PlayerLite[] = useMemo(
    () => match?.fixture?.homeTeam?.players ?? [],
    [match?.fixture?.homeTeam?.players],
  );
  const awayPlayers: PlayerLite[] = useMemo(
    () => match?.fixture?.awayTeam?.players ?? [],
    [match?.fixture?.awayTeam?.players],
  );

  const homePlayerIds = useMemo(
    () => new Set(homePlayers.map((p) => p.id)),
    [homePlayers],
  );
  const awayPlayerIds = useMemo(
    () => new Set(awayPlayers.map((p) => p.id)),
    [awayPlayers],
  );

  const playersById = useMemo(() => {
    return new Map<number, PlayerLite>([
      ...homePlayers.map((p) => [p.id, p] as const),
      ...awayPlayers.map((p) => [p.id, p] as const),
    ]);
  }, [awayPlayers, homePlayers]);

  const stats: MatchStatLite[] = useMemo(
    () => match?.stats ?? [],
    [match?.stats],
  );

  const score = useMemo(
    () => computeScore(stats, homePlayerIds, awayPlayerIds),
    [awayPlayerIds, homePlayerIds, stats],
  );

  const events: RecordedEvent[] = useMemo(() => {
    return stats
      .filter((s) =>
        [
          "GOAL",
          "OWN_GOAL",
          "ASSIST",
          "YELLOW_CARD",
          "RED_CARD",
          "SUBSTITUTION",
        ].includes(s.type),
      )
      .map((s) => {
        const p = playersById.get(s.playerId);
        const isHome = homePlayerIds.has(s.playerId);
        const team = isHome ? "HOME" : "AWAY";
        return {
          id: s.id,
          type: s.type as RecordedEvent["type"],
          minute: s.minute,
          team,
          playerId: s.playerId,
          playerName: p ? fullName(p) : undefined,
        };
      });
  }, [homePlayerIds, playersById, stats]);

  const createStatMutation = useMutation({
    mutationFn: async (payload: {
      playerId: number;
      type: MatchStatLite["type"];
      minute: number;
    }) => {
      const res = await fetch(`/api/matches/${matchId}/stats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create stat");
      return res.json();
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });
      const previous = queryClient.getQueryData<any>(["match", matchId]);
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        const optimistic = {
          id: -Date.now(),
          matchId,
          playerId: payload.playerId,
          type: payload.type,
          minute: payload.minute,
          createdAt: new Date().toISOString(),
        };
        return { ...old, stats: [...prev, optimistic] };
      });
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["match", matchId], ctx.previous);
    },
    onSuccess: (created) => {
      const createdList: any[] = Array.isArray(created) ? created : [created];
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        const withoutOptimistic = prev.filter((s) => s.id >= 0);
        const merged = [...withoutOptimistic, ...createdList].sort(
          (a, b) => a.minute - b.minute || a.id - b.id,
        );
        return { ...old, stats: merged };
      });
    },
  });

  const updateStatMutation = useMutation({
    mutationFn: async (payload: {
      statId: number;
      playerId: number;
      type: MatchStatLite["type"];
      minute: number;
    }) => {
      const { statId, ...body } = payload;
      const res = await fetch(`/api/matches/${matchId}/stats/${statId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update stat");
      return res.json();
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });
      const previous = queryClient.getQueryData<any>(["match", matchId]);
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        return {
          ...old,
          stats: prev
            .map((s) =>
              s.id === payload.statId
                ? {
                    ...s,
                    playerId: payload.playerId,
                    type: payload.type,
                    minute: payload.minute,
                  }
                : s,
            )
            .sort((a, b) => a.minute - b.minute || a.id - b.id),
        };
      });
      return { previous };
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["match", matchId], ctx.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        return {
          ...old,
          stats: prev
            .map((s) => (s.id === updated.id ? updated : s))
            .sort((a, b) => a.minute - b.minute || a.id - b.id),
        };
      });
    },
  });

  const deleteStatMutation = useMutation({
    mutationFn: async (statId: number) => {
      const res = await fetch(`/api/matches/${matchId}/stats/${statId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete stat");
      return res.json();
    },
    onMutate: async (statId) => {
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });
      const previous = queryClient.getQueryData<any>(["match", matchId]);
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const prev: any[] = Array.isArray(old.stats) ? old.stats : [];
        return { ...old, stats: prev.filter((s) => s.id !== statId) };
      });
      return { previous };
    },
    onError: (_err, _statId, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["match", matchId], ctx.previous);
    },
  });

  const patchCountersMutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch(`/api/matches/${matchId}/counters`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update counters");
      return res.json();
    },
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });
      const previous = queryClient.getQueryData<any>(["match", matchId]);
      queryClient.setQueryData<any>(["match", matchId], (old: any) => {
        if (!old) return old;
        const current = old.counters ?? {
          homeShotsOnTarget: 0,
          awayShotsOnTarget: 0,
          homeCorners: 0,
          awayCorners: 0,
        };
        const next = {
          homeShotsOnTarget: Math.max(
            0,
            (current.homeShotsOnTarget ?? 0) +
              (body.homeShotsOnTargetDelta ?? 0),
          ),
          awayShotsOnTarget: Math.max(
            0,
            (current.awayShotsOnTarget ?? 0) +
              (body.awayShotsOnTargetDelta ?? 0),
          ),
          homeCorners: Math.max(
            0,
            (current.homeCorners ?? 0) + (body.homeCornersDelta ?? 0),
          ),
          awayCorners: Math.max(
            0,
            (current.awayCorners ?? 0) + (body.awayCornersDelta ?? 0),
          ),
        };
        return { ...old, counters: next };
      });
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.previous)
        queryClient.setQueryData(["match", matchId], ctx.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });

  const handleCreateStat = useCallback(
    (payload: {
      playerId: number;
      type: MatchStatLite["type"];
      minute: number;
    }) => {
      createStatMutation.mutate(payload);
    },
    [createStatMutation],
  );

  const handleUpdateStat = useCallback(
    (payload: {
      statId: number;
      playerId: number;
      type: MatchStatLite["type"];
      minute: number;
    }) => {
      updateStatMutation.mutate(payload);
    },
    [updateStatMutation],
  );

  const handleDeleteStat = useCallback(
    (statId: number) => {
      deleteStatMutation.mutate(statId);
    },
    [deleteStatMutation],
  );

  const handleAdjustShotsOnTarget = useCallback(
    (team: "HOME" | "AWAY", delta: 1 | -1) => {
      patchCountersMutation.mutate(
        team === "HOME"
          ? { homeShotsOnTargetDelta: delta }
          : { awayShotsOnTargetDelta: delta },
      );
    },
    [patchCountersMutation],
  );

  const handleAdjustCorners = useCallback(
    (team: "HOME" | "AWAY", delta: 1 | -1) => {
      patchCountersMutation.mutate(
        team === "HOME"
          ? { homeCornersDelta: delta }
          : { awayCornersDelta: delta },
      );
    },
    [patchCountersMutation],
  );

  if (isLoading)
    return <div className="p-10 text-center">Loading match...</div>;
  if (!match) return <div className="p-10 text-center">Match not found</div>;

  return (
    <div className="bg-whitish min-h-screen w-full p-6">
      <MatchReportHeader match={match} controls={controls} score={score} />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MatchRecordEvents
          homePlayers={homePlayers.map((p) => ({
            id: p.id,
            name: fullName(p),
          }))}
          awayPlayers={awayPlayers.map((p) => ({
            id: p.id,
            name: fullName(p),
          }))}
          onCreateStat={handleCreateStat}
          counters={counters}
          onAdjustShotsOnTarget={handleAdjustShotsOnTarget}
          onAdjustCorners={handleAdjustCorners}
          homeTeamName={match.fixture.homeTeam.name}
          awayTeamName={match.fixture.awayTeam.name}
        />
        <MatchVenue />
      </div>
      <LiveTimelineSection
        events={events}
        counters={counters}
        homeTeamName={match.fixture.homeTeam.name}
        awayTeamName={match.fixture.awayTeam.name}
        onDeleteEvent={handleDeleteStat}
        onEditEvent={handleUpdateStat}
        homePlayers={homePlayers.map((p) => ({ id: p.id, name: fullName(p) }))}
        awayPlayers={awayPlayers.map((p) => ({ id: p.id, name: fullName(p) }))}
      />
    </div>
  );
}
