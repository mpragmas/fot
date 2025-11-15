import { Server, type Socket } from "socket.io";
import type { Lineup, MatchStat } from "../generated/prisma/client";

export type ClientToServerEvents = {
  join: (payload: { matchId: number }) => void;
};

export type ServerToClientEvents = {
  "stats:new": (payload: { matchId: number; stat: MatchStat }) => void;
  "stats:update": (payload: { matchId: number; stat: MatchStat }) => void;
  "stats:delete": (payload: { matchId: number; statId: number }) => void;
  "lineup:update": (payload: { matchId: number; lineups: Lineup[] }) => void;
};

declare global {
  // eslint-disable-next-line no-var
  var __io: Server<ClientToServerEvents, ServerToClientEvents> | undefined;
}

function roomName(matchId: number): string {
  return `match:${matchId}`;
}

export function getIO(): Server<ClientToServerEvents, ServerToClientEvents> {
  if (!globalThis.__io) {
    const port = Number(process.env.SOCKET_PORT ?? 4002);
    const io = new Server<ClientToServerEvents, ServerToClientEvents>(port, {
      cors: { origin: "*" },
      serveClient: false,
    });

    io.on(
      "connection",
      (
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
      ): void => {
        socket.on("join", ({ matchId }: { matchId: number }) => {
          if (Number.isFinite(matchId)) {
            socket.join(roomName(matchId));
          }
        });
      },
    );

    globalThis.__io = io;
    // eslint-disable-next-line no-console
    console.log(`[realtime] Socket.IO listening on :${port}`);
  }
  return globalThis.__io as Server<ClientToServerEvents, ServerToClientEvents>;
}

export function ensureSocketStarted(): void {
  if (!globalThis.__io) getIO();
}

export function emitStat(matchId: number, stat: MatchStat): void {
  const io = getIO();
  io.to(roomName(matchId)).emit("stats:new", { matchId, stat });
}

export function emitStatUpdated(matchId: number, stat: MatchStat): void {
  const io = getIO();
  io.to(roomName(matchId)).emit("stats:update", { matchId, stat });
}

export function emitStatDeleted(matchId: number, statId: number): void {
  const io = getIO();
  io.to(roomName(matchId)).emit("stats:delete", { matchId, statId });
}

export function emitLineup(matchId: number, lineups: Lineup[]): void {
  const io = getIO();
  io.to(roomName(matchId)).emit("lineup:update", { matchId, lineups });
}
