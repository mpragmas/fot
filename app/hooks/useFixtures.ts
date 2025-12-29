"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ToastProvider";

export type FixtureStatus = "UPCOMING" | "LIVE" | "COMPLETED";

export type MatchPhase =
  | "PRE"
  | "FIRST_HALF"
  | "HT"
  | "SECOND_HALF"
  | "ET"
  | "FT";

export type ApiFixture = {
  id: number;
  season: {
    id: number;
    leagueId: number;
    league: {
      id: number;
      name: string;
      country: string;
    };
  };
  homeTeam: {
    id: number;
    name: string;
    players: { id: number }[];
  };
  awayTeam: {
    id: number;
    name: string;
    players: { id: number }[];
  };
  match: {
    id: number;
    status: FixtureStatus;
    phase: MatchPhase;
    elapsedSeconds: number;
    clockStartedAt: string | null;
    reporterId: number | null;
    reporter: {
      id: number;
      name: string | null;
    } | null;
    stats: {
      id: number;
      playerId: number;
      type: "GOAL" | "OWN_GOAL";
      minute: number;
      // player relation might or might not be loaded; it's not required for score calc
      player?: {
        teamId: number | null;
      } | null;
    }[];
  } | null;
  date: string;
  stadium: string | null;
  roundNumber: number;
};

export type FixtureItem = {
  id: number;
  leagueId: number;
  leagueName: string;
  leagueCountry: string;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  date: string;
  stadium: string | null;
  roundNumber: number;
  status: FixtureStatus;
  phase: MatchPhase | null;
  elapsedSeconds: number | null;
  clockStartedAt: string | null;
  homeScore: number;
  awayScore: number;
  reporterId: number | null;
  reporterName: string | null;
};

function computeScoreFromStats(
  stats: {
    playerId: number;
    type: "GOAL" | "OWN_GOAL";
  }[],
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
    } else if (s.type === "OWN_GOAL") {
      if (isHomePlayer) away += 1;
      else home += 1;
    }
  }

  return { home, away };
}

async function fetchFixtures(): Promise<ApiFixture[]> {
  const res = await fetch("/api/fixtures");
  if (!res.ok) {
    throw new Error("Failed to fetch fixtures");
  }
  return res.json();
}

export function useFixtures() {
  const query = useQuery<ApiFixture[]>({
    queryKey: ["fixtures"],
    queryFn: fetchFixtures,
    // Poll in the background so LIVE status & minutes update without reload
    refetchInterval: 5000,
  });

  const fixtures: FixtureItem[] =
    query.data?.map((f) => ({
      id: f.id,
      leagueId: f.season.leagueId,
      leagueName: f.season.league.name,
      leagueCountry: f.season.league.country,
      homeTeamId: f.homeTeam.id,
      homeTeamName: f.homeTeam.name,
      awayTeamId: f.awayTeam.id,
      awayTeamName: f.awayTeam.name,
      date: f.date,
      stadium: f.stadium,
      roundNumber: f.roundNumber,
      status: f.match?.status ?? "UPCOMING",
      phase: f.match?.phase ?? null,
      elapsedSeconds: f.match?.elapsedSeconds ?? null,
      clockStartedAt: f.match?.clockStartedAt ?? null,
      ...(() => {
        if (!f.match) return { homeScore: 0, awayScore: 0 };
        const stats = (f.match.stats ?? []).filter((s) =>
          ["GOAL", "OWN_GOAL"].includes(s.type),
        );
        if (!stats.length) return { homeScore: 0, awayScore: 0 };
        const homeIds = new Set(f.homeTeam.players.map((p) => p.id));
        const awayIds = new Set(f.awayTeam.players.map((p) => p.id));
        return computeScoreFromStats(stats, homeIds, awayIds);
      })(),
      reporterId: f.match?.reporterId ?? null,
      reporterName: f.match?.reporter?.name ?? null,
    })) ?? [];

  return {
    fixtures,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

// ---- CRUD hooks ----

interface CreateFixtureInput {
  seasonId: number;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  stadium?: string;
  referee?: string;
  roundNumber?: number;
}

interface UpdateFixtureInput {
  id: number;
  seasonId?: number;
  homeTeamId?: number;
  awayTeamId?: number;
  date?: string;
  stadium?: string | null;
  referee?: string | null;
  roundNumber?: number;
}

export function useCreateFixture() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: CreateFixtureInput) => {
      const res = await fetch("/api/fixtures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to create fixture");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      showSuccess("Fixture created successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to create fixture");
    },
  });
}

export function useUpdateFixture() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateFixtureInput) => {
      const { id, ...body } = input;
      const res = await fetch(`/api/fixtures/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to update fixture");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      showSuccess("Fixture updated successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to update fixture");
    },
  });
}

export function useDeleteFixture() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/fixtures/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to delete fixture");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      showSuccess("Fixture deleted successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to delete fixture");
    },
  });
}
