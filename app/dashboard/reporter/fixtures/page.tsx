import React from "react";

type Fixture = {
  id: number;
  match: string;
  date: string;
  stadium: string;
  status: "Live" | "Completed" | "Upcoming";
  reporter: string;
};

const fixtures: Fixture[] = [
  {
    id: 1,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Live",
    reporter: "Eric",
  },
  {
    id: 2,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Completed",
    reporter: "Eric",
  },
  {
    id: 3,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Completed",
    reporter: "Eric",
  },
  {
    id: 4,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Upcoming",
    reporter: "Eric",
  },
  {
    id: 5,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Upcoming",
    reporter: "Eric",
  },
  {
    id: 6,
    match: "APR vs RAY",
    date: "oct 8, 6:00",
    stadium: "Amahoro",
    status: "Upcoming",
    reporter: "Eric",
  },
];

export default function FixturesPage() {
  return (
    <div className="p-8 text-gray-800">
      <div className="mx-auto">
        {/* Header */}
        <h1 className="text-2xl font-semibold">Fixtures</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all league fixtures.
        </p>

        {/* Fixture Table */}
        <div className="border-gray-2 mt-6 rounded-xl border">
          <div className="px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">Fixture</h2>
                <p className="mt-1 text-xs text-gray-500"> </p>
              </div>

              {/* Filters + Add button (right side) */}
              <div className="flex items-center gap-3">
                <select
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  aria-label="league"
                >
                  <option>League</option>
                </select>

                <select
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  aria-label="teams"
                >
                  <option>Teams</option>
                </select>

                <select
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm transition-all hover:border-gray-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  aria-label="all"
                >
                  <option>All</option>
                </select>

                <button className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none">
                  + Reporter
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="border-t border-gray-100">
            <table className="w-full table-fixed">
              <thead className="bg-white">
                <tr className="text-left text-sm text-gray-600">
                  <th className="w-1/6 px-6 py-4">Match</th>
                  <th className="w-1/6 px-6 py-4">Date</th>
                  <th className="w-1/6 px-6 py-4">Stadium</th>
                  <th className="w-1/6 px-6 py-4">Status</th>
                  <th className="w-1/6 px-6 py-4">Reporter</th>
                  <th className="w-1/6 px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {fixtures.map((fixture) => (
                  <tr
                    key={fixture.id}
                    className="border-b border-gray-100 odd:bg-white even:bg-white hover:bg-gray-50"
                  >
                    <td className="px-6 py-5 text-sm text-gray-800">
                      {fixture.match}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {fixture.date}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {fixture.stadium}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          fixture.status === "Live"
                            ? "bg-red-500 text-white"
                            : fixture.status === "Completed"
                              ? "bg-gray-200 text-gray-700"
                              : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {fixture.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">
                      {fixture.reporter}
                    </td>

                    {/* Action column: icons aligned to the right */}
                    <td className="px-6 py-5 text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-4">
                        {/* + Reporter button */}
                        <button
                          aria-label="add reporter"
                          className="flex items-center gap-1 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          title="Add Reporter"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          + Reporter
                        </button>

                        {/* Pencil / Edit icon */}
                        <button
                          aria-label="edit"
                          className="rounded p-1 hover:bg-gray-100"
                          title="Edit"
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
        </div>
      </div>
    </div>
  );
}
