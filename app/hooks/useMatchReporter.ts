"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/app/components/ToastProvider";
import { FixtureStatus } from "./useFixtures";

interface AssignReporterInput {
  fixtureId: number;
  reporterId: number | null;
  status?: FixtureStatus;
}

export function useAssignReporter() {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: async ({
      fixtureId,
      reporterId,
      status,
    }: AssignReporterInput) => {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId, reporterId, status }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error || "Failed to assign reporter");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      showSuccess("Reporter assigned successfully");
    },
    onError: (err: any) => {
      showError(err?.message || "Failed to assign reporter");
    },
  });
}
