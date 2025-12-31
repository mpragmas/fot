import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const leagueIdNum = Number(id);
    if (!Number.isFinite(leagueIdNum)) {
      return NextResponse.json({ error: "Invalid league id" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const seasonIdParam = searchParams.get("seasonId");
    const seasonId = seasonIdParam ? Number(seasonIdParam) : NaN;

    if (!Number.isFinite(seasonId)) {
      return NextResponse.json(
        { error: "seasonId query param is required" },
        { status: 400 },
      );
    }

    const rows = await prisma.leagueTable.findMany({
      where: {
        leagueId: leagueIdNum,
        seasonId,
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { points: "desc" },
        { goalDiff: "desc" },
        { goalsFor: "desc" },
        { team: { name: "asc" } },
      ],
    });

    if (rows.length > 0) {
      // Compute recent form and next opponent per team from fixtures. We keep
      // this reasonably light by working only within the current season.
      const fixtures = await prisma.fixture.findMany({
        where: {
          seasonId,
          season: { leagueId: leagueIdNum },
        },
        select: {
          date: true,
          homeTeamId: true,
          awayTeamId: true,
          homeTeam: { select: { id: true, name: true } },
          awayTeam: { select: { id: true, name: true } },
          match: {
            select: {
              status: true,
              homeScore: true,
              awayScore: true,
            },
          },
        },
      });

      type FormEntry = "W" | "D" | "L";

      const formByTeam = new Map<number, FormEntry[]>();
      const nextOpponentByTeam = new Map<number, string | null>();

      const now = new Date();

      // Populate next opponent per team from upcoming fixtures.
      for (const f of fixtures) {
        const isUpcoming = !f.match || f.match.status === "UPCOMING";
        if (!isUpcoming || f.date < now) continue;

        const homeName = f.homeTeam.name;
        const awayName = f.awayTeam.name;

        if (!nextOpponentByTeam.has(f.homeTeamId)) {
          nextOpponentByTeam.set(f.homeTeamId, awayName);
        }
        if (!nextOpponentByTeam.has(f.awayTeamId)) {
          nextOpponentByTeam.set(f.awayTeamId, homeName);
        }
      }

      // Populate form from completed fixtures with scores, ordered by date.
      const completed = fixtures
        .filter((f) => f.match && f.match.status === "COMPLETED")
        .filter((f) => f.match!.homeScore != null && f.match!.awayScore != null)
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const f of completed) {
        const homeGoals = f.match!.homeScore!;
        const awayGoals = f.match!.awayScore!;

        const homeForm = formByTeam.get(f.homeTeamId) ?? [];
        const awayForm = formByTeam.get(f.awayTeamId) ?? [];

        let homeEntry: FormEntry;
        let awayEntry: FormEntry;

        if (homeGoals > awayGoals) {
          homeEntry = "W";
          awayEntry = "L";
        } else if (homeGoals < awayGoals) {
          homeEntry = "L";
          awayEntry = "W";
        } else {
          homeEntry = "D";
          awayEntry = "D";
        }

        homeForm.push(homeEntry);
        awayForm.push(awayEntry);

        // Keep only the last 5 for performance and UX.
        if (homeForm.length > 5) homeForm.shift();
        if (awayForm.length > 5) awayForm.shift();

        formByTeam.set(f.homeTeamId, homeForm);
        formByTeam.set(f.awayTeamId, awayForm);
      }

      const table = rows.map((row) => ({
        teamId: row.teamId,
        teamName: row.team.name,
        played: row.played,
        wins: row.wins,
        draws: row.draws,
        losses: row.losses,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDiff: row.goalDiff,
        points: row.points,
        form: formByTeam.get(row.teamId),
        nextOpponent: nextOpponentByTeam.get(row.teamId) ?? null,
      }));

      // TODO: future enhancement - apply head-to-head tiebreakers when points and goalDiff are equal.

      return NextResponse.json(table);
    }

    // Fallback: no incremental rows yet (e.g. no completed matches processed).
    // Compute a table on the fly so that **all league teams** appear with zeroed stats
    // until they have completed matches, and also derive basic form + next opponent.
    const [leagueTeams, fixtures] = await Promise.all([
      prisma.team.findMany({
        where: {
          leagueId: leagueIdNum,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
        },
      }),
      prisma.fixture.findMany({
        where: {
          seasonId,
          season: {
            leagueId: leagueIdNum,
          },
        },
        select: {
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
      }),
    ]);

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

    const standings = new Map<number, Standing>();

    type FormEntry = "W" | "D" | "L";
    const formByTeam = new Map<number, FormEntry[]>();
    const nextOpponentByTeam = new Map<number, string | null>();

    const now = new Date();

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

    // Ensure every league team appears at least with a zeroed row.
    for (const t of leagueTeams) {
      ensureTeam(t.id, t.name);
    }

    // Populate next opponent per team from upcoming fixtures.
    for (const f of fixtures) {
      const isUpcoming = !f.match || f.match.status === "UPCOMING";
      if (!isUpcoming || f.date < now) continue;

      const homeName = f.homeTeam.name;
      const awayName = f.awayTeam.name;

      if (!nextOpponentByTeam.has(f.homeTeamId)) {
        nextOpponentByTeam.set(f.homeTeamId, awayName);
      }
      if (!nextOpponentByTeam.has(f.awayTeamId)) {
        nextOpponentByTeam.set(f.awayTeamId, homeName);
      }
    }

    for (const fixture of fixtures) {
      const match = fixture.match;
      if (!match || match.status !== "COMPLETED") continue;

      // Mirror leagueTableService: ignore completed matches that do not yet have
      // explicit scores so we don't treat missing scores as 0-0 draws.
      if (match.homeScore == null || match.awayScore == null) continue;

      const homeStanding = ensureTeam(
        fixture.homeTeam.id,
        fixture.homeTeam.name,
      );
      const awayStanding = ensureTeam(
        fixture.awayTeam.id,
        fixture.awayTeam.name,
      );

      const homeGoals = match.homeScore;
      const awayGoals = match.awayScore;

      const apply = (team: Standing, gf: number, ga: number) => {
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

      apply(homeStanding, homeGoals, awayGoals);
      apply(awayStanding, awayGoals, homeGoals);

      // Track form entries (W/D/L) per team, keeping last 5.
      const homeForm = formByTeam.get(fixture.homeTeamId) ?? [];
      const awayForm = formByTeam.get(fixture.awayTeamId) ?? [];

      let homeEntry: FormEntry;
      let awayEntry: FormEntry;

      if (homeGoals > awayGoals) {
        homeEntry = "W";
        awayEntry = "L";
      } else if (homeGoals < awayGoals) {
        homeEntry = "L";
        awayEntry = "W";
      } else {
        homeEntry = "D";
        awayEntry = "D";
      }

      homeForm.push(homeEntry);
      awayForm.push(awayEntry);

      if (homeForm.length > 5) homeForm.shift();
      if (awayForm.length > 5) awayForm.shift();

      formByTeam.set(fixture.homeTeamId, homeForm);
      formByTeam.set(fixture.awayTeamId, awayForm);
    }

    const fallbackTable = Array.from(standings.values())
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.teamName.localeCompare(b.teamName);
      })
      .map((row) => ({
        ...row,
        form: formByTeam.get(row.teamId),
        nextOpponent: nextOpponentByTeam.get(row.teamId) ?? null,
      }));

    return NextResponse.json(fallbackTable);
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch league table");
  }
}
