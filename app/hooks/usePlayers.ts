"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ToastProvider";

// Raw API shape from /api/players
type ApiPlayer = {
  id: number;
  firstName: string;
  lastName: string | null;
  age: number | null;
  position: string;
  number: number;
  teamId: number | null;
  team?: { leagueId: number };
};

export type Player = {
  id: number;
  fullName: string;
  position: string;
  age: number | null;
  number: number;
  teamId: number | null;
  leagueId?: number;
};

interface PlayersResponse {
  total: number;
  data: ApiPlayer[];
}

interface PlayersQueryOptions {
  teamId?: number;
  name?: string;
  page?: number;
  pageSize?: number;
}

const fetchPlayers = async (
  options: PlayersQueryOptions,
): Promise<PlayersResponse> => {
  const params = new URLSearchParams();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;

  params.set("take", String(pageSize));
  params.set("skip", String((page - 1) * pageSize));

  if (options.teamId) params.set("teamId", String(options.teamId));
  if (options.name) params.set("name", options.name);

  const res = await fetch(`/api/players?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch players");
  }
  return res.json();
};

export function usePlayers(options: PlayersQueryOptions) {
  const query = useQuery<PlayersResponse>({
    queryKey: [
      "players",
      {
        teamId: options.teamId,
        name: options.name,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? 10,
      },
    ],
    queryFn: () => fetchPlayers(options),
  });

  return {
    players:
      query.data?.data.map((p) => ({
        id: p.id,
        fullName: p.lastName ? `${p.firstName} ${p.lastName}` : p.firstName,
        position: p.position,
        age: p.age,
        number: p.number,
        teamId: p.teamId,
        leagueId: p.team?.leagueId,
      })) ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

interface CreatePlayerInput {
  firstName: string;
  lastName?: string;
  position: string;
  age?: number;
  number?: number | null;
  teamId?: number | null;
}

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: CreatePlayerInput) => {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = typeof errorData?.error === "string" 
          ? errorData.error 
          : JSON.stringify(errorData?.error || "Failed to create player");
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      showSuccess("Player created successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to create player");
    },
  });
}

interface UpdatePlayerInput {
  id: number;
  firstName?: string;
  lastName?: string;
  position?: string;
  age?: number;
  number?: number | null;
  teamId?: number | null;
}

export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: UpdatePlayerInput) => {
      const { id, ...body } = input;
      const res = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = typeof errorData?.error === "string" 
          ? errorData.error 
          : JSON.stringify(errorData?.error || "Failed to update player");
        throw new Error(errorMessage);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      showSuccess("Player updated successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to update player");
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to delete player");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
      showSuccess("Player deleted successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to delete player");
    },
  });
}
