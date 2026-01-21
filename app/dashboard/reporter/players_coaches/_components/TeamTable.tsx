"use client";

import React, { useState } from "react";
import { useDeactivateTeam, useTeams } from "@/app/hooks/useTeams";
import { useLeagues } from "@/app/hooks/useLeagues";
import TeamTableSkeleton from "./TeamTableSkeleton";
import AddTeamModal from "./AddTeamModal";
import EditTeamModal from "./EditTeamModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import TablePagination from "./TablePagination";

const TeamTable = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "">("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTeamId, setEditingTeamId] = useState<number | null>(null);
  const [deletingTeamId, setDeletingTeamId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { leagues } = useLeagues();
  const { teams, total, isLoading, isError } = useTeams({
    leagueId:
      typeof selectedLeagueId === "number" ? selectedLeagueId : undefined,
    page,
    pageSize,
  });
  const deactivateTeam = useDeactivateTeam();

  if (isLoading) {
    return <TeamTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-gray-2 mt-6 rounded-xl border">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold">Teams</h2>
          <p className="mt-2 text-sm text-red-500">Failed to load teams.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Teams</h2>
            <p className="mt-1 text-xs text-gray-500"> </p>
          </div>

          {/* Filters + Add button (right side) */}
          <div className="flex items-center gap-3">
            <select
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              aria-label="league"
              value={selectedLeagueId}
              onChange={(e) =>
                setSelectedLeagueId(
                  e.target.value ? Number(e.target.value) : "",
                )
              }
            >
              <option value="">All leagues</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>

            <button
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
              type="button"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Team
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-gray-100">
        <table className="w-full table-fixed">
          <thead className="bg-white">
            <tr className="text-left text-sm text-gray-600">
              <th className="w-1/5 px-6 py-4">Name</th>
              <th className="w-1/5 px-6 py-4">League</th>
              <th className="w-1/5 px-6 py-4">Coach</th>
              <th className="w-1/6 px-6 py-4">Players Count</th>
              <th className="w-1/6 px-6 py-4">Location</th>
              <th className="w-1/12 px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {teams.map((t, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 odd:bg-white even:bg-white hover:bg-gray-50"
              >
                <td className="px-6 py-5 text-sm text-gray-800">
                  <div className="flex items-center gap-2">
                    <img
                      src={t.logo ?? "/images/default team logo.png"}
                      alt={t.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span>{t.name}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {t.leagueName}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{t.coach}</td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {t.playersCount}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {t.location}
                </td>

                {/* Action column: icons aligned to the right */}
                <td className="px-6 py-5 text-sm text-gray-600">
                  <div className="flex items-center justify-end gap-4">
                    {/* Pencil / Edit icon */}
                    <button
                      aria-label="edit"
                      className="rounded p-1 hover:bg-gray-100"
                      title="Edit"
                      type="button"
                      onClick={() => setEditingTeamId(t.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293l9.414-9.414a1 1 0 000-1.414L17.414 4.293a1 1 0 00-1.414 0L6.586 13.707A1 1 0 006.293 14.414V19a1 1 0 001 1H4z"
                        />
                      </svg>
                    </button>

                    {/* Trash / Deactivate icon */}
                    <button
                      aria-label="deactivate"
                      className="rounded p-1 hover:bg-gray-100"
                      title="Deactivate"
                      type="button"
                      onClick={() => setDeletingTeamId(t.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TablePagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
      />
      <AddTeamModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditTeamModal
        open={editingTeamId != null}
        team={teams.find((t) => t.id === editingTeamId) ?? null}
        onClose={() => setEditingTeamId(null)}
      />
      <ConfirmDeleteModal
        open={deletingTeamId != null}
        title="Deactivate team"
        description="Are you sure you want to deactivate this team? Existing matches will keep their history, but this team will no longer appear in future selections."
        onCancel={() => setDeletingTeamId(null)}
        loading={deactivateTeam.isPending}
        onConfirm={() => {
          if (deletingTeamId == null) return;
          deactivateTeam.mutate(deletingTeamId, {
            onSettled: () => setDeletingTeamId(null),
          });
        }}
      />
    </div>
  );
};

export default TeamTable;
