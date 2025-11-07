import React from "react";
import LeagueHeader from "@/app/league/_components/LeagueHeader";
import Container from "@/app/ui/Container";
import LeagueNav from "@/app/league/_components/LeagueNav";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

const LeagueLayout = async ({ children, params }: LayoutProps) => {
  const { id } = await params;
  const status = [
    { name: "Overview", href: `/league/${id}` },
    { name: "Table", href: `/league/${id}/table` },
    { name: "Matches", href: `/league/${id}/matches` },
    { name: "Stats", href: `/league/${id}/stats` },
    { name: "Transfers", href: `/league/${id}/transfers` },
    { name: "News", href: `/league/${id}/news` },
  ];
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader
          leagueName="English Premier League"
          leagueCountry="Rwanda"
        />
        <LeagueNav status={status} />
      </div>
      {children}
    </Container>
  );
};

export default LeagueLayout;
