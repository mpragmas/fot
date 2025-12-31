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
import { updateLeagueTableForMatch } from "@/app/lib/leagueTableService";

async function recomputeMatchScore(matchId: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      status: true,
      fixture: {
        select: {
          homeTeamId: true,
          awayTeamId: true,
        },
      },
    },
  });

  if (!match || !match.fixture) return;

  const { homeTeamId, awayTeamId } = match.fixture;

  const stats = await prisma.matchStat.findMany({
    where: {
      matchId,
      type: { in: ["GOAL", "OWN_GOAL"] },
    },
    select: {
      type: true,
      player: {
        select: {
          teamId: true,
        },
      },
    },
  });

  let home = 0;
  let away = 0;

  for (const s of stats) {
    const teamId = s.player?.teamId;
    if (teamId == null) continue;
    const isHome = teamId === homeTeamId;
    const isAway = teamId === awayTeamId;
    if (!isHome && !isAway) continue;

    if (s.type === "GOAL") {
      if (isHome) home += 1;
      else away += 1;
    } else {
      // OWN_GOAL
      if (isHome) away += 1;
      else home += 1;
    }
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { homeScore: home, awayScore: away },
  });

  if (match.status === "COMPLETED") {
    await updateLeagueTableForMatch(matchId);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; statId: string }> },
) {
  try {
    const { id, statId: statIdParam } = await params;
    const matchId = Number(id);
    const statId = Number(statIdParam);
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
  { params }: { params: Promise<{ id: string; statId: string }> },
) {
  try {
    ensureSocketStarted();

    const { id, statId: statIdParam } = await params;
    const matchId = Number(id);
    const statId = Number(statIdParam);
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
    await recomputeMatchScore(matchId);

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleError(e, "Failed to update match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; statId: string }> },
) {
  try {
    ensureSocketStarted();

    const { id, statId: statIdParam } = await params;
    const matchId = Number(id);
    const statId = Number(statIdParam);
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
    await recomputeMatchScore(matchId);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return handleError(e, "Failed to delete match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}
