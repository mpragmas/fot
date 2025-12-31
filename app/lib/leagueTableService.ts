import prisma from "@/app/lib/prisma";
import { emitLeagueTableUpdated } from "@/app/lib/socket";

// Incrementally recompute league table rows for the two teams involved in a match.
// This is only called on explicit triggers (status -> FT, score change, result edit/delete)
// to avoid any recomputation on normal page loads.
export async function updateLeagueTableForMatch(matchId: number) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      status: true,
      fixture: {
        select: {
          id: true,
          seasonId: true,
          homeTeamId: true,
          awayTeamId: true,
          season: {
            select: {
              leagueId: true,
            },
          },
        },
      },
    },
  });

  if (!match || !match.fixture) return;

  const { seasonId, homeTeamId, awayTeamId, season } = match.fixture;
  const leagueId = season.leagueId;

  const [homeChanged, awayChanged] = await Promise.all([
    recomputeTeamRow(seasonId, leagueId, homeTeamId),
    recomputeTeamRow(seasonId, leagueId, awayTeamId),
  ]);

  // Notify listeners that this league's table changed only if something actually changed.
  if (homeChanged || awayChanged) {
    emitLeagueTableUpdated(leagueId);
  }
}

// Used when a match is deleted and we already know the fixture teams.
export async function updateLeagueTableForFixtureTeams(
  seasonId: number,
  leagueId: number,
  homeTeamId: number,
  awayTeamId: number,
) {
  const [homeChanged, awayChanged] = await Promise.all([
    recomputeTeamRow(seasonId, leagueId, homeTeamId),
    recomputeTeamRow(seasonId, leagueId, awayTeamId),
  ]);

  if (homeChanged || awayChanged) {
    emitLeagueTableUpdated(leagueId);
  }
}

async function recomputeTeamRow(
  seasonId: number,
  leagueId: number,
  teamId: number,
) {
  // Find all completed matches in this season where the team participated.
  const fixtures = await prisma.fixture.findMany({
    where: {
      seasonId,
      OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      match: { status: "COMPLETED" },
    },
    select: {
      homeTeamId: true,
      awayTeamId: true,
      match: {
        select: {
          homeScore: true,
          awayScore: true,
        },
      },
    },
  });

  let played = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  for (const f of fixtures) {
    if (!f.match) continue;

    // Ignore matches that do not have explicit scores yet to avoid double counting
    // or treating missing scores as 0-0 draws.
    if (f.match.homeScore == null || f.match.awayScore == null) continue;

    const homeGoals = f.match.homeScore;
    const awayGoals = f.match.awayScore;

    const isHome = f.homeTeamId === teamId;
    const teamGoals = isHome ? homeGoals : awayGoals;
    const oppGoals = isHome ? awayGoals : homeGoals;

    played += 1;
    goalsFor += teamGoals;
    goalsAgainst += oppGoals;

    if (teamGoals > oppGoals) wins += 1;
    else if (teamGoals < oppGoals) losses += 1;
    else draws += 1;
  }

  const points = wins * 3 + draws;
  const goalDiff = goalsFor - goalsAgainst;

  // If the team has no completed matches, either clear or reset the row.
  // Here we keep a zeroed row for stable ordering.

  const existing = await prisma.leagueTable.findUnique({
    where: {
      leagueId_seasonId_teamId: { leagueId, seasonId, teamId },
    },
  });

  const nextData = {
    played,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDiff,
    points,
  };

  const changed =
    !existing ||
    existing.played !== nextData.played ||
    existing.wins !== nextData.wins ||
    existing.draws !== nextData.draws ||
    existing.losses !== nextData.losses ||
    existing.goalsFor !== nextData.goalsFor ||
    existing.goalsAgainst !== nextData.goalsAgainst ||
    existing.goalDiff !== nextData.goalDiff ||
    existing.points !== nextData.points;

  if (!changed) {
    return false;
  }

  await prisma.leagueTable.upsert({
    where: {
      leagueId_seasonId_teamId: { leagueId, seasonId, teamId },
    },
    update: {
      ...nextData,
      updatedAt: new Date(),
    },
    create: {
      leagueId,
      seasonId,
      teamId,
      ...nextData,
    },
  });

  return true;
}
