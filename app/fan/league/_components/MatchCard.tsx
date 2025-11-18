import React from "react";
import Image from "next/image";

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string;
  awayLogo: string;
  score?: string;
  time?: string;
  date?: string;
}

const MatchCard = ({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  score,
  time,
  date,
}: MatchCardProps) => {
  return (
    <div className="dark:text-whitish dark:border-dark-2 flex w-full flex-col items-center justify-between rounded-2xl border px-14 py-5 shadow-lg">
      <div className="flex w-full items-center gap-10">
        <div className="flex flex-col items-center gap-5">
          <Image src={homeLogo} alt={homeTeam} className="mb-2 h-10 w-10" width={40} height={40} />
          <span className="text-sm whitespace-nowrap">{homeTeam}</span>
        </div>

        <div className="flex flex-col items-center gap-5">
          {score ? (
            <>
              <p className="text-2xl font-semibold whitespace-nowrap">
                {score}
              </p>
              <p className="text-green mt-1 text-xs whitespace-nowrap">90&#39;</p>
            </>
          ) : (
            <>
              <p className="text-lg font-semibold whitespace-nowrap">{time}</p>
              <p className="mt-1 text-xs text-gray-400">{date}</p>
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-5">
          <Image src={awayLogo} alt={awayTeam} className="mb-2 h-10 w-10" width={40} height={40} />
          <span className="text-sm whitespace-nowrap">{awayTeam}</span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
