import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const seasonId = Number(id);
    if (!Number.isFinite(seasonId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const stats = await prisma.playerStat.findMany({
      where: { seasonId },
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
      orderBy: [
        { goals: "desc" },
        { assists: "desc" },
        { gamesPlayed: "desc" },
        { id: "asc" },
      ],
    });

    return NextResponse.json(stats);
  } catch (e: unknown) {
    return handleError(e, "Failed to list player stats for season");
  }
}
