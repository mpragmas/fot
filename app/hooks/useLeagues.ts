"use client";

import { useQuery } from "@tanstack/react-query";

export type LeagueOption = {
  id: number;
  name: string;
};

interface LeaguesResponse {
  total: number;
  data: { id: number; name: string }[];
}

const fetchLeagues = async (): Promise<LeaguesResponse> => {
  const res = await fetch("/api/leagues?take=100");
  if (!res.ok) {
    throw new Error("Failed to fetch leagues");
  }
  return res.json();
};

export function useLeagues() {
  const query = useQuery<LeaguesResponse>({
    queryKey: ["leagues"],
    queryFn: fetchLeagues,
  });

  return {
    leagues: query.data?.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
