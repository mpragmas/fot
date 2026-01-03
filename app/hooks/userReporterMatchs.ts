"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { useMatchStatusSocket } from "./useMatchStatusSocket";

export type ReporterMatchStatus =
  | "UPCOMING"
  | "LIVE"
  | "COMPLETED"
  | "POSTPONED";

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

interface ReporterMatchesOptions {
  search?: string;
  status?: ReporterMatchStatus | "";
  orderBy?: string;
  order?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

interface MatchesResponse {
  total: number;
  data: ApiMatch[];
}

async function fetchReporterMatches(
  reporterId: number,
  options: ReporterMatchesOptions,
): Promise<MatchesResponse> {
  const params = new URLSearchParams();
  params.set("reporterId", String(reporterId));
  if (options.search) params.set("teamName", options.search);
  if (options.status) params.set("status", options.status);
  if (options.orderBy) params.set("orderBy", options.orderBy);
  if (options.order) params.set("order", options.order);
  params.set("page", String(options.page || 1));
  params.set("pageSize", String(options.pageSize || 10));

  const res = await fetch(`/api/matches?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch reporter matches");
  return res.json();
}

export function useReporterMatches(options: ReporterMatchesOptions = {}) {
  const { data: session } = useSession();
  const reporterId = (session?.user as any)?.id;

  const query = useQuery<MatchesResponse>({
    queryKey: ["matches", reporterId, options],
    queryFn: () => fetchReporterMatches(reporterId, options),
    enabled: !!reporterId,
    staleTime: 1000 * 60 * 2, // 2 mins
    // Background polling so assigned matches update without manual reload
    refetchInterval: 5000,
  });

  useMatchStatusSocket(reporterId);

  const matches = useMemo<ReporterMatchItem[]>(() => {
    return (
      query.data?.data.map((m) => ({
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
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasReporter: !!reporterId,
  };
}
