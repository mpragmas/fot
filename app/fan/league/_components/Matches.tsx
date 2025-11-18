import React from "react";
import MatchCard from "./MatchCard";
import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";

const Matches = () => {
  const matches = [
    {
      homeTeam: "Man City",
      awayTeam: "Bournemouth",
      homeLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
      awayLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_(2013).svg",
      score: "5 - 2",
    },
    {
      homeTeam: "Sunderland",
      awayTeam: "Everton",
      homeLogo:
        "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_(2013).svg",
      awayLogo:
        "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg",
      time: "10:00 PM",
      date: "Tomorrow",
    },
    {
      homeTeam: "Tottenham",
      awayTeam: "Man United",
      homeLogo:
        "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
      awayLogo:
        "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
      time: "2:30 PM",
      date: "Nov 8",
    },
  ];

  return (
    <div className="dark:bg-dark-1 w-full rounded-2xl p-6 text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Matches</h2>
        <a href="#" className="text-sm text-green-400 hover:underline">
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
