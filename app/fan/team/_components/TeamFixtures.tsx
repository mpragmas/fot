import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";
import React from "react";

interface Fixture {
  date: string;
  competition: string;
  home: boolean;
  team1: string;
  team1Logo: string;
  team2: string;
  team2Logo: string;
  time: string;
}

const fixtures: Fixture[] = [
  {
    date: "Today",
    competition: "Champions League",
    home: true,
    team1: "Atletico Madrid",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    team2: "Union St.Gilloise",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    time: "10:00 PM",
  },
  {
    date: "Sat, Nov 8",
    competition: "LaLiga",
    home: true,
    team1: "Atletico Madrid",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    team2: "Levante",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    time: "7:30 PM",
  },
  {
    date: "Sun, Nov 23",
    competition: "LaLiga",
    home: false,
    team1: "Getafe",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    team2: "Atletico Madrid",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    time: "7:30 PM",
  },
  {
    date: "Wed, Nov 26",
    competition: "Champions League",
    home: true,
    team1: "Atletico Madrid",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    team2: "Inter",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    time: "10:00 PM",
  },
  {
    date: "Sat, Nov 29",
    competition: "LaLiga",
    home: true,
    team1: "Atletico Madrid",
    team1Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    team2: "Real Oviedo",
    team2Logo: "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
    time: "10:00 PM",
  },
];

const TeamFixtures: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 bg-black p-4 font-sans text-white">
      {/* Fixtures Section */}
      <div className="w-80 rounded-2xl bg-[#121212] p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between">
          <LeftArrow padding="1" />
          <h2 className="text-sm font-semibold">Fixtures</h2>
          <RightArrow padding="1" />
        </div>

        <div className="space-y-3">
          {fixtures.map((match, index) => (
            <div
              key={index}
              className="border-b border-gray-800 pb-2 last:border-none"
            >
              <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                <span className="text-[10px]">{match.date}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px]">{match.competition}</span>
                  <span className="text-[10px]">
                    {match.competition === "Champions League" ? "⚽" : "🏆"}
                  </span>
                </div>
              </div>

              <div className="flex w-full items-center px-2 text-sm">
                <div className="flex w-32 min-w-0 items-center gap-1">
                  <img
                    src={match.team1Logo}
                    alt={match.team1}
                    className="h-5 w-5"
                  />
                  <span className="max-w-[110px] overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                    {match.team1}
                  </span>
                </div>
                <p className="dark:text-dark-5 flex w-16 flex-none flex-col items-center font-bold">
                  <span className="text-[10px]">
                    {match.time.split(" ")[0]}
                  </span>
                  <span className="text-[10px]">
                    {match.time.split(" ")[1]}
                  </span>
                </p>
                <div className="flex w-32 min-w-0 items-center gap-1">
                  <img
                    src={match.team2Logo}
                    alt={match.team2}
                    className="h-5 w-5"
                  />
                  <span className="max-w-[110px] overflow-hidden text-xs text-ellipsis whitespace-nowrap">
                    {match.team2}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stadium Info Section */}
      <div className="w-80 space-y-3 rounded-2xl bg-[#121212] p-4 shadow-lg">
        <h2 className="text-sm font-semibold text-gray-200">Stadium</h2>

        <div className="flex items-start gap-2">
          <span className="text-xl">🚗</span>
          <div>
            <p className="text-sm font-medium">Riyadh Air Metropolitano</p>
            <p className="text-xs text-gray-400">Madrid</p>
          </div>
        </div>

        <div className="flex justify-between border-t border-gray-800 pt-2 text-center text-xs text-gray-300">
          <div>
            <p className="text-sm font-semibold">70,460</p>
            <p>Capacity</p>
          </div>
          <div>
            <p className="text-sm font-semibold">1994</p>
            <p>Opened</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Grass</p>
            <p>Surface</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamFixtures;
