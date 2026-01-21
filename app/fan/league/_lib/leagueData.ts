import prisma from "@/app/lib/prisma";
import { cache } from "react";

const DEFAULT_LOGO = "/images/logo.png";

function formatTimeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} days ago`;
}

function formatFixtureDateLabel(date: Date): string {
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfThatDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.round(
    (startOfThatDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatFixtureTime(date: Date): string {
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export const resolveSeasonForLeague = cache(
  async (leagueId: number, seasonIdParam?: number) => {
    if (seasonIdParam && Number.isFinite(seasonIdParam)) {
      const season = await prisma.season.findFirst({
        where: { id: seasonIdParam, leagueId },
        select: { id: true, year: true, leagueId: true, totalRounds: true },
      });
      if (season) return season;
    }

    const latest = await prisma.season.findFirst({
      where: { leagueId },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: { id: true, year: true, leagueId: true, totalRounds: true },
    });

    return latest;
  },
);

export type LeagueMatchCard = {
  homeTeamId: number;
  awayTeamId: number;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  score?: string;
  time?: string;
  date?: string;
};

export type LeagueFixtureRow = {
  fixtureId: number;
  date: Date;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
  roundNumber: number;
};

type Score = { home: number; away: number };

function emptyScore(): Score {
  return { home: 0, away: 0 };
}

function addGoal(
  score: Score,
  goalFor: "HOME" | "AWAY",
  goalType: "GOAL" | "OWN_GOAL",
) {
  const side: "HOME" | "AWAY" =
    goalType === "OWN_GOAL" ? (goalFor === "HOME" ? "AWAY" : "HOME") : goalFor;

  if (side === "HOME") score.home += 1;
  else score.away += 1;
}

export const getLeagueFixturesInRange = cache(
  async (
    seasonId: number,
    startInclusive: Date,
    endExclusive: Date,
  ): Promise<LeagueFixtureRow[]> => {
    const fixtures = await prisma.fixture.findMany({
      where: {
        seasonId,
        date: {
          gte: startInclusive,
          lt: endExclusive,
        },
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        match: { select: { id: true, status: true } },
      },
    });

    const matchIds = fixtures
      .map((f) => f.match?.id)
      .filter((id): id is number => typeof id === "number");

    const fixtureByMatchId = new Map<number, (typeof fixtures)[number]>();
    for (const f of fixtures) {
      if (f.match?.id) fixtureByMatchId.set(f.match.id, f);
    }

    const goalLikeStats = matchIds.length
      ? await prisma.matchStat.findMany({
          where: {
            matchId: { in: matchIds },
            type: { in: ["GOAL", "OWN_GOAL"] },
          },
          select: {
            matchId: true,
            type: true,
            player: { select: { teamId: true } },
          },
        })
      : [];

    const scoreByMatchId = new Map<number, Score>();
    for (const id of matchIds) scoreByMatchId.set(id, emptyScore());

    for (const stat of goalLikeStats) {
      const fixture = fixtureByMatchId.get(stat.matchId);
      if (!fixture) continue;

      const score = scoreByMatchId.get(stat.matchId);
      if (!score) continue;

      if (stat.type !== "GOAL" && stat.type !== "OWN_GOAL") continue;

      const goalFor: "HOME" | "AWAY" =
        stat.player.teamId === fixture.homeTeamId ? "HOME" : "AWAY";

      addGoal(score, goalFor, stat.type as "GOAL" | "OWN_GOAL");
    }

    return fixtures.map((f) => {
      const score = f.match?.id ? scoreByMatchId.get(f.match.id) : undefined;

      const showScore =
        (f.match?.status === "LIVE" || f.match?.status === "COMPLETED") &&
        score;

      return {
        fixtureId: f.id,
        date: f.date,
        homeTeam: f.homeTeam.name,
        awayTeam: f.awayTeam.name,
        homeScore: showScore ? score!.home : undefined,
        awayScore: showScore ? score!.away : undefined,
        status: f.match?.status ?? "UPCOMING",
        roundNumber: (f as any).roundNumber ?? 1,
      };
    });
  },
);

export const getLeagueFixturesByRound = cache(
  async (
    seasonId: number,
    roundNumber: number,
  ): Promise<LeagueFixtureRow[]> => {
    const fixtures = await prisma.fixture.findMany({
      where: { seasonId, roundNumber },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      include: {
        homeTeam: { select: { id: true, name: true } },
        awayTeam: { select: { id: true, name: true } },
        match: { select: { id: true, status: true } },
      },
    });

    if (!fixtures.length) return [];

    const matchIds = fixtures
      .map((f) => f.match?.id)
      .filter((id): id is number => typeof id === "number");

    const fixtureByMatchId = new Map<number, (typeof fixtures)[number]>();
    for (const f of fixtures) {
      if (f.match?.id) fixtureByMatchId.set(f.match.id, f);
    }

    const goalLikeStats = matchIds.length
      ? await prisma.matchStat.findMany({
          where: {
            matchId: { in: matchIds },
            type: { in: ["GOAL", "OWN_GOAL"] },
          },
          select: {
            matchId: true,
            type: true,
            player: { select: { teamId: true } },
          },
        })
      : [];

    const scoreByMatchId = new Map<number, Score>();
    for (const id of matchIds) scoreByMatchId.set(id, emptyScore());

    for (const stat of goalLikeStats) {
      const fixture = fixtureByMatchId.get(stat.matchId);
      if (!fixture) continue;

      const score = scoreByMatchId.get(stat.matchId);
      if (!score) continue;

      if (stat.type !== "GOAL" && stat.type !== "OWN_GOAL") continue;

      const goalFor: "HOME" | "AWAY" =
        stat.player.teamId === fixture.homeTeamId ? "HOME" : "AWAY";

      addGoal(score, goalFor, stat.type as "GOAL" | "OWN_GOAL");
    }

    return fixtures.map((f) => {
      const score = f.match?.id ? scoreByMatchId.get(f.match.id) : undefined;

      const showScore =
        (f.match?.status === "LIVE" || f.match?.status === "COMPLETED") &&
        score;

      return {
        fixtureId: f.id,
        date: f.date,
        homeTeam: f.homeTeam.name,
        awayTeam: f.awayTeam.name,
        homeScore: showScore ? score!.home : undefined,
        awayScore: showScore ? score!.away : undefined,
        status: f.match?.status ?? "UPCOMING",
        roundNumber: f.roundNumber,
      };
    });
  },
);

export const getLeagueMatchCards = cache(
  async (seasonId: number, take = 5): Promise<LeagueMatchCard[]> => {
    const fixtures = await prisma.fixture.findMany({
      where: { seasonId },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take,
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
        match: { select: { id: true, status: true } },
      },
    });

    const matchIds = fixtures
      .map((f) => f.match?.id)
      .filter((id): id is number => typeof id === "number");

    const fixtureByMatchId = new Map<number, (typeof fixtures)[number]>();
    for (const f of fixtures) {
      if (f.match?.id) fixtureByMatchId.set(f.match.id, f);
    }

    const goalStats = matchIds.length
      ? await prisma.matchStat.findMany({
          where: {
            matchId: { in: matchIds },
            type: { in: ["GOAL", "OWN_GOAL"] },
          },
          select: {
            matchId: true,
            type: true,
            player: { select: { teamId: true } },
          },
        })
      : [];

    const scoreByMatchId = new Map<number, { home: number; away: number }>();

    for (const f of fixtures) {
      if (f.match?.id) scoreByMatchId.set(f.match.id, { home: 0, away: 0 });
    }

    for (const stat of goalStats) {
      const score = scoreByMatchId.get(stat.matchId);
      if (!score) continue;

      const fixture = fixtureByMatchId.get(stat.matchId);
      if (!fixture) continue;

      if (stat.type !== "GOAL" && stat.type !== "OWN_GOAL") continue;

      const goalFor: "HOME" | "AWAY" =
        stat.player.teamId === fixture.homeTeamId ? "HOME" : "AWAY";

      addGoal(score, goalFor, stat.type as "GOAL" | "OWN_GOAL");
    }

    return fixtures.map((f) => {
      const time = formatFixtureTime(f.date);
      const date = formatFixtureDateLabel(f.date);

      const scoreObj = f.match?.id ? scoreByMatchId.get(f.match.id) : undefined;
      const score =
        f.match?.status === "COMPLETED" && scoreObj
          ? `${scoreObj.home} - ${scoreObj.away}`
          : undefined;

      return {
        homeTeamId: f.homeTeam.id,
        awayTeamId: f.awayTeam.id,
        homeTeam: f.homeTeam.name,
        awayTeam: f.awayTeam.name,
        homeLogo: f.homeTeam.logo ?? DEFAULT_LOGO,
        awayLogo: f.awayTeam.logo ?? DEFAULT_LOGO,
        score,
        ...(score ? {} : { time, date }),
      };
    });
  },
);

export type NewsCardItem = {
  title: string;
  source: string;
  time: string;
  image: string;
};

export const getLeagueNews = cache(
  async (take = 8): Promise<NewsCardItem[]> => {
    const items = await prisma.news.findMany({
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take,
      include: {
        author: { select: { name: true } },
      },
    });

    return items.map((n) => ({
      title: n.title,
      source: n.author?.name ?? "FotMob",
      time: formatTimeAgo(n.createdAt),
      image: DEFAULT_LOGO,
    }));
  },
);

export type PlayerStatCardItem = {
  name: string;
  team: string;
  teamLogo: string;
  value: string | number;
};

export type TeamOfWeekPlayer = {
  name: string;
  rating: string;
  image: string;
};

export const getSeasonTopStats = cache(async (seasonId: number) => {
  const [topScorersRaw, topAssistsRaw, topGaRaw] = await Promise.all([
    prisma.playerStat.findMany({
      where: { seasonId },
      orderBy: [
        { goals: "desc" },
        { assists: "desc" },
        { gamesPlayed: "desc" },
        { playerId: "asc" },
      ],
      take: 3,
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
            team: { select: { name: true, logo: true } },
          },
        },
      },
    }),
    prisma.playerStat.findMany({
      where: { seasonId },
      orderBy: [
        { assists: "desc" },
        { goals: "desc" },
        { gamesPlayed: "desc" },
        { playerId: "asc" },
      ],
      take: 3,
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            team: { select: { name: true } },
          },
        },
      },
    }),
    prisma.playerStat.findMany({
      where: { seasonId },
      orderBy: [{ goals: "desc" }, { assists: "desc" }, { playerId: "asc" }],
      take: 3,
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            team: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  const toName = (p: any) =>
    [p.firstName, p.lastName].filter(Boolean).join(" ").trim();

  const topScorers: PlayerStatCardItem[] = topScorersRaw.map((s) => ({
    name: toName(s.player),
    team: s.player.team?.name ?? "-",
    teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
    value: String(s.goals),
  }));

  const topAssists: PlayerStatCardItem[] = topAssistsRaw.map((s) => ({
    name: toName(s.player),
    team: s.player.team?.name ?? "-",
    teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
    value: String(s.assists),
  }));

  const topRated: PlayerStatCardItem[] = topGaRaw.map((s) => ({
    name: toName(s.player),
    team: s.player.team?.name ?? "-",
    teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
    value: String(s.goals + s.assists),
  }));

  return { topRated, topScorers, topAssists };
});

export type PlayerStatListItem = {
  playerId: number;
  playerName: string;
  value: number;
};

function normalizePlayerName(
  firstName?: string | null,
  lastName?: string | null,
) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function positionWhere(pos?: string) {
  const p = (pos ?? "").toLowerCase();
  if (!p || p === "all") return undefined;

  const variants: string[] =
    p === "forwards" || p === "forward" || p === "fwd"
      ? ["FWD", "FW", "Forward", "Foward", "Striker"]
      : p === "midfielder" || p === "midfielders" || p === "mid"
        ? ["MID", "MF", "Midfielder"]
        : p === "defender" || p === "defenders" || p === "def"
          ? ["DEF", "DF", "Defender"]
          : p === "goalkeeper" || p === "goalkeepers" || p === "gk"
            ? ["GK", "Goalkeeper", "Keeper"]
            : [];

  if (variants.length === 0) return undefined;

  return {
    OR: variants.map((v) => ({
      position: {
        equals: v,
        mode: "insensitive" as const,
      },
    })),
  };
}

export const getSeasonPlayerStatLeaders = cache(
  async (
    seasonId: number,
    metric: "goals" | "assists" | "ga",
    pos: string | undefined,
    page: number,
    take: number,
  ) => {
    const wherePos = positionWhere(pos);

    const where = {
      seasonId,
      ...(wherePos
        ? {
            player: wherePos,
          }
        : {}),
    };

    const orderBy =
      metric === "assists"
        ? ([
            { assists: "desc" },
            { goals: "desc" },
            { playerId: "asc" },
          ] as const)
        : metric === "ga"
          ? ([
              { goals: "desc" },
              { assists: "desc" },
              { playerId: "asc" },
            ] as const)
          : ([
              { goals: "desc" },
              { assists: "desc" },
              { playerId: "asc" },
            ] as const);

    const skip = Math.max(0, page) * take;

    const [rows, total] = await Promise.all([
      prisma.playerStat.findMany({
        where,
        orderBy: [...orderBy],
        skip,
        take,
        include: {
          player: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.playerStat.count({ where }),
    ]);

    const data: PlayerStatListItem[] = rows.map((r) => {
      const name = normalizePlayerName(r.player.firstName, r.player.lastName);
      const value =
        metric === "assists"
          ? r.assists
          : metric === "ga"
            ? r.goals + r.assists
            : r.goals;
      return {
        playerId: r.player.id,
        playerName: name || `Player ${r.player.id}`,
        value,
      };
    });

    return { total, data };
  },
);

export type TeamStatCardItem = {
  name: string;
  team: string;
  teamLogo: string;
  value: string | number;
};

export const getSeasonTopTeamStats = cache(async (seasonId: number) => {
  const rows = await prisma.playerStat.findMany({
    where: { seasonId },
    select: {
      goals: true,
      assists: true,
      player: {
        select: {
          team: { select: { id: true, name: true, logo: true } },
        },
      },
    },
  });

  const byTeam = new Map<
    number,
    { name: string; goals: number; assists: number }
  >();

  for (const r of rows) {
    const team = r.player.team;
    if (!team) continue;

    const existing = byTeam.get(team.id) ?? {
      name: team.name,
      goals: 0,
      assists: 0,
    };
    existing.goals += r.goals;
    existing.assists += r.assists;
    byTeam.set(team.id, existing);
  }

  const all = Array.from(byTeam.values());
  const topGoals = [...all].sort((a, b) => b.goals - a.goals).slice(0, 3);
  const topAssists = [...all].sort((a, b) => b.assists - a.assists).slice(0, 3);
  const topGA = [...all]
    .sort((a, b) => b.goals + b.assists - (a.goals + a.assists))
    .slice(0, 3);

  const toCard = (
    t: { name: string; goals: number; assists: number; logo?: string | null },
    value: number,
  ): TeamStatCardItem => ({
    name: t.name,
    team: t.name,
    teamLogo: t.logo ?? DEFAULT_LOGO,
    value: String(value),
  });

  return {
    topScorers: topGoals.map((t) => toCard({ ...t, logo: undefined }, t.goals)),
    topAssists: topAssists.map((t) =>
      toCard({ ...t, logo: undefined }, t.assists),
    ),
    topRated: topGA.map((t) =>
      toCard({ ...t, logo: undefined }, t.goals + t.assists),
    ),
  };
});

export const getTeamOfWeekPlayers = cache(
  async (seasonId: number, count = 11): Promise<TeamOfWeekPlayer[]> => {
    const stats = await prisma.playerStat.findMany({
      where: { seasonId },
      orderBy: [
        { goals: "desc" },
        { assists: "desc" },
        { gamesPlayed: "desc" },
        { playerId: "asc" },
      ],
      take: count,
      include: {
        player: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    const players = stats.map((s) => {
      const name = [s.player.firstName, s.player.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      const gp = Math.max(1, s.gamesPlayed);
      const base = (s.goals * 1.25 + s.assists * 0.9) / gp;
      const rating = Math.max(5.5, Math.min(10, 6.5 + base)).toFixed(1);

      return {
        name: name || `Player ${s.playerId}`,
        rating,
        image: s.player.image || DEFAULT_LOGO,
      };
    });

    while (players.length < count) {
      players.push({
        name: "TBD",
        rating: "0.0",
        image: DEFAULT_LOGO,
      });
    }

    return players;
  },
);
