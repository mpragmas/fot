import React, { JSX } from "react";
import TeamTable from "./_components/TeamTable";
import PlayerTable from "./_components/PlayerTable";
import CoachTable from "./_components/CoachTable";
import TabSwitcher from "./_components/TabSwitcher";

type Props = {
  searchParams: { tab?: string };
};

export default function PlayersPage({ searchParams }: Props): JSX.Element {
  const activeTab = searchParams?.tab || "Teams";

  return (
    <div className="p-8 text-gray-800">
      <div className="mx-auto">
        <h1 className="text-2xl font-semibold">Teams & Players</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage clubs, players, coaches and transfers across the Rwandan
          leagues.
        </p>

        <TabSwitcher />

        {activeTab === "Teams" && <TeamTable />}

        {activeTab === "Players" && <PlayerTable />}

        {activeTab === "Coaches" && <CoachTable />}
      </div>
    </div>
  );
}
