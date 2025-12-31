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
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const seasonId = Number(id);
    if (!Number.isFinite(seasonId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const scopeParam = searchParams.get("scope") as Scope | null;
    const scope: Scope =
      scopeParam === "home" || scopeParam === "away" ? scopeParam : "overall";

    if (scope === "overall") {
      // Fast path: use incremental LeagueTable for overall standings.
      const rows = await prisma.leagueTable.findMany({
        where: { seasonId },
        include: { team: { select: { id: true, name: true } } },
        orderBy: [
          { points: "desc" },
          { goalDiff: "desc" },
          { goalsFor: "desc" },
          { team: { name: "asc" } },
        ],
      });

      const table: Standing[] = rows.map((r) => ({
        teamId: r.teamId,
        teamName: r.team.name,
        played: r.played,
        wins: r.wins,
        draws: r.draws,
        losses: r.losses,
        goalsFor: r.goalsFor,
        goalsAgainst: r.goalsAgainst,
        goalDiff: r.goalDiff,
        points: r.points,
      }));

      return NextResponse.json(table);
    }

    // Home/away scoped views are computed on the fly as they are used less often.
    // We need both completed matches (for standings/form) and upcoming fixtures
    // (for nextOpponent), so we do not filter by match status here; instead we
    // branch on status in-memory below.
    const fixtures = await prisma.fixture.findMany({
      where: {
        seasonId,
      },
      select: {
        id: true,
        date: true,
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
            status: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    const standings = new Map<number, Standing>();

    type FormEntry = "W" | "D" | "L";
    const formByTeam = new Map<number, FormEntry[]>();
    const nextOpponentByTeam = new Map<number, string | null>();

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

    const now = new Date();

    // Next opponent based on upcoming fixtures in this season.
    for (const fixture of fixtures) {
      const match = fixture.match;
      const isUpcoming =
        !match ||
        match.status === "UPCOMING" ||
        match.homeScore == null ||
        match.awayScore == null;
      if (!isUpcoming || fixture.date < now) continue;

      const homeName = fixture.homeTeam.name;
      const awayName = fixture.awayTeam.name;

      if (!nextOpponentByTeam.has(fixture.homeTeamId)) {
        nextOpponentByTeam.set(fixture.homeTeamId, awayName);
      }
      if (!nextOpponentByTeam.has(fixture.awayTeamId)) {
        nextOpponentByTeam.set(fixture.awayTeamId, homeName);
      }
    }

    for (const fixture of fixtures) {
      const match = fixture.match;
      if (!match || match.status !== "COMPLETED") continue;

      // Ignore matches that do not have explicit scores yet so we do not
      // accidentally treat missing scores as 0-0 draws.
      if (match.homeScore == null || match.awayScore == null) continue;

      const homeGoals = match.homeScore;
      const awayGoals = match.awayScore;

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

      // Track form by scope (home/away) for this season. Overall scope is
      // handled by the leagueTable fast path above.
      const addForm = (teamId: number, entry: FormEntry) => {
        const arr = formByTeam.get(teamId) ?? [];
        arr.push(entry);
        if (arr.length > 5) arr.shift();
        formByTeam.set(teamId, arr);
      };

      if (scope === "home") {
        // Home scope: track only the home team's form.
        if (homeGoals > awayGoals) {
          addForm(fixture.homeTeamId, "W");
        } else if (homeGoals < awayGoals) {
          addForm(fixture.homeTeamId, "L");
        } else {
          addForm(fixture.homeTeamId, "D");
        }
      } else {
        // scope === "away" - track only the away team's form.
        if (homeGoals > awayGoals) {
          addForm(fixture.awayTeamId, "L");
        } else if (homeGoals < awayGoals) {
          addForm(fixture.awayTeamId, "W");
        } else {
          addForm(fixture.awayTeamId, "D");
        }
      }
    }

    const table = Array.from(standings.values())
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const gdA = a.goalDiff;
        const gdB = b.goalDiff;
        if (gdB !== gdA) return gdB - gdA;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      })
      .map((row) => ({
        ...row,
        form: formByTeam.get(row.teamId),
        nextOpponent: nextOpponentByTeam.get(row.teamId) ?? null,
      }));

    return NextResponse.json(table);
  } catch (e: unknown) {
    return handleError(e, "Failed to compute league table");
  }
}
