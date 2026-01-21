import React from "react";

type NextMatchTeam = {
  name: string;
  logo: string;
  alt: string;
};

type NextMatchData = {
  competition: string;
  emoji: string;
  time: string;
  day: string;
  teams: [NextMatchTeam, NextMatchTeam];
};

type Props = {
  match?: NextMatchData | null;
};

const NextMatch: React.FC<Props> = ({ match }) => {
  if (!match) return null;

  const nextMatch = match;
  return (
    <div className="flex w-[50%] flex-col justify-between rounded-xl bg-[#121212] p-5 font-bold shadow-lg">
      <div className="mb-3 flex items-center justify-between text-sm text-gray-300">
        <span>Next match</span>
        <div className="flex items-center gap-1">
          <span className="dark:text-dark-4 text-sm">
            {nextMatch.competition}
          </span>
          <span>{nextMatch.emoji}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center">
          <img
            src={nextMatch.teams[0].logo}
            alt={nextMatch.teams[0].alt}
            className="h-7 w-7"
          />
          <span className="mt-2 text-sm">{nextMatch.teams[0].name}</span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-lg font-semibold">{nextMatch.time}</span>
          <span className="mt-2 text-xs text-gray-400">{nextMatch.day}</span>
        </div>

        <div className="flex flex-col items-center">
          <img
            src={nextMatch.teams[1].logo}
            alt={nextMatch.teams[1].alt}
            className="h-7 w-7"
          />
          <span className="mt-2 text-sm">{nextMatch.teams[1].name}</span>
        </div>
      </div>
    </div>
  );
};

export default NextMatch;
