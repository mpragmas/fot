"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ToastProvider";

export type FixtureStatus = "UPCOMING" | "LIVE" | "COMPLETED";

export type ApiFixture = {
  id: number;
  season: {
    id: number;
    leagueId: number;
  };
  homeTeam: {
    id: number;
    name: string;
  };
  awayTeam: {
    id: number;
    name: string;
  };
  match: {
    id: number;
    status: FixtureStatus;
    reporterId: number | null;
    reporter: {
      id: number;
      name: string | null;
    } | null;
  } | null;
  date: string;
  stadium: string | null;
  roundNumber: number;
};

export type FixtureItem = {
  id: number;
  leagueId: number;
  homeTeamId: number;
  homeTeamName: string;
  awayTeamId: number;
  awayTeamName: string;
  date: string;
  stadium: string | null;
  roundNumber: number;
  status: FixtureStatus;
  reporterId: number | null;
  reporterName: string | null;
};

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
  });

  const fixtures: FixtureItem[] =
    query.data?.map((f) => ({
      id: f.id,
      leagueId: f.season.leagueId,
      homeTeamId: f.homeTeam.id,
      homeTeamName: f.homeTeam.name,
      awayTeamId: f.awayTeam.id,
      awayTeamName: f.awayTeam.name,
      date: f.date,
      stadium: f.stadium,
      roundNumber: f.roundNumber,
      status: f.match?.status ?? "UPCOMING",
      reporterId: f.match?.reporterId ?? null,
      reporterName: f.match?.reporter?.name ?? null,
    })) ?? [];

  return {
    fixtures,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
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
