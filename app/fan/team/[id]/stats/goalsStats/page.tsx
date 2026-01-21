import LeftArrow from "@/app/ui/LeftArrow";
import React from "react";
import Image from "next/image";
import RightArrow from "@/app/ui/RightArrow";
import Link from "next/link";
import prisma from "@/app/lib/prisma";
import { getTeamPlayerStatLeaders } from "../../../_lib/teamData";
import { resolveSeasonForLeague } from "../../../../league/_lib/leagueData";
import { notFound } from "next/navigation";

type TeamGoalsStatsPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    seasonId?: string;
    metric?: string;
    pos?: string;
    page?: string;
  }>;
};

const TeamGoalsStatsPage = async ({
  params,
  searchParams,
}: TeamGoalsStatsPageProps) => {
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

  const metric =
    sp.metric === "assists" ? "assists" : sp.metric === "ga" ? "ga" : "goals";
  const pos = sp.pos;
  const pageIndex = Math.max(0, Number(sp.page ?? "0") || 0);
  const take = 10;

  const { total, data } = await getTeamPlayerStatLeaders(
    season.id,
    teamId,
    metric,
    pos,
    pageIndex,
    take,
  );

  const base = `/fan/team/${teamId}/stats/goalsStats`;
  const common = `seasonId=${season.id}&metric=${metric}`;
  const posParam = pos ? `&pos=${encodeURIComponent(pos)}` : "";
  const start = total === 0 ? 0 : pageIndex * take + 1;
  const end = Math.min(total, (pageIndex + 1) * take);

  const prevHref =
    pageIndex > 0
      ? `${base}?${common}${posParam}&page=${pageIndex - 1}`
      : undefined;
  const nextHref =
    end < total
      ? `${base}?${common}${posParam}&page=${pageIndex + 1}`
      : undefined;

  const title =
    metric === "assists"
      ? "Top assists"
      : metric === "ga"
        ? "Goals + Assists"
        : "Top scorer";

  const backHref = `/fan/team/${teamId}/stats?seasonId=${season.id}`;

  type PlayerRow = {
    playerId: number;
    playerName: string;
    value: number;
  };

  return (
    <div className="dark:text-whitish dark:bg-dark-1 mt-10 rounded-2xl p-5">
      <div className="dark:border-dark-2 w-ful flex items-center gap-3 border-b pb-3">
        <LeftArrow href={backHref} />
        <Link href={backHref}>Back</Link>
      </div>
      <div className="dark:border-dark-2 flex items-center gap-3 border-b py-3">
        <Image
          src="/images/league default logo.png"
          alt=""
          width={30}
          height={30}
        />
        <p>{team.league?.name ?? "League"}</p>
        <p>Team stats</p>
      </div>
      <h1 className="text-dark-5 dark:border-dark-2 border-b py-3 text-2xl font-extrabold">
        {title}
      </h1>

      <div className="flex items-center gap-3 py-4">
        <Link
          href={`${base}?${common}`}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            !pos
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          All
        </Link>
        <Link
          href={`${base}?${common}&pos=forwards`}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            pos === "forwards"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Fowards
        </Link>
        <Link
          href={`${base}?${common}&pos=midfielder`}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            pos === "midfielder"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Midfielder
        </Link>
        <Link
          href={`${base}?${common}&pos=defender`}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            pos === "defender"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Defender
        </Link>
        <Link
          href={`${base}?${common}&pos=goalkeeper`}
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            pos === "goalkeeper"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "bg-dark text-whitish dark:bg-dark-4 dark:text-whitish"
          }`}
        >
          Goalkeeper
        </Link>
      </div>

      <div className="space-y-4">
        <div className="dark:text-dark-3 flex justify-between text-xs">
          <div className="flex gap-5">
            <p>#</p>
            <p>Player</p>
          </div>
          <p>Stats</p>
        </div>
        {data.map((row: PlayerRow, idx: number) => (
          <div
            key={`${row.playerId}-${idx}`}
            className="dark:border-dark-2 flex items-center justify-between border-b pb-3"
          >
            <div className="flex items-center gap-5">
              <p>{pageIndex * take + idx + 1}</p>
              <Image
                src="/images/default player image.png"
                alt=""
                width={50}
                height={50}
              />
              <p>{row.playerName}</p>
            </div>
            <p className="pr-2">{row.value}</p>
          </div>
        ))}
        <div className="text-dark-3 flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-3">
            <LeftArrow href={prevHref} />
            {prevHref ? <Link href={prevHref}>Previous</Link> : <p>Previous</p>}
          </div>
          <p>
            {start}-{end} of {total}
          </p>
          <div className="flex items-center gap-3">
            {nextHref ? <Link href={nextHref}>Next</Link> : <p>Next</p>}
            <RightArrow href={nextHref} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamGoalsStatsPage;
