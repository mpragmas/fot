import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const seasonId = Number(params.id);
    if (!Number.isFinite(seasonId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : 10;

    const stats = await prisma.playerStat.findMany({
      where: { seasonId },
      select: {
        playerId: true,
        seasonId: true,
        gamesPlayed: true,
        goals: true,
        assists: true,
      },
      orderBy: [
        { goals: "desc" },
        { assists: "desc" },
        { gamesPlayed: "desc" },
        { playerId: "asc" },
      ],
      take: Number.isFinite(limit) && limit > 0 ? limit : 10,
    });

    return NextResponse.json(stats);
  } catch (e: unknown) {
    return handleError(e, "Failed to list top scorers");
  }
}
