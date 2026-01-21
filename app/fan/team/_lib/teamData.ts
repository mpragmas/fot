import prisma from "@/app/lib/prisma";
import { cache } from "react";

const DEFAULT_LOGO = "/images/logo.png";

export type TeamFixtureSummary = {
  id: number;
  date: Date;
  homeTeamId: number;
  awayTeamId: number;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamLogo: string;
  awayTeamLogo: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
};

export const getTeamFixturesForSeason = cache(
  async (teamId: number, seasonId: number): Promise<TeamFixtureSummary[]> => {
    if (!Number.isFinite(teamId) || !Number.isFinite(seasonId)) return [];

    const fixtures = await prisma.fixture.findMany({
      where: {
        seasonId,
        OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }],
      },
      orderBy: [{ date: "asc" }, { id: "asc" }],
      include: {
        homeTeam: { select: { id: true, name: true, logo: true } },
        awayTeam: { select: { id: true, name: true, logo: true } },
        match: {
          select: {
            status: true,
            homeScore: true,
            awayScore: true,
          },
        },
      },
    });

    return fixtures.map((f) => ({
      id: f.id,
      date: f.date,
      homeTeamId: f.homeTeam.id,
      awayTeamId: f.awayTeam.id,
      homeTeamName: f.homeTeam.name,
      awayTeamName: f.awayTeam.name,
      homeTeamLogo: f.homeTeam.logo ?? DEFAULT_LOGO,
      awayTeamLogo: f.awayTeam.logo ?? DEFAULT_LOGO,
      homeScore: f.match?.homeScore ?? null,
      awayScore: f.match?.awayScore ?? null,
      status: (f.match?.status as TeamFixtureSummary["status"]) ?? "UPCOMING",
    }));
  },
);

export type PlayerStatCardItem = {
  name: string;
  team: string;
  teamLogo: string;
  value: string | number;
};

export const getTeamTopStats = cache(
  async (seasonId: number, teamId: number) => {
    if (!Number.isFinite(seasonId) || !Number.isFinite(teamId)) {
      return {
        topRated: [] as PlayerStatCardItem[],
        topScorers: [],
        topAssists: [],
      };
    }

    const [topScorersRaw, topAssistsRaw, topGaRaw] = await Promise.all([
      prisma.playerStat.findMany({
        where: { seasonId, player: { teamId } },
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
        where: { seasonId, player: { teamId } },
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
              image: true,
              team: { select: { name: true, logo: true } },
            },
          },
        },
      }),
      prisma.playerStat.findMany({
        where: { seasonId, player: { teamId } },
        orderBy: [{ goals: "desc" }, { assists: "desc" }, { playerId: "asc" }],
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
    ]);

    const toName = (p: { firstName: string | null; lastName: string | null }) =>
      [p.firstName, p.lastName].filter(Boolean).join(" ").trim();

    const topScorers: PlayerStatCardItem[] = topScorersRaw.map((s) => ({
      name: toName(s.player),
      team: s.player.team?.name ?? "",
      teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
      value: String(s.goals),
    }));

    const topAssists: PlayerStatCardItem[] = topAssistsRaw.map((s) => ({
      name: toName(s.player),
      team: s.player.team?.name ?? "",
      teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
      value: String(s.assists),
    }));

    const topRated: PlayerStatCardItem[] = topGaRaw.map((s) => ({
      name: toName(s.player),
      team: s.player.team?.name ?? "",
      teamLogo: s.player.image || s.player.team?.logo || DEFAULT_LOGO,
      value: String(s.goals + s.assists),
    }));

    return { topRated, topScorers, topAssists };
  },
);

type PlayerStatListItem = {
  playerId: number;
  playerName: string;
  value: number;
};

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

export const getTeamPlayerStatLeaders = cache(
  async (
    seasonId: number,
    teamId: number,
    metric: "goals" | "assists" | "ga",
    pos: string | undefined,
    page: number,
    take: number,
  ): Promise<{ total: number; data: PlayerStatListItem[] }> => {
    if (!Number.isFinite(seasonId) || !Number.isFinite(teamId)) {
      return { total: 0, data: [] };
    }

    const wherePos = positionWhere(pos);

    const where = {
      seasonId,
      player: {
        teamId,
        ...(wherePos ? wherePos : {}),
      },
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

    const safePage = Math.max(0, page);
    const skip = safePage * take;

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
      const name = [r.player.firstName, r.player.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
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
