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
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900">Fixtures</h1>
      <p className="mt-1 text-sm text-gray-500">Manage all league fixtures.</p>

      {/* Top Filters + Add Reporter */}
      <div className="mt-6 flex justify-end gap-3">
        <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
          <option>League</option>
        </select>

        <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
          <option>Teams</option>
        </select>

        <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700">
          <option>All</option>
        </select>

        {/* + Reporter Button */}
        <button className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
          <span className="text-lg">+</span>
          Reporter
        </button>
      </div>

      {/* Table Card */}
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
            {fixtures.map((fixture) => (
              <tr
                key={fixture.id}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {fixture.match}
                </td>
                <td className="px-6 py-4 text-gray-600">{fixture.date}</td>
                <td className="px-6 py-4 text-gray-600">{fixture.stadium}</td>

                {/* STATUS BADGES EXACT FROM IMAGE */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      fixture.status === "Live"
                        ? "bg-red-100 text-red-600"
                        : fixture.status === "Completed"
                          ? "bg-gray-200 text-gray-700"
                          : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {fixture.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-gray-700">{fixture.reporter}</td>

                {/* ACTION BUTTONS EXACT LIKE IMAGE */}
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-3">
                    {/* Reporter button */}
                    <button className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-200">
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
                    <button className="rounded p-1 hover:bg-gray-100">
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
                    <button className="rounded p-1 hover:bg-gray-100">
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
