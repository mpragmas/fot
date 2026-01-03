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
import Lineup from "@/app/fan/match/[id]/lineup/page";
import LineupReport from "./_components/LineupReport";

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
  homeYellowCards: number;
  awayYellowCards: number;
  homeRedCards: number;
  awayRedCards: number;
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
    | "PENALTY_GOAL"
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

    if (s.type === "GOAL" || s.type === "PENALTY_GOAL") {
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
  });

  useMatchRoomSocket(matchId);

  const rawControls = useMatchClockControls(matchId);
  const controls = {
    startMatch: rawControls.startFirstHalf,
    endFirstHalf: rawControls.endFirstHalf,
    startSecondHalf: rawControls.startSecondHalf,
    endMatch: rawControls.endMatch,
    addExtraTime: rawControls.addExtraTime,
    pauseClock: rawControls.pauseClock,
    resumeClock: rawControls.resumeClock,
    undoLastAction: rawControls.undoLastAction,
    isLoading: rawControls.isLoading,
  };

  const counters: Counters = {
    homeShotsOnTarget: match?.counters?.homeShotsOnTarget ?? 0,
    awayShotsOnTarget: match?.counters?.awayShotsOnTarget ?? 0,
    homeCorners: match?.counters?.homeCorners ?? 0,
    awayCorners: match?.counters?.awayCorners ?? 0,
    homeYellowCards: 0,
    awayYellowCards: 0,
    homeRedCards: 0,
    awayRedCards: 0,
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
    [stats, homePlayerIds, awayPlayerIds],
  );

  const currentMinute = useMemo(() => {
    const elapsed = match?.elapsedSeconds ?? 0;
    const phase = match?.phase ?? "PRE";
    // Derive a simple minute value that roughly tracks the clock:
    // - In first half, clamp to 0-45 and show extra as 45+ for display only.
    // - In second half / ET, offset from 45.
    const baseMinutes = Math.floor(elapsed / 60);
    if (phase === "FIRST_HALF") return baseMinutes;
    if (phase === "SECOND_HALF" || phase === "ET") return 45 + baseMinutes;
    return baseMinutes;
  }, [match?.elapsedSeconds, match?.phase]);

  const cardCounters = useMemo(() => {
    let homeYellow = 0;
    let awayYellow = 0;
    let homeRed = 0;
    let awayRed = 0;

    for (const s of stats) {
      if (s.type !== "YELLOW_CARD" && s.type !== "RED_CARD") continue;
      const isHome = homePlayerIds.has(s.playerId);
      const isAway = awayPlayerIds.has(s.playerId);
      if (!isHome && !isAway) continue;

      if (s.type === "YELLOW_CARD") {
        if (isHome) homeYellow += 1;
        else awayYellow += 1;
      } else {
        if (isHome) homeRed += 1;
        else awayRed += 1;
      }
    }

    return {
      homeYellowCards: homeYellow,
      awayYellowCards: awayYellow,
      homeRedCards: homeRed,
      awayRedCards: awayRed,
    };
  }, [homePlayerIds, awayPlayerIds, stats]);

  const events: RecordedEvent[] = useMemo(() => {
    if (!stats || stats.length === 0) return [];

    const goalLike: MatchStatLite[] = [];
    const assists: MatchStatLite[] = [];
    const yellows: MatchStatLite[] = [];
    const reds: MatchStatLite[] = [];
    const substitutions: MatchStatLite[] = [];

    for (const s of stats) {
      if (
        s.type === "GOAL" ||
        s.type === "OWN_GOAL" ||
        s.type === "PENALTY_GOAL"
      ) {
        goalLike.push(s);
      } else if (s.type === "ASSIST") {
        assists.push(s);
      } else if (s.type === "YELLOW_CARD") {
        yellows.push(s);
      } else if (s.type === "RED_CARD") {
        reds.push(s);
      } else if (s.type === "SUBSTITUTION") {
        substitutions.push(s);
      }
    }

    // Build a fast lookup for assists by (team, minute)
    const assistsByTeamMinute = new Map<string, MatchStatLite[]>();
    const keyFor = (team: "HOME" | "AWAY", minute: number) =>
      `${team}:${minute}`;

    for (const a of assists) {
      const isHome = homePlayerIds.has(a.playerId);
      const team = isHome ? "HOME" : "AWAY";
      const key = keyFor(team, a.minute);
      const list = assistsByTeamMinute.get(key);
      if (list) list.push(a);
      else assistsByTeamMinute.set(key, [a]);
    }

    const result: RecordedEvent[] = [];

    // Goals / own-goals / penalties, optionally enriched with assist info
    for (const g of goalLike) {
      const isHome = homePlayerIds.has(g.playerId);
      // For normal/penalty goals, event appears for the scoring team.
      // For own goals, event should appear for the OPPOSITE team (the
      // team that benefits from the own goal).
      const team: "HOME" | "AWAY" =
        g.type === "OWN_GOAL"
          ? isHome
            ? "AWAY"
            : "HOME"
          : isHome
            ? "HOME"
            : "AWAY";
      const p = playersById.get(g.playerId);
      const key = keyFor(team, g.minute);
      const possibleAssists = assistsByTeamMinute.get(key) ?? [];
      const assist = possibleAssists.find((a) => a.playerId !== g.playerId);
      const assistPlayer = assist
        ? playersById.get(assist.playerId)
        : undefined;

      const base: RecordedEvent = {
        id: g.id,
        type: g.type as RecordedEvent["type"],
        minute: g.minute,
        team,
        playerId: g.playerId,
        playerName: p ? fullName(p) : undefined,
      };

      if (assist && assistPlayer) {
        // Attach assist name into playerName subtitle via LiveTimelineSection
        base.playerName = `${base.playerName ?? "Unknown"} (assist: ${fullName(
          assistPlayer,
        )})`;
      }

      result.push(base);
    }

    // Cards: group second yellow + red at same minute into one event
    const yellowByPlayerMinute = new Map<string, MatchStatLite>();
    for (const y of yellows) {
      const key = `${y.playerId}:${y.minute}`;
      yellowByPlayerMinute.set(key, y);
    }

    const consumedYellowKeys = new Set<string>();

    for (const r of reds) {
      const key = `${r.playerId}:${r.minute}`;
      const pairedYellow = yellowByPlayerMinute.get(key);
      const isHome = homePlayerIds.has(r.playerId);
      const team = isHome ? "HOME" : "AWAY";
      const p = playersById.get(r.playerId);

      if (pairedYellow) {
        consumedYellowKeys.add(key);
        result.push({
          id: r.id,
          type: "RED_CARD",
          minute: r.minute,
          team,
          playerId: r.playerId,
          playerName: p
            ? `${fullName(p)} (second yellow → red)`
            : "Unknown (second yellow → red)",
        });
      } else {
        result.push({
          id: r.id,
          type: "RED_CARD",
          minute: r.minute,
          team,
          playerId: r.playerId,
          playerName: p ? fullName(p) : undefined,
        });
      }
    }

    for (const y of yellows) {
      const key = `${y.playerId}:${y.minute}`;
      if (consumedYellowKeys.has(key)) continue;
      const isHome = homePlayerIds.has(y.playerId);
      const team = isHome ? "HOME" : "AWAY";
      const p = playersById.get(y.playerId);
      result.push({
        id: y.id,
        type: "YELLOW_CARD",
        minute: y.minute,
        team,
        playerId: y.playerId,
        playerName: p ? fullName(p) : undefined,
      });
    }

    // Substitutions: group off + on in the same minute and team
    const subsByTeamMinute = new Map<string, MatchStatLite[]>();
    for (const s of substitutions) {
      const isHome = homePlayerIds.has(s.playerId);
      const team = isHome ? "HOME" : "AWAY";
      const key = keyFor(team, s.minute);
      const list = subsByTeamMinute.get(key);
      if (list) list.push(s);
      else subsByTeamMinute.set(key, [s]);
    }

    for (const [key, list] of subsByTeamMinute.entries()) {
      if (list.length === 0) continue;
      const [teamLabel, minuteStr] = key.split(":");
      const minute = Number(minuteStr);
      const team = teamLabel === "HOME" ? "HOME" : "AWAY";

      const p1 = playersById.get(list[0].playerId);
      const p2 = list[1] ? playersById.get(list[1].playerId) : undefined;

      const label =
        p1 && p2
          ? `${fullName(p1)} → ${fullName(p2)}`
          : p1
            ? fullName(p1)
            : "Substitution";

      result.push({
        id: list[0].id,
        type: "SUBSTITUTION",
        minute,
        team,
        playerId: list[0].playerId,
        playerName: label,
      });
    }

    return result;
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
    onSuccess: () => {
      // Always refetch from server after create so we have the authoritative
      // list of stats (including yellow+red pairs, etc.) and avoid any
      // duplicated or flickering optimistic entries.
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
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
    onSuccess: () => {
      // After an edit, refetch from server to keep the list authoritative.
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
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
    onSuccess: () => {
      // Ensure we reflect the deletion from the backend, not just the
      // optimistic cache update.
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
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
          isSubmitting={createStatMutation.isPending}
          currentMinute={currentMinute}
        />
        <MatchVenue
          matchId={match.id}
          fixtureId={match.fixture.id}
          referee={match.fixture.referee ?? ""}
          stadium={match.fixture.stadium ?? ""}
        />
      </div>

      <LiveTimelineSection
        events={events}
        counters={{
          ...counters,
          ...cardCounters,
        }}
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
