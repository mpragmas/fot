import TableClient from "./table/TableClient";
import Matches from "../_components/Matches";
import TeamFormation from "../_components/TeamFormation";
import TopStats from "@/app/components/TopStats";
import NewsSection from "@/app/components/NewsSection";
import {
  getLeagueMatchCards,
  getLeagueNews,
  getSeasonTopStats,
  getTeamOfWeekPlayers,
  resolveSeasonForLeague,
} from "../_lib/leagueData";
import { notFound } from "next/navigation";

type OverviewProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string }>;
};

export default async function Overview({
  params,
  searchParams,
}: OverviewProps) {
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

  const [matches, newsItems, players, seasonTopStats] = await Promise.all([
    getLeagueMatchCards(season.id, 5),
    getLeagueNews(8),
    getTeamOfWeekPlayers(season.id, 11),
    getSeasonTopStats(season.id),
  ]);

  console.log(seasonTopStats);

  return (
    <div className="mt-7 w-full">
      {matches.length > 2 && (
        <Matches
          matches={matches}
          allMatchesHref={`/fan/league/${leagueId}/matches?seasonId=${season.id}`}
        />
      )}
      <div className="mt-5 flex gap-3">
        <div className="w-[70%]">
          <TableClient leagueId={leagueId} seasonId={season.id} />

          {seasonTopStats.topScorers.length>0 && <TopStats {...seasonTopStats} />}
          <NewsSection items={newsItems} />
        </div>
        <div className="w-[30%]">
          <TeamFormation formation={[4, 2, 3, 1]} players={players} />
        </div>
      </div>
    </div>
  );
}
