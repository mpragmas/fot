import React from "react";
import Container from "@/app/ui/Container";
import LeagueHeader from "@/app/league/_components/LeagueHeader";
import LeagueNav from "@/app/league/_components/LeagueNav";

const layout = ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) => {
  const status = [
    { name: "Overview", href: `/league/${params.id}` },
    { name: "Table", href: `/league/${params.id}/table` },
    { name: "Fixtures", href: `/league/${params.id}/Fixtures` },
    { name: "Squad", href: `/league/${params.id}/stats` },
    { name: "Stats", href: `/league/${params.id}/transfers` },
    { name: "Transfer", href: `/league/${params.id}/news` },
  ];

  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader leagueName="Rayon Sport" leagueCountry="Rwanda" />
        <LeagueNav params={params} status={status} />
      </div>
      {children}
    </Container>
  );
};

export default layout;
