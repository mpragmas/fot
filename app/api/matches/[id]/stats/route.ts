import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { createMatchStatSchema } from "@/app/lib/validationSchema";
import { ensureSocketStarted, emitStat } from "@/app/lib/socket";
import { recomputePlayerStatsForMatch } from "@/app/lib/playerStats";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const stats = await prisma.matchStat.findMany({
      where: { matchId },
      orderBy: [{ minute: "asc" }, { id: "asc" }],
      include: { player: true },
    });

    return NextResponse.json(stats);
  } catch (e: unknown) {
    return handleError(e, "Failed to list stats");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = createMatchStatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { playerId, type, minute } = parsed.data;

    const stat = await prisma.matchStat.create({
      data: { matchId, playerId, type, minute },
    });

    emitStat(matchId, stat);

    await recomputePlayerStatsForMatch(matchId);

    return NextResponse.json(stat, { status: 201 });
  } catch (e: unknown) {
    return handleError(e, "Failed to create match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}
