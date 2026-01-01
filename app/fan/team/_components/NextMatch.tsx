import React from "react";

type NextMatchTeam = {
  name: string;
  img: string;
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

const FALLBACK_NEXT_MATCH: NextMatchData = {
  competition: "Champions League",
  emoji: "⚽",
  time: "10:00 PM",
  day: "Today",
  teams: [
    {
      name: "Atletico Madrid",
      img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
      alt: "Atletico",
    },
    {
      name: "Union St.Gilloise",
      img: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
      alt: "Union",
    },
  ],
};

const NextMatch: React.FC<Props> = ({ match }) => {
  const nextMatch = match ?? FALLBACK_NEXT_MATCH;
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
            src={nextMatch.teams[0].img}
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
            src={nextMatch.teams[1].img}
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
