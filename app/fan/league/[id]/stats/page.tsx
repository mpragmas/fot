import PlayerStatCard from "@/app/ui/PlayerStatsCard";
import React from "react";
import { FaAngleRight } from "react-icons/fa";
import Link from "next/link";
import {
  getSeasonTopStats,
  getSeasonTopTeamStats,
  resolveSeasonForLeague,
} from "../../_lib/leagueData";
import { notFound } from "next/navigation";

type LeagueStatsProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string; scope?: string }>;
};

const LeagueStats = async ({ params, searchParams }: LeagueStatsProps) => {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const seasonIdParam = sp.seasonId ? Number(sp.seasonId) : undefined;
  const season = await resolveSeasonForLeague(leagueId, seasonIdParam);
  if (!season) {
    notFound();
  }

  const scope = sp.scope === "teams" ? "teams" : "players";
  const { topScorers, topAssists, topRated } =
    scope === "teams"
      ? await getSeasonTopTeamStats(season.id)
      : await getSeasonTopStats(season.id);

  const base = `/fan/league/${leagueId}/stats`;
  const playersHref = `${base}?seasonId=${season.id}&scope=players`;
  const teamsHref = `${base}?seasonId=${season.id}&scope=teams`;

  const detailsBase = `/fan/league/${leagueId}/stats/goalsStats?seasonId=${season.id}`;
  const goalsHref = `${detailsBase}&metric=goals`;
  const assistsHref = `${detailsBase}&metric=assists`;
  const gaHref = `${detailsBase}&metric=ga`;

  return (
    <>
      <div className="dark:bg-dark-1 dark:text-whitish mt-5 space-x-3 rounded-2xl p-5">
        <Link
          href={playersHref}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            scope === "players"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Players
        </Link>
        <Link
          href={teamsHref}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            scope === "teams"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Teams
        </Link>
      </div>

      {!topScorers.length ? (
        <div className="dark:text-whitish mt-5 rounded-2xl p-5 text-center">
          No stats available
        </div>
      ) : (
        <div className="mx-auto mt-5 grid w-full grid-cols-1 gap-4 rounded-2xl sm:grid-cols-3">
          <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <h3 className="mb-4 text-sm font-semibold">Top Score</h3>
              <Link href={goalsHref}>
                <FaAngleRight className="mr-4" />
              </Link>
            </div>
            {topScorers.map((player, index) => (
              <PlayerStatCard
                key={index}
                {...player}
                lastBorder={index !== topScorers.length - 1} // only non-last ones get border
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
                lastBorder={index !== topAssists.length - 1} // only non-last ones get border
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
                lastBorder={index !== topRated.length - 1} // only non-last ones get border
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default LeagueStats;
