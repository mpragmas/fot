import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: {
        fixture: {
          select: {
            homeTeamId: true,
            awayTeamId: true,
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!match || !match.fixture) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { homeTeamId, awayTeamId, homeTeam, awayTeam } = match.fixture;

    const stats = await prisma.matchStat.findMany({
      where: { matchId, type: "GOAL" },
      select: {
        playerId: true,
        player: {
          select: {
            teamId: true,
          },
        },
      },
    });

    type Scorer = { playerId: number; goals: number };

    const homeScorers = new Map<number, Scorer>();
    const awayScorers = new Map<number, Scorer>();

    for (const stat of stats) {
      const teamId = stat.player.teamId;
      const isHome = teamId === homeTeamId;
      const bucket = isHome
        ? homeScorers
        : teamId === awayTeamId
          ? awayScorers
          : null;

      if (!bucket) continue;

      let entry = bucket.get(stat.playerId);
      if (!entry) {
        entry = { playerId: stat.playerId, goals: 0 };
        bucket.set(stat.playerId, entry);
      }
      entry.goals += 1;
    }

    const homeScorersArr = Array.from(homeScorers.values()).sort(
      (a, b) => b.goals - a.goals || a.playerId - b.playerId,
    );
    const awayScorersArr = Array.from(awayScorers.values()).sort(
      (a, b) => b.goals - a.goals || a.playerId - b.playerId,
    );

    const response = {
      homeTeam: {
        teamId: homeTeam.id,
        teamName: homeTeam.name,
        goals: homeScorersArr.reduce((sum, s) => sum + s.goals, 0),
        scorers: homeScorersArr,
      },
      awayTeam: {
        teamId: awayTeam.id,
        teamName: awayTeam.name,
        goals: awayScorersArr.reduce((sum, s) => sum + s.goals, 0),
        scorers: awayScorersArr,
      },
    };

    return NextResponse.json(response);
  } catch (e: unknown) {
    return handleError(e, "Failed to list match scorers");
  }
}
