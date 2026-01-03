import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { createMatchStatSchema } from "@/app/lib/validationSchema";
import { ensureSocketStarted, emitStat } from "@/app/lib/socket";
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
      type: { in: ["GOAL", "OWN_GOAL", "PENALTY_GOAL"] },
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

    if (s.type === "GOAL" || s.type === "PENALTY_GOAL") {
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const matchId = Number(id);
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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    ensureSocketStarted();

    const { id } = await params;
    const matchId = Number(id);
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

    if (type !== "YELLOW_CARD") {
      // For all non-yellow stats, make creation idempotent on
      // (matchId, playerId, type, minute) so rapid double-clicks or
      // network retries don't create duplicate rows.
      const existing = await prisma.matchStat.findFirst({
        where: { matchId, playerId, type, minute },
      });
      if (existing) {
        emitStat(matchId, existing);
        return NextResponse.json(existing, { status: 200 });
      }

      const stat = await prisma.matchStat.create({
        data: { matchId, playerId, type, minute },
      });

      emitStat(matchId, stat);

      await recomputePlayerStatsForMatch(matchId);
      await recomputeMatchScore(matchId);

      return NextResponse.json(stat, { status: 201 });
    }

    const previousYellows = await prisma.matchStat.count({
      where: { matchId, playerId, type: "YELLOW_CARD" },
    });

    const created = await prisma.$transaction(async (tx) => {
      const yellow = await tx.matchStat.create({
        data: { matchId, playerId, type: "YELLOW_CARD", minute },
      });

      if (previousYellows >= 1) {
        const red = await tx.matchStat.create({
          data: { matchId, playerId, type: "RED_CARD", minute },
        });
        return { yellow, red };
      }

      return { yellow };
    });

    emitStat(matchId, created.yellow);
    if (created.red) emitStat(matchId, created.red);

    await recomputePlayerStatsForMatch(matchId);
    await recomputeMatchScore(matchId);

    return NextResponse.json(
      created.red ? [created.yellow, created.red] : created.yellow,
      {
        status: 201,
      },
    );
  } catch (e: unknown) {
    return handleError(e, "Failed to create match stat", {
      notFoundCodes: ["P2025"],
    });
  }
}
