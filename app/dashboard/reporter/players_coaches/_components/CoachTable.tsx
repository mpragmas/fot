"use client";

import React, { useState } from "react";
import { useLeagues } from "@/app/hooks/useLeagues";
import { useTeams } from "@/app/hooks/useTeams";
import AddTeamModal from "./AddTeamModal";
import EditCoachModal from "./EditCoachModal";
import TeamTableSkeleton from "./TeamTableSkeleton";
import TablePagination from "./TablePagination";

const CoachTable = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "">("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { leagues } = useLeagues();

  // Teams list for filters (scoped by league)
  const { teams: teamsByLeague } = useTeams(
    typeof selectedLeagueId === "number" ? selectedLeagueId : undefined,
  );

  // Teams data for table with pagination
  const { teams, total, isLoading, isError } = useTeams({
    leagueId:
      typeof selectedLeagueId === "number" ? selectedLeagueId : undefined,
    page,
    pageSize,
  });

  const filteredTeams =
    typeof selectedTeamId === "number"
      ? teams.filter((t) => t.id === selectedTeamId)
      : teams;

  if (isLoading) {
    return <TeamTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-gray-2 mt-6 rounded-xl border">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold">Coaches</h2>
          <p className="mt-2 text-sm text-red-500">Failed to load coaches.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Coaches</h2>
            <p className="mt-1 text-xs text-gray-500"> </p>
          </div>

          {/* Filters + Add button (right side) */}
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              aria-label="league"
              value={selectedLeagueId}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";
                setSelectedLeagueId(value);
                setSelectedTeamId("");
                setPage(1);
              }}
            >
              <option value="">All leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              aria-label="teams"
              value={selectedTeamId}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";
                setSelectedTeamId(value);
                setPage(1);
              }}
            >
              <option value="">All Teams</option>
              {teamsByLeague.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            <button
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
              type="button"
              onClick={() => setIsAddOpen(true)}
            >
              <span className="text-sm font-medium">+ Add Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coach List - Card based */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex flex-col gap-3">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <h3 className="font-semibold text-gray-900">
                  {team.coach || "No coach set"}
                </h3>
                <p className="mt-1 text-sm text-gray-600">{team.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTeamId(team.id)}
                className="text-dark rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
      <AddTeamModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditCoachModal
        open={editingTeamId != null}
        team={teams.find((t) => t.id === editingTeamId) ?? null}
        onClose={() => setEditingTeamId(null)}
      />
    </div>
  );
};

export default CoachTable;
