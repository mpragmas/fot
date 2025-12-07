import React from "react";

type Player = { name: string; team: string; position: string; age: number };
const players: Player[] = Array.from({ length: 5 }).map(() => ({
  name: "Ssekiganda",
  team: "APR FC",
  position: "Midfielder",
  age: 27,
}));

const PlayerTable = () => {
  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Players</h2>

          <div className="flex items-center gap-3">
            {/* Filters */}
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
            </div>

            {/* Add button (next to filters) */}
            <button className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:outline-none">
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
              <th className="w-1/12 px-6 py-4">Age</th>
              <th className="w-1/12 px-6 py-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {players.map((p, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 odd:bg-white even:bg-white hover:bg-gray-50"
              >
                <td className="px-6 py-5 text-sm text-gray-800">{p.name}</td>
                <td className="px-6 py-5 text-sm text-gray-600">{p.team}</td>
                <td className="px-6 py-5 text-sm text-gray-600">
                  {p.position}
                </td>
                <td className="px-6 py-5 text-sm text-gray-600">{p.age}</td>

                {/* Action column: icons aligned to the right same visual line as Add button */}
                <td className="px-6 py-5 text-sm text-gray-600">
                  <div className="flex items-center justify-end gap-4">
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
  );
};

export default PlayerTable;
