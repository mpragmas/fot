import React from "react";
import LeagueHeader from "@/app/league/_components/LeagueHeader";
import Container from "@/app/ui/Container";
import LeagueNav from "@/app/league/_components/LeagueNav";

interface LayoutProps {
  children: React.ReactNode;
  params: { id: string };
}

const LeagueLayout = ({ children, params }: LayoutProps) => {
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader />
        <LeagueNav params={params} />
      </div>
      {children}
    </Container>
  );
};

export default LeagueLayout;
