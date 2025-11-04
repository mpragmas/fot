import React from "react";
import PlayerStatCard from "../ui/PlayerStatsCard";

const TopStats: React.FC = () => {
  const topRated = [
    {
      name: "Erling Haaland",
      team: "Manchester City",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      value: "8.11",
    },
    {
      name: "Bruno Fernandes",
      team: "Manchester United",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
      value: "7.74",
    },
    {
      name: "Nordi Mukiele",
      team: "Sunderland",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/8/82/Sunderland_AFC_logo.svg",
      value: "7.68",
    },
  ];

  const topScorers = [
    {
      name: "Erling Haaland",
      team: "Manchester City",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      value: "13",
    },
    {
      name: "Danny Welbeck",
      team: "Brighton and Hove Albion",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg",
      value: "6",
    },
    {
      name: "Antoine Semenyo",
      team: "Bournemouth",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_(2013).svg",
      value: "6",
    },
  ];

  const topAssists = [
    {
      name: "Jack Grealish",
      team: "Everton",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
      value: "4",
    },
    {
      name: "Mohammed Kudus",
      team: "Tottenham Hotspur",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
      value: "4",
    },
    {
      name: "Quilindschy Hartman",
      team: "Burnley",
      teamLogo:
        "https://upload.wikimedia.org/wikipedia/en/0/02/Burnley_FC_badge.png",
      value: "4",
    },
  ];

  return (
    <div className="dark:text-whitish bg-whitish dark:bg-dark-1 mx-auto mt-5 grid w-full grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-3">
      {/* Top Rated */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top rated</h3>
        {topRated.map((player, index) => (
          <PlayerStatCard key={index} {...player} />
        ))}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>

      {/* Top Scorers */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top scorers</h3>
        {topScorers.map((player, index) => (
          <PlayerStatCard key={index} {...player} />
        ))}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>

      {/* Top Assists */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top assists</h3>
        {topAssists.map((player, index) => (
          <PlayerStatCard key={index} {...player} />
        ))}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>
    </div>
  );
};

export default TopStats;
