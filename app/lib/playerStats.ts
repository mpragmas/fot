import prisma from "@/app/lib/prisma";

type StatAccumulator = {
  gamesPlayed: Set<number>;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
};

export async function recomputePlayerStatsForSeason(
  seasonId: number,
): Promise<void> {
  if (!Number.isFinite(seasonId)) return;

  const matchStats = await prisma.matchStat.findMany({
    where: {
      match: {
        fixture: {
          seasonId,
        },
      },
    },
    select: {
      matchId: true,
      playerId: true,
      type: true,
    },
  });

  const byPlayer = new Map<number, StatAccumulator>();

  for (const stat of matchStats) {
    let acc = byPlayer.get(stat.playerId);
    if (!acc) {
      acc = {
        gamesPlayed: new Set<number>(),
        goals: 0,
        assists: 0,
        yellowCards: 0,
        redCards: 0,
      };
      byPlayer.set(stat.playerId, acc);
    }

    acc.gamesPlayed.add(stat.matchId);

    if (stat.type === "GOAL") {
      acc.goals += 1;
    }
    if (stat.type === "ASSIST") {
      acc.assists += 1;
    }
    if (stat.type === "YELLOW_CARD") {
      acc.yellowCards += 1;
    }
    if (stat.type === "RED_CARD") {
      acc.redCards += 1;
    }
  }

  await prisma.$transaction([
    prisma.playerStat.deleteMany({ where: { seasonId } }),
    byPlayer.size
      ? prisma.playerStat.createMany({
          data: Array.from(byPlayer.entries()).map(([playerId, acc]) => ({
            playerId,
            seasonId,
            gamesPlayed: acc.gamesPlayed.size,
            goals: acc.goals,
            assists: acc.assists,
            yellowCards: acc.yellowCards,
            redCards: acc.redCards,
          })),
        })
      : prisma.playerStat.createMany({ data: [] }),
  ]);
}

export async function recomputePlayerStatsForMatch(
  matchId: number,
): Promise<void> {
  if (!Number.isFinite(matchId)) return;

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      fixture: {
        select: { seasonId: true },
      },
    },
  });

  const seasonId = match?.fixture?.seasonId;
  if (!seasonId) return;

  await recomputePlayerStatsForSeason(seasonId);
}
