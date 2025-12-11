"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";

let socket: Socket | null = null;

export function useMatchStatusSocket(reporterId?: number | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!reporterId) return;

    if (!socket) {
      socket = io("http://localhost:4000", {
        transports: ["websocket"],
      });
    }

    const handler = (payload: { id: number; status: string }) => {
      queryClient.setQueryData(["matches", reporterId], (old: unknown) => {
        if (!Array.isArray(old)) return old;

        return old.map((m) =>
          m && typeof m === "object" && (m as any).id === payload.id
            ? { ...(m as any), status: payload.status }
            : m,
        );
      });
    };

    socket.on("matchUpdated", handler);

    return () => {
      socket?.off("matchUpdated", handler);
    };
  }, [reporterId, queryClient]);
}
