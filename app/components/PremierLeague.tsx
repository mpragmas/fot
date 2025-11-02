import React from "react";

const PremierLeaguePage = () => {
  // Mock data
  const standings = [
    { pos: 1, team: "Manchester City", played: 38, gd: "+61", pts: 89 },
    { pos: 2, team: "Arsenal", played: 38, gd: "+49", pts: 86 },
    { pos: 3, team: "Liverpool", played: 38, gd: "+46", pts: 82 },
    { pos: 4, team: "Aston Villa", played: 38, gd: "+21", pts: 68 },
    { pos: 5, team: "Tottenham", played: 38, gd: "+15", pts: 66 },
  ];

  const fixtures = [
    {
      date: "Sun, Aug 17",
      home: "Manchester United",
      away: "Fulham",
      time: "16:30",
    },
    { date: "Mon, Aug 18", home: "Arsenal", away: "Wolves", time: "20:00" },
    {
      date: "Sat, Aug 23",
      home: "Liverpool",
      away: "Brentford",
      time: "12:30",
    },
  ];

  const news = [
    {
      title: "Haaland wins Golden Boot with 27 goals",
      excerpt: "Norwegian striker tops scoring charts again.",
    },
    {
      title: "Arteta signs contract extension",
      excerpt: "Arsenal manager commits until 2028.",
    },
    {
      title: "VAR changes confirmed for 2025/26 season",
      excerpt: "New protocols aim to reduce delays.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header / Breadcrumb */}
      <div className="bg-slate-800 px-4 py-2 text-sm text-slate-400">
        <span>England</span> <span className="mx-1">›</span>{" "}
        <span>Premier League</span>
      </div>

      {/* League Banner */}
      <div className="flex items-center bg-gradient-to-r from-blue-900 to-slate-800 px-4 py-6">
        <div className="h-16 w-16 rounded-xl border-2 border-dashed bg-slate-200" />{" "}
        {/* Placeholder logo */}
        <div className="ml-4">
          <h1 className="text-2xl font-bold">Premier League</h1>
          <p className="text-slate-300">2025/2026</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-700 bg-slate-800 px-4 py-3 whitespace-nowrap">
        {["Overview", "Table", "Fixtures", "Results", "News", "Stats"].map(
          (tab) => (
            <button
              key={tab}
              className={`mx-1 rounded-md px-4 py-2 text-sm font-medium ${
                tab === "Overview"
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-700 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ),
        )}
      </div>

      <div className="space-y-6 p-4">
        {/* Standings */}
        <section>
          <h2 className="mb-3 text-xl font-bold">Standings</h2>
          <div className="overflow-hidden rounded-lg bg-slate-800">
            {standings.map((team, idx) => (
              <div
                key={idx}
                className="hover:bg-slate-750 flex items-center justify-between border-b border-slate-700 px-4 py-3 last:border-0"
              >
                <div className="flex w-10 items-center">
                  <span className="font-bold">{team.pos}</span>
                </div>
                <div className="flex-1 truncate text-left">{team.team}</div>
                <div className="w-8 text-center">{team.played}</div>
                <div className="w-12 text-center text-green-400">{team.gd}</div>
                <div className="w-8 text-center font-bold">{team.pts}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Fixtures */}
        <section>
          <h2 className="mb-3 text-xl font-bold">Upcoming Fixtures</h2>
          <div className="space-y-3">
            {fixtures.map((match, i) => (
              <div key={i} className="rounded-lg bg-slate-800 p-4">
                <div className="mb-1 text-sm text-slate-400">{match.date}</div>
                <div className="flex items-center justify-between">
                  <span>{match.home}</span>
                  <span className="text-slate-400">vs</span>
                  <span>{match.away}</span>
                  <span className="rounded bg-blue-600 px-2 py-1 text-xs font-bold">
                    {match.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* News */}
        <section>
          <h2 className="mb-3 text-xl font-bold">Latest News</h2>
          <div className="space-y-4">
            {news.map((item, i) => (
              <div
                key={i}
                className="hover:bg-slate-750 cursor-pointer rounded-lg bg-slate-800 p-4"
              >
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-400">{item.excerpt}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PremierLeaguePage;
