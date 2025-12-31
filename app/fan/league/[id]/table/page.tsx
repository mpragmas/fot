import TableClient from "./TableClient";
import { resolveSeasonForLeague } from "../../_lib/leagueData";
import { notFound } from "next/navigation";

type TablePageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    seasonId?: string;
    scope?: string;
    filter?: string;
  }>;
};

const TablePage = async ({ params, searchParams }: TablePageProps) => {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) {
    notFound();
  }

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

export default TablePage;
