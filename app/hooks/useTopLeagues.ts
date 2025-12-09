"use client";

import { useQuery } from "@tanstack/react-query";

type League = {
  id: number;
  name: string;
  country: string;
};

interface LeaguesResponse {
  total: number;
  data: League[];
}

const fetchTopLeagues = async (): Promise<LeaguesResponse> => {
  const res = await fetch("/api/leagues?take=5");
  if (!res.ok) {
    throw new Error("Failed to fetch leagues");
  }
  return res.json();
};

export function useTopLeagues() {
  const query = useQuery<LeaguesResponse>({
    queryKey: ["top-leagues"],
    queryFn: fetchTopLeagues,
  });

  return {
    leagues: query.data?.data ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
