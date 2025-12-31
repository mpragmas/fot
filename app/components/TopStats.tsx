import React from "react";
import PlayerStatCard from "../ui/PlayerStatsCard";

type StatCardItem = {
  name: string;
  team: string;
  teamLogo: string;
  value: string | number;
};

type TopStatsProps = {
  topRated?: StatCardItem[];
  topScorers?: StatCardItem[];
  topAssists?: StatCardItem[];
};

const TopStats: React.FC<TopStatsProps> = ({
  topRated,
  topScorers,
  topAssists,
}) => {
  const hasTopRated = topRated && topRated.length > 0;
  const hasTopScorers = topScorers && topScorers.length > 0;
  const hasTopAssists = topAssists && topAssists.length > 0;

  return (
    <div className="dark:text-whitish bg-whitish dark:bg-dark-1 mx-auto mt-5 grid w-full grid-cols-1 gap-6 rounded-2xl p-6 sm:grid-cols-3">
      {/* Top Rated */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top rated</h3>
        {hasTopRated ? (
          topRated!.map((player, index) => (
            <PlayerStatCard key={index} {...player} />
          ))
        ) : (
          <div className="text-sm text-gray-400">No stats yet</div>
        )}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>

      {/* Top Scorers */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top scorers</h3>
        {hasTopScorers ? (
          topScorers!.map((player, index) => (
            <PlayerStatCard key={index} {...player} />
          ))
        ) : (
          <div className="text-sm text-gray-400">No stats yet</div>
        )}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>

      {/* Top Assists */}
      <div className="rounded-xl p-4">
        <h3 className="mb-4 text-base font-semibold">Top assists</h3>
        {hasTopAssists ? (
          topAssists!.map((player, index) => (
            <PlayerStatCard key={index} {...player} />
          ))
        ) : (
          <div className="text-sm text-gray-400">No stats yet</div>
        )}
        <div className="text-whitsh mt-3 cursor-pointer text-center text-sm hover:text-white">
          All
        </div>
      </div>
    </div>
  );
};

export default TopStats;
