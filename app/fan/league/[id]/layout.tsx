import Container from "@/app/ui/Container";
import LeagueHeader from "../_components/LeagueHeader";
import LeagueNav from "../_components/LeagueNav";
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string }>;
}

const LeagueLayout = async ({
  children,
  params,
  searchParams,
}: LayoutProps) => {
  const { id } = await params;

  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) {
    notFound();
  }

  const [league, seasons] = await Promise.all([
    prisma.league.findUnique({
      where: { id: leagueId },
      select: { id: true, name: true, country: true },
    }),
    prisma.season.findMany({
      where: { leagueId },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      select: { id: true, year: true },
    }),
  ]);

  if (!league) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const seasonIdQuery = sp.seasonId ? `?seasonId=${sp.seasonId}` : "";

  const base = `/fan/league/${league.id}`;
  const status = [
    { name: "Overview", href: `${base}${seasonIdQuery}` },
    { name: "Table", href: `${base}/table${seasonIdQuery}` },
    { name: "Matches", href: `${base}/matches${seasonIdQuery}` },
    { name: "Stats", href: `${base}/stats${seasonIdQuery}` },
    { name: "Transfers", href: `${base}/transfers${seasonIdQuery}` },
    { name: "News", href: `${base}/news${seasonIdQuery}` },
  ];
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader
          leagueName={league.name}
          leagueCountry={league.country}
          seasons={seasons}
        />
        <LeagueNav status={status} />
      </div>
      {children}
    </Container>
  );
};

export default LeagueLayout;
