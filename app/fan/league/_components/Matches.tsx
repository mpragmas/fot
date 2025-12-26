import React from "react";
import MatchCard from "./MatchCard";
import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";

type MatchesProps = {
  matches: {
    homeTeam: string;
    awayTeam: string;
    homeLogo: string;
    awayLogo: string;
    score?: string;
    time?: string;
    date?: string;
  }[];
  allMatchesHref: string;
};

const Matches = ({ matches, allMatchesHref }: MatchesProps) => {
  return (
    <div className="dark:bg-dark-1 w-full rounded-2xl p-6 text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Matches</h2>
        <a
          href={allMatchesHref}
          className="text-sm text-green-400 hover:underline"
        >
          All matches
        </a>
      </div>

      <div className="flex items-center justify-between gap-4">
        <LeftArrow />

        <div className="scrollbar-hide flex gap-5 overflow-x-auto">
          {matches.map((match, index) => (
            <MatchCard key={index} {...match} />
          ))}
        </div>

        <RightArrow />
      </div>
    </div>
  );
};

export default Matches;
