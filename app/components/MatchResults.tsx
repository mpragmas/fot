import React from "react";
import Image from "next/image";

interface Team {
  name: string;
  logo: string;
}

interface Match {
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  status: string;
}

interface MatchResultsProps {
  dateLabel: string;
  matches: Match[];
}

const MatchResults: React.FC<MatchResultsProps> = ({ dateLabel, matches }) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#111] text-white">
      {/* Header Tabs */}
      <div className="flex items-center justify-between rounded-t-2xl bg-[#1a1a1a] px-4 py-3">
        <div className="flex space-x-2">
          {["By date", "By round", "By team"].map((tab, i) => (
            <button
              key={i}
              className={`rounded-full px-4 py-1 text-sm font-medium ${
                i === 0
                  ? "bg-white text-black"
                  : "bg-transparent text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-400">{dateLabel}</div>
      </div>

      {/* Date Section */}
      <div className="flex items-center justify-between bg-[#1e1e1e] px-4 py-3">
        <button className="text-gray-400 hover:text-white">
          <span className="text-lg">‹</span>
        </button>
        <div className="text-sm font-medium">Saturday, November 1</div>
        <button className="text-gray-400 hover:text-white">
          <span className="text-lg">›</span>
        </button>
      </div>

      {/* Match List */}
      <div className="divide-y divide-[#222]">
        {matches.map((match, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-[#141414] px-4 py-3 transition hover:bg-[#1b1b1b]"
          >
            <span className="mr-3 rounded-full bg-[#2a2a2a] px-2 py-0.5 text-xs text-gray-400">
              {match.status}
            </span>
            <div className="flex w-full items-center justify-between">
              <div className="flex w-1/3 items-center space-x-2">
                <Image
                  src={match.homeTeam.logo}
                  alt={match.homeTeam.name}
                  className="h-5 w-5"
                  width={20}
                  height={20}
                />
                <span className="truncate text-sm font-medium text-gray-200">
                  {match.homeTeam.name}
                </span>
              </div>
              <div className="w-1/3 text-center text-sm font-semibold text-gray-100">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="flex w-1/3 items-center justify-end space-x-2">
                <span className="truncate text-right text-sm font-medium text-gray-200">
                  {match.awayTeam.name}
                </span>
                <Image
                  src={match.awayTeam.logo}
                  alt={match.awayTeam.name}
                  className="h-5 w-5"
                  width={20}
                  height={20}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MatchResults;
