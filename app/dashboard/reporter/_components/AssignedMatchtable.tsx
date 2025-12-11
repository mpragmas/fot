"use client";

import React from "react";
import {
  ReporterMatchItem,
  useReporterMatches,
} from "@/app/hooks/userReporterMatchs";

type MatchRowProps = {
  match: ReporterMatchItem;
};

const MatchRow = React.memo(({ match }: MatchRowProps) => {
  const isLive = match.status === "LIVE";

  return (
    <tr className="border-gray-2 border-b hover:bg-gray-50">
      <td className="py-3 text-left">
        {match.homeTeamName} vs {match.awayTeamName}
      </td>

      <td className="py-3 text-left">{match.dateFormatted}</td>

      <td className="py-3 text-left">{match.stadium || "-"}</td>

      <td className="py-3 text-left">
        <span
          className={`rounded-full px-3 py-1 text-sm ${
            isLive ? "bg-red-2 text-red-1" : "bg-blue-3 text-blue-2"
          }`}
        >
          {match.status}
        </span>
      </td>

      <td className="py-3 text-right">
        {isLive ? (
          <button className="text-blue-2 bg-blue-3 rounded px-4 py-2">
            View Match
          </button>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <button className="border-blue-2 text-blue-2 rounded border px-4 py-2">
              Lineup
            </button>
            <button className="bg-blue-2 text-whitish rounded px-4 py-2">
              Start Match
            </button>
          </div>
        )}
      </td>
    </tr>
  );
});

const AssignedMatchtable: React.FC = () => {
  const { matches, isLoading, isError, error, hasReporter } =
    useReporterMatches();

  // if (!hasReporter)
  //   return (
  //     <p className="text-sm text-gray-500">
  //       No reporter profile found for this user.
  //     </p>
  //   );

  if (isLoading) {
    return (
      <div className="mt-4 overflow-x-auto rounded-lg border bg-white p-4">
        <div className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 space-y-2">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 rounded bg-gray-50 p-3"
            >
              <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError)
    return (
      <p className="text-sm text-red-500">
        Failed to load matches: {error instanceof Error ? error.message : ""}
      </p>
    );

  if (matches.length === 0)
    return (
      <p className="text-sm text-gray-500">You have no assigned matches yet.</p>
    );

  return (
    <div className="bg-whitish border-gray-2 mx-8 my-4 rounded-xl border-2 p-6 px-8 py-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Assigned Matches</h3>
        <span className="text-gray-1 cursor-pointer text-sm font-semibold">
          Upcoming and live
        </span>
      </div>

      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="text-gray-1 border-gray-2 border-b">
            <th className="py-2 text-left">Match</th>
            <th className="py-2 text-left">Date/Time</th>
            <th className="py-2 text-left">Stadium</th>
            <th className="py-2 text-left">Status</th>
            <th className="py-2 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {matches.map((match) => (
            <MatchRow key={match.id} match={match} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssignedMatchtable;
