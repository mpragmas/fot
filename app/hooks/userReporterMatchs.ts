"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { useMatchStatusSocket } from "./useMatchStatusSocket";

export type ReporterMatchStatus = "UPCOMING" | "LIVE" | "COMPLETED";

export type ApiMatch = {
  id: number;
  status: ReporterMatchStatus;
  reporterId: number | null;
  fixture: {
    id: number;
    date: string;
    stadium: string | null;
    homeTeam: { id: number; name: string };
    awayTeam: { id: number; name: string };
    season: { leagueId: number };
  };
};

export type ReporterMatchItem = {
  id: number;
  fixtureId: number;
  leagueId: number;
  homeTeamName: string;
  awayTeamName: string;
  date: string;
  dateFormatted: string;
  stadium: string | null;
  status: ReporterMatchStatus;
};

async function fetchReporterMatches(reporterId: number): Promise<ApiMatch[]> {
  const res = await fetch(`/api/matches?reporterId=${reporterId}`);
  if (!res.ok) throw new Error("Failed to fetch reporter matches");
  const data = await res.json();
  return data.data;
}

export function useReporterMatches() {
  const { data: session } = useSession();
  const reporterId = (session?.user as any)?.id;

  const query = useQuery<ApiMatch[]>({
    queryKey: ["matches", reporterId],
    queryFn: () => fetchReporterMatches(reporterId),
    enabled: !!reporterId,
    staleTime: 1000 * 60 * 2, // 2 mins, excessive re-fetching
  });

  useMatchStatusSocket(reporterId);

  const matches = useMemo<ReporterMatchItem[]>(() => {
    return (
      query.data?.map((m) => ({
        id: m.id,
        fixtureId: m.fixture.id,
        leagueId: m.fixture.season.leagueId,
        homeTeamName: m.fixture.homeTeam.name,
        awayTeamName: m.fixture.awayTeam.name,
        date: m.fixture.date,
        dateFormatted: new Date(m.fixture.date).toLocaleString(),
        stadium: m.fixture.stadium,
        status: m.status,
      })) ?? []
    );
  }, [query.data]);

  return {
    matches,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasReporter: !!reporterId,
  };
}
