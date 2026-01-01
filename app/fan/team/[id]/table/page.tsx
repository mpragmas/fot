import TableClient from "../../../league/[id]/table/TableClient";
import prisma from "@/app/lib/prisma";
import { resolveSeasonForLeague } from "../../../league/_lib/leagueData";
import { notFound } from "next/navigation";

type TeamTablePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    seasonId?: string;
    scope?: string;
    filter?: string;
  }>;
};

const TeamTablePage = async ({ params, searchParams }: TeamTablePageProps) => {
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

  const rawScope = sp.filter ?? sp.scope;
  const scopeParam =
    rawScope === "home" || rawScope === "away" ? rawScope : "overall";

  const season = await resolveSeasonForLeague(leagueId, seasonIdParam);
  if (!season) {
    notFound();
  }

  return (
    <TableClient
      leagueId={leagueId}
      seasonId={season.id}
      initialScope={scopeParam}
    />
  );
};

export default TeamTablePage;
