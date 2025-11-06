import React from "react";
import Image from "next/image";

interface PlayerStatCardProps {
  name: string;
  team: string;
  teamLogo: string;
  value: string | number;
  lastBorder?: boolean;
}

const PlayerStatCard: React.FC<PlayerStatCardProps> = ({
  name,
  team,
  teamLogo,
  value,
  lastBorder = true,
}) => {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        lastBorder ? "border-b border-[#2A2A2A]" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Image
          src={teamLogo}
          alt={team}
          className="rounded-full object-cover"
          width={32}
          height={32}
        />
        <div className="flex flex-col">
          <span className="dark:text-whitish text-dark-1 text-sm font-semibold">
            {name}
          </span>
          <span className="dark:text-dark-3 text-xs">{team}</span>
        </div>
      </div>
      <div className="bg-blue-1 rounded-full px-3 py-1 text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
};

export default PlayerStatCard;
