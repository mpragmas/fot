import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

type Scope = "overall" | "home" | "away";

type Standing = {
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
};

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
    const scopeParam = searchParams.get("scope") as Scope | null;
    const scope: Scope =
      scopeParam === "home" || scopeParam === "away" ? scopeParam : "overall";

    const fixtures = await prisma.fixture.findMany({
      where: {
        seasonId,
        match: {
          status: "COMPLETED",
        },
      },
      select: {
        id: true,
        homeTeamId: true,
        awayTeamId: true,
        homeTeam: {
          select: { id: true, name: true },
        },
        awayTeam: {
          select: { id: true, name: true },
        },
        match: {
          select: {
            id: true,
            stats: {
              select: {
                playerId: true,
                type: true,
                player: {
                  select: { teamId: true },
                },
              },
            },
          },
        },
      },
    });

    const standings = new Map<number, Standing>();

    const ensureTeam = (teamId: number, teamName: string): Standing => {
      let s = standings.get(teamId);
      if (!s) {
        s = {
          teamId,
          teamName,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDiff: 0,
          points: 0,
        };
        standings.set(teamId, s);
      }
      return s;
    };

    for (const fixture of fixtures) {
      const match = fixture.match;
      if (!match) continue;

      let homeGoals = 0;
      let awayGoals = 0;

      for (const stat of match.stats) {
        if (stat.type !== "GOAL") continue;
        const teamId = stat.player.teamId;
        if (teamId === fixture.homeTeamId) homeGoals += 1;
        else if (teamId === fixture.awayTeamId) awayGoals += 1;
      }

      const homeStanding = ensureTeam(
        fixture.homeTeam.id,
        fixture.homeTeam.name,
      );
      const awayStanding = ensureTeam(
        fixture.awayTeam.id,
        fixture.awayTeam.name,
      );

      const apply = (
        team: Standing,
        gf: number,
        ga: number,
        isHome: boolean,
      ) => {
        if (scope === "home" && !isHome) return;
        if (scope === "away" && isHome) return;

        team.played += 1;
        team.goalsFor += gf;
        team.goalsAgainst += ga;
        team.goalDiff = team.goalsFor - team.goalsAgainst;

        if (gf > ga) {
          team.wins += 1;
          team.points += 3;
        } else if (gf === ga) {
          team.draws += 1;
          team.points += 1;
        } else {
          team.losses += 1;
        }
      };

      apply(homeStanding, homeGoals, awayGoals, true);
      apply(awayStanding, awayGoals, homeGoals, false);
    }

    const table = Array.from(standings.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalDiff;
      const gdB = b.goalDiff;
      if (gdB !== gdA) return gdB - gdA;
      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
      return a.teamName.localeCompare(b.teamName);
    });

    return NextResponse.json(table);
  } catch (e: unknown) {
    return handleError(e, "Failed to compute league table");
  }
}
