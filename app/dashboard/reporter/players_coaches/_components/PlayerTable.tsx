"use client";

import React, { useMemo, useState, useEffect } from "react";
import { usePlayers, useDeletePlayer } from "@/app/hooks/usePlayers";
import { useLeagues } from "@/app/hooks/useLeagues";
import { useTeams } from "@/app/hooks/useTeams";
import PlayerTableSkeleton from "./PlayerTableSkeleton";
import AddPlayerModal from "./AddPlayerModal";
import EditPlayerModal from "./EditPlayerModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import TablePagination from "./TablePagination";

const PlayerTable = () => {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "">("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<number | null>(null);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 3;

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const { leagues } = useLeagues();
  const { teams: allTeams } = useTeams();
  const { teams: teamsByLeague } = useTeams(
    typeof selectedLeagueId === "number" ? selectedLeagueId : undefined,
  );

  const teamNameById = useMemo(() => {
    const map = new Map<number, string>();
    allTeams.forEach((t) => {
      map.set(t.id, t.name);
    });
    return map;
  }, [allTeams]);

  const { players, total, isLoading, isError } = usePlayers({
    teamId: typeof selectedTeamId === "number" ? selectedTeamId : undefined,
    name: debouncedSearch || undefined,
    page,
    pageSize,
  });

  useEffect(() => {
    setPage(1);
  }, [selectedLeagueId, selectedTeamId, debouncedSearch]);

  const deletePlayer = useDeletePlayer();

  if (isLoading) {
    return <PlayerTableSkeleton />;
  }

  if (isError) {
    return (
      <div className="border-gray-2 mt-6 rounded-xl border">
        <div className="px-6 py-5">
          <h2 className="text-lg font-semibold">Players</h2>
          <p className="mt-2 text-sm text-red-500">Failed to load players.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Players</h2>

          <div className="flex items-center gap-3">
            {/* Filters */}
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
                <option value="">All Leagues</option>
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
                onChange={(e) =>
                  setSelectedTeamId(
                    e.target.value ? Number(e.target.value) : "",
                  )
                }
              >
                <option value="">All Teams</option>
                {teamsByLeague.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search by name"
                className="w-40 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Add button (next to filters) */}
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none"
              type="button"
              onClick={() => setIsAddOpen(true)}
            >
              + Add Player
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="border-t border-gray-100">
        <table className="w-full table-fixed">
          <thead className="bg-white">
            <tr className="text-left text-sm text-gray-600">
              <th className="w-2/5 px-6 py-4">Name</th>
              <th className="w-1/5 px-6 py-4">Team</th>
              <th className="w-1/5 px-6 py-4">Position</th>
              <th className="w-1/12 px-6 py-4">Number</th>
              <th className="w-1/12 px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {players.map((p) => (
              <tr
                key={p.id}
                className="border-b border-gray-100 odd:bg-white even:bg-white hover:bg-gray-50"
              >
                <td className="px-6 py-5 text-sm text-gray-800">
                  {p.fullName}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {teamNameById.get(p.teamId) ?? "-"}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {p.position}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{p.number}</td>

                {/* Action column: icons aligned to the right same visual line as Add button */}
                <td className="px-6 py-5 text-sm text-gray-600">
                  <div className="flex items-center justify-end gap-4">
                    {/* Pencil / Edit icon */}
                    <button
                      aria-label="edit"
                      className="rounded p-1 hover:bg-gray-100"
                      title="Edit"
                      type="button"
                      onClick={() => setEditingPlayerId(p.id)}
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

                    {/* Trash / Delete icon */}
                    <button
                      aria-label="delete"
                      className="rounded p-1 hover:bg-gray-100"
                      title="Delete"
                      type="button"
                      onClick={() => setDeletingPlayerId(p.id)}
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
      <AddPlayerModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditPlayerModal
        open={editingPlayerId != null}
        player={players.find((p) => p.id === editingPlayerId) ?? null}
        onClose={() => setEditingPlayerId(null)}
      />
      <ConfirmDeleteModal
        open={deletingPlayerId != null}
        title="Delete player"
        description="Are you sure you want to delete this player? This action cannot be undone."
        onCancel={() => setDeletingPlayerId(null)}
        loading={deletePlayer.isPending}
        onConfirm={() => {
          if (deletingPlayerId == null) return;
          deletePlayer.mutate(deletingPlayerId, {
            onSettled: () => setDeletingPlayerId(null),
          });
        }}
      />
    </div>
  );
};

export default PlayerTable;
