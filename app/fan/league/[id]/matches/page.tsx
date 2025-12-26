import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";
import React from "react";
import MatchCard from "../../_components/MatchCard";
import {
  getLeagueMatchCards,
  resolveSeasonForLeague,
} from "../../_lib/leagueData";
import { notFound } from "next/navigation";

type MatchesPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string }>;
};

const Matches = async ({ params, searchParams }: MatchesPageProps) => {
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

  const matches = await getLeagueMatchCards(season.id, 25);

  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-5 w-full rounded-2xl p-5">
      <div className="mt-2 flex items-center justify-between">
        <LeftArrow />
        <p>{season.year}</p>
        <RightArrow />
      </div>
      <p className="dark:bg-dark-4 mt-5 rounded-xl px-3 py-2 text-sm font-medium">
        Matches
      </p>
      {matches.map((m, idx) => (
        <div key={`${m.homeTeam}-${m.awayTeam}-${idx}`} className="mt-2">
          <MatchCard {...m} />
        </div>
      ))}
    </div>
  );
};

export default Matches;
