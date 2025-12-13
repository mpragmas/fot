

import React from "react";
import { ReporterMatchItem } from "@/app/hooks/userReporterMatchs";
import TablePagination from "../../players_coaches/_components/TablePagination";

interface AssigneeMatchTableProps {
  matches: ReporterMatchItem[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  sortField: string;
  sortOrder: "asc" | "desc";
  onSort: (field: string) => void;
}

const AssigneeMatchTable = ({
  matches,
  loading,
  total,
  page,
  pageSize,
  setPage,
  sortField,
  sortOrder,
  onSort,
}: AssigneeMatchTableProps) => {
  const renderSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="bg-whitish border-gray-2 mx-8 my-4 rounded-xl border p-6 px-8 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assigned Matches</h3>
        <span className="text-gray-1 cursor-pointer text-sm font-semibold">
          {total} Found
        </span>
      </div>
      {loading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : (
        <>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="text-gray-1 border-gray-2 border-b">
                <th
                  className="cursor-pointer py-2 text-left hover:text-sky-600"
                  onClick={() => onSort("fixture.homeTeam.name")}
                >
                  Match {renderSortIcon("fixture.homeTeam.name")}
                </th>
                <th
                  className="cursor-pointer py-2 text-left hover:text-sky-600"
                  onClick={() => onSort("fixture.date")}
                >
                  Date/Time {renderSortIcon("fixture.date")}
                </th>
                <th
                  className="cursor-pointer py-2 text-left hover:text-sky-600"
                  onClick={() => onSort("fixture.stadium")}
                >
                  Stadium {renderSortIcon("fixture.stadium")}
                </th>
                <th
                  className="cursor-pointer py-2 text-left hover:text-sky-600"
                  onClick={() => onSort("status")}
                >
                  Status {renderSortIcon("status")}
                </th>
                <th className="py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr
                  key={match.id}
                  className="border-gray-2 border-b hover:bg-gray-50"
                >
                  <td className="py-3 text-left">
                    {match.homeTeamName} vs {match.awayTeamName}
                  </td>
                  <td className="py-3 text-left">{match.dateFormatted}</td>
                  <td className="py-3 text-left">{match.stadium || "-"}</td>
                  <td className="py-3 text-left">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        match.status === "COMPLETED"
                          ? "bg-gray-200 text-gray-800"
                          : match.status === "LIVE"
                            ? "bg-red-100 text-red-600 bg-opacity-10"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {match.status === "LIVE" ? (
                      <button className="rounded bg-blue-100 px-4 py-2 text-blue-600 hover:bg-blue-200">
                        View Match
                      </button>
                    ) : match.status === "COMPLETED" ? (
                      <button className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
                        Edit Report
                      </button>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <button className="rounded border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-50">
                          Lineup
                        </button>
                        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                          Start Match
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {matches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No matches found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default AssigneeMatchTable;
