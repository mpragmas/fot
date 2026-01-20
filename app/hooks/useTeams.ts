"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ToastProvider";

// Raw shape returned by /api/teams (includes nested league object)
type ApiTeam = {
  id: number;
  name: string;
  logo: string | null;
  coach: string | null;
  location: string | null;
  leagueId: number;
  league: {
    id: number;
    name: string;
    country: string;
    createdAt: string;
    updatedAt: string;
  };
  _count: {
    players: number;
  };
};

export type Team = {
  id: number;
  name: string;
  logo: string | null;
  leagueName: string;
  coach: string | null;
  location: string | null;
  playersCount: number;
};

interface TeamsResponse {
  total: number;
  data: ApiTeam[];
}

interface TeamsQueryOptions {
  leagueId?: number;
  page?: number;
  pageSize?: number;
}

const fetchTeams = async (
  options: TeamsQueryOptions = {},
): Promise<TeamsResponse> => {
  const params = new URLSearchParams();
  const page = options.page ?? 1;
  const pageSize = options.pageSize ?? 10;

  params.set("take", String(pageSize));
  params.set("skip", String((page - 1) * pageSize));

  if (options.leagueId) params.set("leagueId", String(options.leagueId));

  const res = await fetch(`/api/teams?${params.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch teams");
  }
  return res.json();
};

type UseTeamsArg = number | undefined | TeamsQueryOptions;

export function useTeams(arg?: UseTeamsArg) {
  const leagueId = typeof arg === "number" ? arg : arg?.leagueId;
  const page =
    typeof arg === "object" && arg !== null && "page" in arg ? arg.page : 1;
  const pageSize =
    typeof arg === "object" && arg !== null && "pageSize" in arg
      ? arg.pageSize
      : 10;

  const query = useQuery<TeamsResponse>({
    queryKey: ["teams", { leagueId, page, pageSize }],
    queryFn: () => fetchTeams({ leagueId, page, pageSize }),
  });

  return {
    teams:
      query.data?.data.map((t) => ({
        id: t.id,
        name: t.name,
        logo: t.logo,
        leagueName: t.league?.name ?? "",
        coach: t.coach,
        location: t.location,
        playersCount: t._count?.players ?? 0,
      })) ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}

interface CreateTeamInput {
  name: string;
  leagueId: number;
  coach?: string;
  location?: string;
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to create team");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      showSuccess("Team created successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to create team");
    },
  });
}

interface UpdateTeamInput {
  id: number;
  name?: string;
  leagueId?: number;
  coach?: string | null;
  location?: string | null;
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (input: UpdateTeamInput) => {
      const { id, ...body } = input;
      const res = await fetch(`/api/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to update team");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      showSuccess("Team updated successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to update team");
    },
  });
}

export function useDeactivateTeam() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/teams/${id}/deactivate`, {
        method: "POST",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to deactivate team");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      showSuccess("Team deactivated successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to deactivate team");
    },
  });
}
