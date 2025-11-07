import PlayerStatCard from "@/app/ui/PlayerStatsCard";
import React from "react";
import { FaAngleRight } from "react-icons/fa";

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

const LeagueStats = () => {
  return (
    <>
      <div className="dark:bg-dark-1 dark:text-whitish mt-5 space-x-3 rounded-2xl p-5">
        <button className="bg-whitish text-dark dark:bg-whitish dark:text-dark rounded-full px-4 py-1 text-sm font-medium">
          Players
        </button>
        <button className="bg-dark text-whitish dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Teams
        </button>
      </div>

      <div className="mx-auto mt-5 grid w-full grid-cols-1 gap-4 rounded-2xl sm:grid-cols-3">
        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Top Score</h3>
            <FaAngleRight className="mr-4" />
          </div>
          {topRated.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topRated.length - 1} // only non-last ones get border
            />
          ))}
        </div>
        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Assists</h3>
            <FaAngleRight className="mr-4" />
          </div>
          {topRated.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topRated.length - 1} // only non-last ones get border
            />
          ))}
        </div>
        <div className="dark:text-whitish bg-whitish dark:bg-dark-1 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 text-sm font-semibold">Goals + Assists</h3>
            <FaAngleRight className="mr-4" />
          </div>
          {topRated.map((player, index) => (
            <PlayerStatCard
              key={index}
              {...player}
              lastBorder={index !== topRated.length - 1} // only non-last ones get border
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default LeagueStats;
