import PlayerStatCard from "@/app/ui/PlayerStatsCard";
import React from "react";
import { FaAngleRight } from "react-icons/fa";
import Link from "next/link";
import prisma from "@/app/lib/prisma";
import { getTeamTopStats } from "../../_lib/teamData";
import { resolveSeasonForLeague } from "../../../league/_lib/leagueData";
import { notFound } from "next/navigation";

type TeamStatsProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string }>;
};

const TeamStatsPage = async ({ params, searchParams }: TeamStatsProps) => {
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

  const { topScorers, topAssists, topRated } = await getTeamTopStats(
    season.id,
    teamId,
  );

  const base = `/fan/team/${teamId}/stats/goalsStats`;
  const common = `seasonId=${season.id}`;
  const goalsHref = `${base}?${common}&metric=goals`;
  const assistsHref = `${base}?${common}&metric=assists`;
  const gaHref = `${base}?${common}&metric=ga`;

  if (!topScorers.length && !topAssists.length && !topRated.length) {
    return (
      <div className="dark:text-whitish mt-5 rounded-2xl p-5 text-center">
        No stats available for this team yet.
      </div>
    );
  }

  return (
    <div className="mt-5 w-full">
      <div className="dark:bg-dark-1 dark:text-whitish rounded-2xl p-5">
        <h2 className="text-sm font-semibold">Team stats</h2>
      </div>

      <div className="mx-auto mt-5 grid w-full grid-cols-1 gap-4 rounded-2xl sm:grid-cols-3">
        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Top Scorers</h3>
            <Link href={goalsHref}>
              <FaAngleRight className="mr-4" />
            </Link>
          </div>
          {topScorers.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topScorers.length - 1}
            />
          ))}
        </div>

        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Assists</h3>
            <Link href={assistsHref}>
              <FaAngleRight className="mr-4" />
            </Link>
          </div>
          {topAssists.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topAssists.length - 1}
            />
          ))}
        </div>

        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Goals + Assists</h3>
            <Link href={gaHref}>
              <FaAngleRight className="mr-4" />
            </Link>
          </div>
          {topRated.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topRated.length - 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamStatsPage;
