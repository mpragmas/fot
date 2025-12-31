import { useQuery } from "@tanstack/react-query";

export type SeasonTableRow = {
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  form?: ("W" | "D" | "L")[];
  nextOpponent?: string | null;
};

export type SeasonTableScope = "overall" | "home" | "away";

export function useSeasonTable(seasonId: number, scope: SeasonTableScope) {
  return useQuery<SeasonTableRow[]>({
    queryKey: ["seasonTable", seasonId, scope],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("scope", scope);
      const res = await fetch(
        `/api/seasons/${seasonId}/table?${params.toString()}`,
      );
      if (!res.ok) {
        throw new Error("Failed to load season table");
      }
      return (await res.json()) as SeasonTableRow[];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    // We only need the season table for home/away scopes; overall is covered
    // by the league table API for performance.
    enabled: Number.isFinite(seasonId) && scope !== "overall",
  });
}
