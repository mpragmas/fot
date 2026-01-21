import React from "react";
import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";
import prisma from "@/app/lib/prisma";
import { getTeamFixturesForSeason } from "../../_lib/teamData";
import { resolveSeasonForLeague } from "../../../league/_lib/leagueData";
import { notFound } from "next/navigation";

type Team = {
  name: string;
  logo: string;
};

type MatchProps = {
  dateLabel: string;
  league: string;
  home: Team;
  away: Team;
  score?: string;
  upcoming?: string;
  scoreBg: string;
};

const MatchRow = ({
  dateLabel,
  league,
  home,
  away,
  score,
  upcoming,
  scoreBg,
}: MatchProps) => {
  return (
    <div className="border-dark-4 w-full border-b pt-3 pb-4">
      {/* Top row */}
      <div className="text-dark-3 mb-3 flex items-center justify-between text-sm">
        <span>{dateLabel}</span>

        <div className="flex items-center gap-2">
          <span>{league}</span>
          <div className="flex h-5 w-5 items-center justify-center rounded-full text-xs">
            🌍
          </div>
        </div>
      </div>

      {/* Match */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{home.name}</span>
          <img src={home.logo} alt={home.name} className="h-7 w-7" />
        </div>

        {score && (
          <div
            className={`rounded-md px-4 py-1 text-sm font-bold text-white ${scoreBg}`}
          >
            {score}
          </div>
        )}
        {upcoming && (
          <div className={`rounded-md px-4 py-1 text-sm font-bold`}>
            {upcoming}
          </div>
        )}

        <div className="flex items-center gap-2">
          <img src={away.logo} alt={away.name} className="h-7 w-7" />
          <span className="font-semibold">{away.name}</span>
        </div>
      </div>
    </div>
  );
};

type FixturesPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string; page?: string }>;
};

function formatDateLabel(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

const FixturesPage = async ({ params, searchParams }: FixturesPageProps) => {
  const { id } = await params;
  const teamId = Number(id);
  if (!Number.isFinite(teamId)) {
    notFound();
  }

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { league: true },
  });

  if (!team || !team.leagueId) {
    notFound();
  }

  const leagueId = team.leagueId;

  const sp = (await searchParams) ?? {};
  const seasonIdParam = sp.seasonId ? Number(sp.seasonId) : undefined;
  const season = await resolveSeasonForLeague(leagueId, seasonIdParam);
  if (!season) {
    notFound();
  }

  const pageParam = sp.page ? Number(sp.page) : 0;
  const pageIndex = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0;

  const all = await getTeamFixturesForSeason(teamId, season.id);
  const pastAll = all
    .filter((f) => f.status === "COMPLETED" || f.status === "LIVE")
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  const upcomingAll = all
    .filter((f) => f.status === "UPCOMING")
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const pastOffset = pageIndex * 3;
  const upcomingOffset = pageIndex * 7;

  const pastSlice = pastAll.slice(pastOffset, pastOffset + 3);
  const remaining = Math.max(0, 10 - pastSlice.length);
  const upcomingSlice = upcomingAll.slice(
    upcomingOffset,
    upcomingOffset + Math.min(7, remaining),
  );

  const pageFixtures = [...pastSlice, ...upcomingSlice].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const canPrev = pageIndex > 0;
  const canNext =
    pastAll.length > (pageIndex + 1) * 3 ||
    upcomingAll.length > (pageIndex + 1) * 7;

  const base = `/fan/team/${teamId}/fixtures`;
  const common = `seasonId=${season.id}`;
  const prevHref = canPrev
    ? `${base}?${common}&page=${pageIndex - 1}`
    : undefined;
  const nextHref = canNext
    ? `${base}?${common}&page=${pageIndex + 1}`
    : undefined;

  const matches: MatchProps[] = pageFixtures.map((f) => {
    const isHome = f.homeTeamId === teamId;
    const hasScore =
      (f.status === "COMPLETED" || f.status === "LIVE") &&
      typeof f.homeScore === "number" &&
      typeof f.awayScore === "number";

    let score: string | undefined;
    let scoreBg = "bg-dark-5";
    let upcoming: string | undefined;

    if (hasScore) {
      score = `${f.homeScore} - ${f.awayScore}`;
      const diff = isHome
        ? (f.homeScore as number) - (f.awayScore as number)
        : (f.awayScore as number) - (f.homeScore as number);
      if (diff > 0) scoreBg = "bg-green-600";
      else if (diff < 0) scoreBg = "bg-red-500";
      else scoreBg = "bg-dark-5";
    } else if (f.status === "UPCOMING") {
      upcoming = f.date.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return {
      dateLabel: formatDateLabel(f.date),
      league: team.league?.name ?? "",
      home: {
        name: f.homeTeamName,
        logo: f.homeTeamLogo,
      },
      away: {
        name: f.awayTeamName,
        logo: f.awayTeamLogo,
      },
      score,
      upcoming,
      scoreBg,
    };
  });

  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-5 w-full rounded-2xl p-5">
      <div className="mt-2 flex items-center justify-between">
        <LeftArrow href={prevHref} disabled={!canPrev} />
        <RightArrow href={nextHref} disabled={!canNext} />
      </div>
      <div className="mt-10">
        {matches.map((match, i) => (
          <MatchRow key={i} {...match} />
        ))}
      </div>
    </div>
  );
};

export default FixturesPage;
