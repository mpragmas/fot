"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { ReporterMatchStatus } from "./userReporterMatchs";
import type { ApiFixture, FixtureStatus, MatchPhase } from "./useFixtures";

let socket: Socket | null = null;

// Optimize: Singleton connection to avoid multiple handshakes
export function getSocket() {
  if (!socket) {
    socket = io("http://localhost:4000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
  }
  return socket;
}

export function useMatchStatusSocket(reporterId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socketInstance = getSocket();

    if (!socketInstance.connected) {
      socketInstance.connect();
    }

    const handler = (payload: {
      id: number;
      status?: ReporterMatchStatus;
      phase?: MatchPhase | null;
      elapsedSeconds?: number;
      clockStartedAt?: string | null;
      clockPausedAt?: string | null;
      clockStoppedAt?: string | null;
    }) => {
      if (!payload.id) return;

      // Beast Mode: Surgical update of the cache.
      // 1) Reporter matches lists for this reporter
      if (payload.status) {
        queryClient.setQueriesData<{ data: any[]; total: number }>(
          { queryKey: ["matches", reporterId] },
          (old) => {
            if (!old || !old.data || !Array.isArray(old.data)) return old;

            const matchExists = old.data.some((m) => m.id === payload.id);
            if (!matchExists) return old;

            return {
              ...old,
              data: old.data.map((m) =>
                m.id === payload.id ? { ...m, status: payload.status } : m,
              ),
            };
          },
        );
      }

      // 2) Single match detail page: ["match", matchId]
      queryClient.setQueryData(["match", payload.id], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          ...(payload.status ? { status: payload.status } : {}),
          ...(payload.phase ? { phase: payload.phase } : {}),
          ...(typeof payload.elapsedSeconds === "number"
            ? { elapsedSeconds: payload.elapsedSeconds }
            : {}),
          ...(payload.clockStartedAt !== undefined
            ? { clockStartedAt: payload.clockStartedAt }
            : {}),
        };
      });

      // 3) Admin fixtures list: ["fixtures"]
      queryClient.setQueryData<ApiFixture[]>(["fixtures"], (old) => {
        if (!old || !Array.isArray(old)) return old;

        let changed = false;
        const next = old.map((fixture) => {
          if (!fixture.match || fixture.match.id !== payload.id) return fixture;
          if (
            !payload.status &&
            payload.phase == null &&
            payload.elapsedSeconds == null
          ) {
            return fixture;
          }
          changed = true;
          return {
            ...fixture,
            match: {
              ...fixture.match,
              ...(payload.status
                ? { status: payload.status as FixtureStatus }
                : {}),
              ...(payload.phase !== undefined && payload.phase !== null
                ? { phase: payload.phase }
                : {}),
              ...(typeof payload.elapsedSeconds === "number"
                ? { elapsedSeconds: payload.elapsedSeconds }
                : {}),
            },
          };
        });

        return changed ? next : old;
      });
    };

    socketInstance.on("matchUpdated", handler);

    return () => {
      socketInstance.off("matchUpdated", handler);
    };
  }, [reporterId, queryClient]);
}
