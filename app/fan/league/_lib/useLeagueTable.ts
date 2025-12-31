import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/app/hooks/useMatchStatusSocket";

export type LeagueTableRow = {
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

export function useLeagueTable(leagueId: number, seasonId: number) {
  const queryClient = useQueryClient();

  const query = useQuery<LeagueTableRow[]>({
    queryKey: ["leagueTable", leagueId, seasonId],
    queryFn: async () => {
      const res = await fetch(
        `/api/leagues/${leagueId}/table?seasonId=${seasonId}`,
      );
      if (!res.ok) {
        throw new Error("Failed to load league table");
      }
      return (await res.json()) as LeagueTableRow[];
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !Number.isFinite(leagueId)) return;

    socket.emit("joinLeague", { leagueId });

    const handler = (payload: { leagueId: number }) => {
      if (payload.leagueId === leagueId) {
        queryClient.invalidateQueries({
          queryKey: ["leagueTable", leagueId, seasonId],
        });
      }
    };

    socket.on("leagueTable:update", handler);

    return () => {
      socket.off("leagueTable:update", handler);
    };
  }, [leagueId, seasonId, queryClient]);

  return query;
}
