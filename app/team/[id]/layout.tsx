import React from "react";
import Container from "@/app/ui/Container";
import LeagueHeader from "@/app/league/_components/LeagueHeader";
import LeagueNav from "@/app/league/_components/LeagueNav";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

const layout = async ({ children, params }: LayoutProps) => {
  const { id } = await params;
  const status = [
    { name: "Overview", href: `/league/${id}` },
    { name: "Table", href: `/league/${id}/table` },
    { name: "Fixtures", href: `/league/${id}/Fixtures` },
    { name: "Squad", href: `/league/${id}/stats` },
    { name: "Stats", href: `/league/${id}/transfers` },
    { name: "Transfer", href: `/league/${id}/news` },
  ];

  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader leagueName="Rayon Sport" leagueCountry="Rwanda" />
        <LeagueNav params={{ id }} status={status} />
      </div>
      {children}
    </Container>
  );
};

export default layout;
