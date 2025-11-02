import React from "react";
import Container from "../ui/Container";
import LeagueHeader from "../components/LeagueHeader";
import Table from "../components/Table";
import LeagueNav from "../components/LeagueNav";

const League = () => {
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 rounded-2xl p-5">
        <LeagueHeader />
        <LeagueNav />
      </div>
      <Table />
    </Container>
  );
};

export default League;
