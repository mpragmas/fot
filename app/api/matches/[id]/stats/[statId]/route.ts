import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchMatchStatSchema } from "@/app/lib/validationSchema";
import {
  ensureSocketStarted,
  emitStatDeleted,
  emitStatUpdated,
} from "@/app/lib/socket";
import { recomputePlayerStatsForMatch } from "@/app/lib/playerStats";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; statId: string } },
) {
  try {
    const matchId = Number(params.id);
    const statId = Number(params.statId);
    if (!Number.isFinite(matchId) || !Number.isFinite(statId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const stat = await prisma.matchStat.findUnique({
      where: { id: statId },
      include: { player: true },
    });
    if (!stat || stat.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(stat);
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch match stat");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; statId: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    const statId = Number(params.statId);
    if (!Number.isFinite(matchId) || !Number.isFinite(statId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchMatchStatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const existing = await prisma.matchStat.findUnique({
      where: { id: statId },
    });
    if (!existing || existing.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.matchStat.update({
      where: { id: statId },
      data: parsed.data,
    });

    emitStatUpdated(matchId, updated);

    await recomputePlayerStatsForMatch(matchId);

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleError(e, "Failed to update match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; statId: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    const statId = Number(params.statId);
    if (!Number.isFinite(matchId) || !Number.isFinite(statId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.matchStat.findUnique({
      where: { id: statId },
    });
    if (!existing || existing.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.matchStat.delete({ where: { id: statId } });

    emitStatDeleted(matchId, statId);

    await recomputePlayerStatsForMatch(matchId);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return handleError(e, "Failed to delete match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}
