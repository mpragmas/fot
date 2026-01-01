import TopStats from "@/app/components/TopStats";
import React from "react";
import NewsSection from "@/app/components/NewsSection";
import TeamForm from "../_components/TeamForm";
import NextMatch from "../_components/NextMatch";
import TeamFixtures from "../_components/TeamFixtures";
import TableClient from "../../league/[id]/table/TableClient";
import prisma from "@/app/lib/prisma";
import {
  getLeagueMatchCards,
  getLeagueNews,
  resolveSeasonForLeague,
} from "../../league/_lib/leagueData";
import { getTeamFixturesForSeason, getTeamTopStats } from "../_lib/teamData";
import { notFound } from "next/navigation";

type TeamPageProps = {
  params: Promise<{ id: string }>;
};

const Team = async ({ params }: TeamPageProps) => {
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
  const season = await resolveSeasonForLeague(leagueId, undefined);
  if (!season) {
    notFound();
  }

  const [matches, newsItems, teamFixtures, seasonTopStats] = await Promise.all([
    getLeagueMatchCards(season.id, 5),
    getLeagueNews(8),
    getTeamFixturesForSeason(teamId, season.id),
    getTeamTopStats(season.id, teamId),
  ]);

  // Build team form (last 5 completed matches for this team).
  const completed = teamFixtures
    .filter((f) => f.status === "COMPLETED")
    .filter((f) => f.homeScore != null && f.awayScore != null)
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  const formItems = completed.map((f) => {
    const isHome = f.homeTeamId === teamId;
    const gf = isHome ? f.homeScore! : f.awayScore!;
    const ga = isHome ? f.awayScore! : f.homeScore!;

    const resultColor =
      gf > ga ? "bg-green-2" : gf === ga ? "bg-dark-5" : "bg-red-500";
    const opponentName = isHome ? f.awayTeamName : f.homeTeamName;

    return {
      score: `${gf}-${ga}`,
      color: resultColor,
      img: "/images/logo.png",
      alt: opponentName,
    };
  });

  // Next match: nearest upcoming fixture.
  const now = new Date();
  const upcoming = teamFixtures
    .filter((f) => f.status === "UPCOMING" && f.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  const nextMatchData = upcoming
    ? {
        competition: team.league?.name ?? "",
        emoji: "⚽",
        time: upcoming.date.toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
        }),
        day: upcoming.date.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
        teams: [
          {
            name: upcoming.homeTeamName,
            img: "/images/logo.png",
            alt: upcoming.homeTeamName,
          },
          {
            name: upcoming.awayTeamName,
            img: "/images/logo.png",
            alt: upcoming.awayTeamName,
          },
        ] as [
          { name: string; img: string; alt: string },
          { name: string; img: string; alt: string },
        ],
      }
    : null;

  // Sidebar fixtures: upcoming fixtures list.
  const upcomingList = teamFixtures
    .filter((f) => f.status === "UPCOMING" && f.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)
    .map((f) => {
      const dateLabel = f.date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      const timeLabel = f.date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });

      const isHome = f.homeTeamId === teamId;

      return {
        date: dateLabel,
        competition: team.league?.name ?? "",
        home: isHome,
        team1: f.homeTeamName,
        team1Logo: "/images/logo.png",
        team2: f.awayTeamName,
        team2Logo: "/images/logo.png",
        time: timeLabel,
      };
    });

  return (
    <div className="mt-7 w-full">
      <div className="mt-5 flex">
        <div className="w-[70%]">
          <div className="flex w-full items-center justify-center bg-black font-sans text-white">
            <div className="flex w-full gap-4">
              <TeamForm items={formItems} />
              <NextMatch match={nextMatchData} />
            </div>
          </div>

          <TableClient leagueId={leagueId} seasonId={season.id} />

          {seasonTopStats.topScorers.length > 0 && (
            <TopStats {...seasonTopStats} />
          )}
          <NewsSection items={newsItems} />
        </div>
        <div className="w-[30%]">
          <TeamFixtures fixtures={upcomingList} />
        </div>
      </div>
    </div>
  );
};

export default Team;
