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
        select: { id: true, year: true, leagueId: true },
      });
      if (season) return season;
    }

    const latest = await prisma.season.findFirst({
      where: { leagueId },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: { id: true, year: true, leagueId: true },
    });

    return latest;
  },
);

export type LeagueMatchCard = {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  score?: string;
  time?: string;
  date?: string;
};

export const getLeagueMatchCards = cache(
  async (seasonId: number, take = 5): Promise<LeagueMatchCard[]> => {
    const fixtures = await prisma.fixture.findMany({
      where: { seasonId },
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take,
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

    const goalStats = matchIds.length
      ? await prisma.matchStat.findMany({
          where: { matchId: { in: matchIds }, type: "GOAL" },
          select: {
            matchId: true,
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

      if (stat.player.teamId === fixture.homeTeamId) score.home += 1;
      else if (stat.player.teamId === fixture.awayTeamId) score.away += 1;
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
        homeTeam: f.homeTeam.name,
        awayTeam: f.awayTeam.name,
        homeLogo: DEFAULT_LOGO,
        awayLogo: DEFAULT_LOGO,
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
            team: { select: { name: true } },
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
    teamLogo: DEFAULT_LOGO,
    value: String(s.goals),
  }));

  const topAssists: PlayerStatCardItem[] = topAssistsRaw.map((s) => ({
    name: toName(s.player),
    team: s.player.team?.name ?? "-",
    teamLogo: DEFAULT_LOGO,
    value: String(s.assists),
  }));

  const topRated: PlayerStatCardItem[] = topGaRaw.map((s) => ({
    name: toName(s.player),
    team: s.player.team?.name ?? "-",
    teamLogo: DEFAULT_LOGO,
    value: String(s.goals + s.assists),
  }));

  return { topRated, topScorers, topAssists };
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
        image: "",
      };
    });

    while (players.length < count) {
      players.push({
        name: "TBD",
        rating: "0.0",
        image: "",
      });
    }

    return players;
  },
);
