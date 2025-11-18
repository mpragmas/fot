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

const Page: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white p-6 shadow-md">
        <h1 className="mb-8 text-xl font-bold">Rwanda Football</h1>
        <nav className="space-y-4">
          <a
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <span className="material-icons">dashboard</span> Dashboard
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <span className="material-icons">sports_soccer</span> My Matches
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <span className="material-icons">article</span> News Articles
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <span className="material-icons">person</span> Profile
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 p-8">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Reporter Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold">Dushime Egide</p>
              <p className="text-sm text-gray-500">Kigali, Rwanda</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-300" />
            <button className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300">
              Logout
            </button>
          </div>
        </header>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="mb-6 text-3xl font-bold">Welcome Back</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded bg-white p-6 text-center shadow">
              <p className="text-sm text-gray-500">Total Matches covered</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <div className="rounded bg-white p-6 text-center shadow">
              <p className="text-sm text-gray-500">Ongoing matches</p>
              <p className="text-2xl font-bold">1</p>
            </div>
            <div className="rounded bg-white p-6 text-center shadow">
              <p className="text-sm text-gray-500">Completed today</p>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>

        {/* Assigned Matches Table */}
        <div className="rounded bg-white p-6 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Assigned Matches</h3>
            <span className="cursor-pointer text-sm text-blue-600">
              Upcoming and live
            </span>
          </div>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b text-gray-500">
                <th className="py-2">Match</th>
                <th className="py-2">Date/Time</th>
                <th className="py-2">Stadium</th>
                <th className="py-2">Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match) => (
                <tr key={match.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{match.teams}</td>
                  <td className="py-3">{match.date}</td>
                  <td className="py-3">{match.stadium}</td>
                  <td className="py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-sm text-white ${
                        match.status === "Live"
                          ? "bg-red-400"
                          : "bg-blue-200 text-blue-800"
                      }`}
                    >
                      {match.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {match.status === "Live" ? (
                      <button className="rounded bg-blue-200 px-4 py-2 text-blue-800">
                        View Match
                      </button>
                    ) : (
                      <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        Start Match
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
