import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const playerId = Number(params.id);
    if (!Number.isFinite(playerId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const stats = await prisma.playerStat.findMany({
      where: { playerId },
      select: {
        id: true,
        playerId: true,
        seasonId: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
        yellowCards: true,
        redCards: true,
      },
      orderBy: [{ seasonId: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(stats);
  } catch (e: unknown) {
    return handleError(e, "Failed to list player stats");
  }
}
