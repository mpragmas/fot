import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MatchClockAction } from "@/app/api/matches/[id]/clock/route";
import type { ReporterMatchStatus } from "./userReporterMatchs";

export function useMatchClockControls(matchId: number) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (action: MatchClockAction) => {
      const res = await fetch(`/api/matches/${matchId}/clock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update match clock");
      return res.json();
    },
    onSuccess: (updated) => {
      // Update single match cache; socket will also broadcast
      queryClient.setQueryData(["match", matchId], (old: any) => ({
        ...old,
        ...updated,
      }));

      // Also keep reporter matches list roughly in sync for status
      queryClient.setQueriesData<{ data: any[]; total: number }>(
        { queryKey: ["matches"] },
        (old) => {
          if (!old || !old.data || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((m) =>
              m.id === matchId
                ? { ...m, status: updated.status as ReporterMatchStatus }
                : m,
            ),
          };
        },
      );
    },
  });

  return {
    startFirstHalf: () => mutation.mutate("START_FIRST_HALF"),
    endFirstHalf: () => mutation.mutate("END_FIRST_HALF"),
    startSecondHalf: () => mutation.mutate("START_SECOND_HALF"),
    addExtraTime: (minutes: number) => {
      // Frontend can still optimistically gate, but backend is authority
      mutation.mutate("ADD_EXTRA_TIME");
    },
    endMatch: () => mutation.mutate("END_MATCH"),
    isLoading: mutation.isPending,
  };
}
