"use client";

import { useQuery } from "@tanstack/react-query";

export type SeasonOption = {
  id: number;
  year: string;
  leagueId: number;
};

interface SeasonsResponse {
  total: number;
  data: {
    id: number;
    year: string;
    leagueId: number;
  }[];
}

async function fetchSeasons(leagueId?: number): Promise<SeasonsResponse> {
  const params = new URLSearchParams();
  params.set("take", "100");
  if (leagueId) params.set("leagueId", String(leagueId));

  const res = await fetch(`/api/seasons?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch seasons");
  }
  return res.json();
}

export function useSeasons(leagueId?: number) {
  const query = useQuery<SeasonsResponse>({
    queryKey: ["seasons", { leagueId }],
    queryFn: () => fetchSeasons(leagueId),
  });

  return {
    seasons:
      query.data?.data.map((s) => ({
        id: s.id,
        year: s.year,
        leagueId: s.leagueId,
      })) ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
