import React from "react";

const matches = [
  {
    id: 1,
    teams: "APR vs RAY",
    date: "10/12/2025, 6:00 PM",
    stadium: "Amahoro Stadium",
    status: "Upcoming",
  },
  {
    id: 2,
    teams: "APR vs RAY",
    date: "10/12/2025, 6:00 PM",
    stadium: "Amahoro Stadium",
    status: "Live",
  },
  {
    id: 3,
    teams: "APR vs RAY",
    date: "10/12/2025, 6:00 PM",
    stadium: "Amahoro Stadium",
    status: "Upcoming",
  },
];

const AssigneeMatchtable = () => {
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
            <tr
              key={match.id}
              className="border-gray-2 border-b hover:bg-gray-50"
            >
              <td className="py-3 text-left">{match.teams}</td>
              <td className="py-3 text-left">{match.date}</td>
              <td className="py-3 text-left">{match.stadium}</td>
              <td className="py-3 text-left">
                <span
                  className={`rounded-full px-3 py-1 text-sm ${
                    match.status === "Live"
                      ? "bg-red-2 text-red-1"
                      : "bg-blue-3 text-blue-2"
                  }`}
                >
                  {match.status}
                </span>
              </td>
              <td className="py-3 text-right">
                {match.status === "Live" ? (
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
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AssigneeMatchtable;
