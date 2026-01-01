import React from "react";
import Container from "@/app/ui/Container";
import LeagueHeader from "../../league/_components/LeagueHeader";
import LeagueNav from "../../league/_components/LeagueNav";
import prisma from "@/app/lib/prisma";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teamId = Number(id);

  const team = Number.isFinite(teamId)
    ? await prisma.team.findUnique({
        where: { id: teamId },
        include: { league: true },
      })
    : null;

  const seasons = team?.leagueId
    ? await prisma.season.findMany({
        where: { leagueId: team.leagueId },
        orderBy: [{ startDate: "desc" }, { id: "desc" }],
        select: { id: true, year: true },
      })
    : [];

  const status = [
    { name: "Overview", href: `/fan/team/${id}` },
    { name: "Table", href: `/fan/team/${id}/table` },
    { name: "Squad", href: `/fan/team/${id}/squad` },
    { name: "Stats", href: `/fan/team/${id}/stats` },
    { name: "Fixtures", href: `/fan/team/${id}/fixtures` },
  ];

  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader
          leagueName={team?.name ?? "Team"}
          leagueCountry={team?.league?.country ?? ""}
          seasons={seasons}
        />
        <LeagueNav status={status} />
      </div>
      {children}
    </Container>
  );
}
