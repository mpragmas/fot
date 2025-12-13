import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReporterMatchStatus } from "./userReporterMatchs";

export function useMatchControls(matchId: number) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async (status: ReporterMatchStatus) => {
      const res = await fetch(`/api/matches/${matchId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    // Beast Mode: Optimistic Update
    onMutate: async (newStatus) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ["match", matchId] });
      await queryClient.cancelQueries({ queryKey: ["matches"] });

      // Snapshot the previous value
      const previousMatch = queryClient.getQueryData(["match", matchId]);

      // Optimistically update to the new value
      queryClient.setQueryData(["match", matchId], (old: any) => {
        if (!old) return old;
        return { ...old, status: newStatus };
      });

      // Also update the list view if it exists
      queryClient.setQueriesData({ queryKey: ["matches"] }, (old: any) => {
        if (!old || !old.data || !Array.isArray(old.data)) return old;
        return {
          ...old,
          data: old.data.map((m: any) =>
            m.id === matchId ? { ...m, status: newStatus } : m,
          ),
        };
      });

      return { previousMatch };
    },
    onError: (err, newStatus, context) => {
      // Rollback on error
      if (context?.previousMatch) {
        queryClient.setQueryData(["match", matchId], context.previousMatch);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data sync
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });

  return {
    startMatch: () => updateStatus.mutate("LIVE"),
    endFirstHalf: () => updateStatus.mutate("LIVE"), // Potentially "PAUSED" if we support halves
    startSecondHalf: () => updateStatus.mutate("LIVE"),
    endMatch: () => updateStatus.mutate("COMPLETED"),
    isLoading: updateStatus.isPending,
  };
}
