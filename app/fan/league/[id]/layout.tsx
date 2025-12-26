import Container from "@/app/ui/Container";
import LeagueHeader from "../_components/LeagueHeader";
import LeagueNav from "../_components/LeagueNav";
import prisma from "@/app/lib/prisma";
import { notFound } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

const LeagueLayout = async ({ children, params }: LayoutProps) => {
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

  const base = `/fan/league/${league.id}`;
  const status = [
    { name: "Overview", href: base },
    { name: "Table", href: `${base}/table` },
    { name: "Matches", href: `${base}/matches` },
    { name: "Stats", href: `${base}/stats` },
    { name: "Transfers", href: `${base}/transfers` },
    { name: "News", href: `${base}/news` },
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
