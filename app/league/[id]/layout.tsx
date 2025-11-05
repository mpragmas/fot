import React from "react";
import LeagueHeader from "@/app/league/_components/LeagueHeader";
import Container from "@/app/ui/Container";
import LeagueNav from "@/app/league/_components/LeagueNav";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

const LeagueLayout = ({ children, params }: LayoutProps) => {
  const status = [
    { name: "Overview", href: `/league/${params.id}` },
    { name: "Table", href: `/league/${params.id}/table` },
    { name: "Matches", href: `/league/${params.id}/matches` },
    { name: "Stats", href: `/league/${params.id}/stats` },
    { name: "Transfers", href: `/league/${params.id}/transfers` },
    { name: "News", href: `/league/${params.id}/news` },
  ];
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader
          leagueName="English Premier League"
          leagueCountry="Rwanda"
        />
        <LeagueNav params={params} status={status} />
      </div>
      {children}
    </Container>
  );
};

export default LeagueLayout;
