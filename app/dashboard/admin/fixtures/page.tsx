"use client";

import React, { useMemo, useState } from "react";
import { useLeagues } from "@/app/hooks/useLeagues";
import { useTeams } from "@/app/hooks/useTeams";
import { useMatchStatusSocket } from "@/app/hooks/useMatchStatusSocket";
import {
  useFixtures,
  useDeleteFixture,
  FixtureStatus,
  type FixtureItem,
} from "@/app/hooks/useFixtures";
import FixturesTableSkeleton from "./_components/FixturesTableSkeleton";
import AddFixtureModal from "./_components/AddFixtureModal";
import EditFixtureModal from "./_components/EditFixtureModal";
import AssignReporterModal from "./_components/AssignReporterModal";
import ConfirmDeleteModal from "@/app/dashboard/reporter/players_coaches/_components/ConfirmDeleteModal";

export default function FixturesPage() {
  const [selectedLeagueId, setSelectedLeagueId] = useState<number | "">("");
  const [selectedTeamId, setSelectedTeamId] = useState<number | "">("");
  const [selectedStatus, setSelectedStatus] = useState<"" | FixtureStatus>("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<FixtureItem | null>(
    null,
  );
  const [deletingFixtureId, setDeletingFixtureId] = useState<number | null>(
    null,
  );
  const [assignFixture, setAssignFixture] = useState<FixtureItem | null>(null);

  const { leagues } = useLeagues();
  const { teams: teamsByLeague } = useTeams(
    typeof selectedLeagueId === "number" ? selectedLeagueId : undefined,
  );
  const { fixtures, isLoading, isError } = useFixtures();
  const deleteFixture = useDeleteFixture();

  // Subscribe to live match status updates so fixture statuses update in real time
  useMatchStatusSocket();

  const filteredFixtures = useMemo(
    () =>
      fixtures.filter((fixture) => {
        if (
          typeof selectedLeagueId === "number" &&
          fixture.leagueId !== selectedLeagueId
        ) {
          return false;
        }

        if (typeof selectedTeamId === "number") {
          const isHome = fixture.homeTeamId === selectedTeamId;
          const isAway = fixture.awayTeamId === selectedTeamId;
          if (!isHome && !isAway) return false;
        }

        if (selectedStatus && fixture.status !== selectedStatus) {
          return false;
        }

        return true;
      }),
    [fixtures, selectedLeagueId, selectedTeamId, selectedStatus],
  );

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Fixtures</h1>
      <p className="mt-1 text-sm text-gray-500">Manage all league fixtures.</p>

      {/* Top Filters + Add Reporter */}
      <div className="mt-6 flex justify-end gap-3">
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          value={selectedLeagueId}
          onChange={(e) => {
            const value = e.target.value ? Number(e.target.value) : "";
            setSelectedLeagueId(value);
            setSelectedTeamId("");
          }}
        >
          {/* // this one as default leageu */}
          <option value="">All Leagues</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          value={selectedTeamId}
          onChange={(e) =>
            setSelectedTeamId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">All Teams</option>
          {teamsByLeague.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700"
          value={selectedStatus}
          onChange={(e) =>
            setSelectedStatus(
              e.target.value ? (e.target.value as FixtureStatus) : "",
            )
          }
        >
          <option value="">Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>

        {/* + Reporter Button */}
        <button
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          type="button"
          onClick={() => setIsAddOpen(true)}
        >
          Add Fixtures
        </button>
      </div>

      {/* Table Card */}
      {isLoading ? (
        <FixturesTableSkeleton />
      ) : isError ? (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
          Failed to load fixtures.
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-3 font-medium text-gray-900">
            Fixture
          </div>

          {/* Table */}
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-semibold text-gray-600">
                <th className="px-6 py-3">Match</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Stadium</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Reporter</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {filteredFixtures.map((fixture) => {
                const statusLabel =
                  fixture.status === "LIVE"
                    ? "Live"
                    : fixture.status === "COMPLETED"
                      ? "Completed"
                      : "Upcoming";

                return (
                  <tr
                    key={fixture.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {fixture.homeTeamName} vs {fixture.awayTeamName}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(fixture.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {fixture.stadium}
                    </td>

                    {/* STATUS BADGES EXACT FROM IMAGE */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                          fixture.status === "LIVE"
                            ? "bg-red-100 text-red-600"
                            : fixture.status === "COMPLETED"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-700">
                      {fixture.reporterName
                        ? fixture.reporterName
                        : fixture.reporterId != null
                          ? `Reporter #${fixture.reporterId}`
                          : "-"}
                    </td>

                    {/* ACTION BUTTONS EXACT LIKE IMAGE */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3">
                        {/* Reporter button */}
                        <button
                          className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                          type="button"
                          onClick={() => setAssignFixture(fixture)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Reporter
                        </button>

                        {/* Edit icon */}
                        <button
                          className="rounded p-1 hover:bg-gray-100"
                          type="button"
                          onClick={() => setEditingFixture(fixture)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.232 5.232l3.536 3.536M4 20h4.586a1 1 0 00.707-.293
                    l9.414-9.414a1 1 0 000-1.414L17.414 4.293a1 1 0 00-1.414
                    0L6.586 13.707A1 1 0 006.293 14.414V19a1 1 0 001 1H4z"
                            />
                          </svg>
                        </button>

                        {/* Delete icon */}
                        <button
                          className="rounded p-1 hover:bg-gray-100"
                          type="button"
                          onClick={() => setDeletingFixtureId(fixture.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2
                    2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9
                    7V5a2 2 0 012-2h2a2 2 0 012 2v2"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AddFixtureModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditFixtureModal
        open={editingFixture != null}
        fixture={editingFixture}
        onClose={() => setEditingFixture(null)}
      />
      <AssignReporterModal
        open={assignFixture != null}
        fixture={assignFixture}
        onClose={() => setAssignFixture(null)}
      />
      <ConfirmDeleteModal
        open={deletingFixtureId != null}
        title="Delete fixture"
        description="Are you sure you want to delete this fixture? This action cannot be undone."
        onCancel={() => setDeletingFixtureId(null)}
        loading={deleteFixture.isPending}
        onConfirm={() => {
          if (deletingFixtureId == null) return;
          deleteFixture.mutate(deletingFixtureId, {
            onSettled: () => setDeletingFixtureId(null),
          });
        }}
      />
    </div>
  );
}
