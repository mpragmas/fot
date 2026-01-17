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

/**
 * ⚠️ IMPORTANT RULE:
 * This function MUST be DB-ONLY.
 * ❌ NO socket emits
 * ❌ NO stats fetching beyond what is needed
 */
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
      type: { in: ["GOAL", "OWN_GOAL", "PENALTY_GOAL"] },
    },
    select: {
      type: true,
      player: { select: { teamId: true } },
    },
  });

  let home = 0;
  let away = 0;

  for (const s of stats) {
    const teamId = s.player?.teamId;
    if (!teamId) continue;

    const isHome = teamId === homeTeamId;
    const isAway = teamId === awayTeamId;
    if (!isHome && !isAway) continue;

    if (s.type === "GOAL" || s.type === "PENALTY_GOAL") {
      isHome ? home++ : away++;
    } else {
      // OWN_GOAL
      isHome ? away++ : home++;
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

/* -------------------------------- GET -------------------------------- */

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
  } catch (e) {
    return handleError(e, "Failed to fetch match stat");
  }
}

/* -------------------------------- PATCH -------------------------------- */

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

    // ✅ emit ONLY mutation
    emitStatUpdated(matchId, updated);

    await recomputePlayerStatsForMatch(matchId);
    await recomputeMatchScore(matchId);

    return NextResponse.json(updated);
  } catch (e) {
    return handleError(e, "Failed to update match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}

/* -------------------------------- DELETE -------------------------------- */

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

    // 🔴 RED CARD → also delete matching yellow(s)
    if (existing.type === "RED_CARD") {
      const yellows = await prisma.matchStat.findMany({
        where: {
          matchId,
          playerId: existing.playerId,
          type: "YELLOW_CARD",
          minute: existing.minute,
        },
        select: { id: true },
      });

      await prisma.$transaction(async (tx) => {
        await tx.matchStat.delete({ where: { id: statId } });
        await tx.matchStat.deleteMany({
          where: {
            matchId,
            playerId: existing.playerId,
            type: "YELLOW_CARD",
            minute: existing.minute,
          },
        });
      });

      emitStatDeleted(matchId, statId);
      yellows.forEach((y) => emitStatDeleted(matchId, y.id));
    }

    // 🔴 GOAL → also delete assists
    else if (
      existing.type === "GOAL" ||
      existing.type === "OWN_GOAL" ||
      existing.type === "PENALTY_GOAL"
    ) {
      const assists = await prisma.matchStat.findMany({
        where: {
          matchId,
          type: "ASSIST",
          minute: existing.minute,
        },
        select: { id: true },
      });

      await prisma.$transaction(async (tx) => {
        await tx.matchStat.delete({ where: { id: statId } });
        await tx.matchStat.deleteMany({
          where: {
            matchId,
            type: "ASSIST",
            minute: existing.minute,
          },
        });
      });

      emitStatDeleted(matchId, statId);
      assists.forEach((a) => emitStatDeleted(matchId, a.id));
    }

    // 🔴 NORMAL DELETE
    else {
      await prisma.matchStat.delete({ where: { id: statId } });
      emitStatDeleted(matchId, statId);
    }

    await recomputePlayerStatsForMatch(matchId);
    await recomputeMatchScore(matchId);

    return NextResponse.json({ success: true });
  } catch (e) {
    return handleError(e, "Failed to delete match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}
