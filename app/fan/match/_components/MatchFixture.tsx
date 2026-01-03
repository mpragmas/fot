import React from "react";
import Image from "next/image";

type Team = { name: string; short: string; color: string };
type Fixture = {
  home: Team;
  away: Team;
  hs: number;
  as: number;
  status: "FT" | "HT" | "LIVE";
};

const Crest: React.FC<{ team: Team }> = ({ team }) => (
  <div
    className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold"
    style={{ backgroundColor: team.color }}
  >
    <span className="text-white/95">{team.short}</span>
  </div>
);

const Row: React.FC<{ f: Fixture; highlighted?: boolean }> = ({
  f,
  highlighted,
}) => (
  <div className="px-3 py-3">
    <div
      className={[
        "grid grid-cols-6 items-center rounded-xl",
        highlighted ? "bg-[#242424]" : "",
      ].join(" ")}
    >
      <div className="col-span-5">
        <div className="flex items-center gap-2 py-2">
          <Crest team={f.home} />
          <div className="flex-1 text-sm text-gray-200">{f.home.name}</div>
          <div className="w-6 text-right text-sm font-semibold text-gray-200">
            {f.hs}
          </div>
        </div>
        <div className="flex items-center gap-2 py-2">
          <Crest team={f.away} />
          <div className="flex-1 text-sm text-gray-200">{f.away.name}</div>
          <div className="w-6 text-right text-sm font-semibold text-gray-200">
            {f.as}
          </div>
        </div>
      </div>
      <div className="col-span-1 flex items-center justify-center gap-3">
        <div className="dark:bg-dark-2 h-[44px] w-px" />
        <div className="text-xs font-semibold text-gray-300">{f.status}</div>
      </div>
    </div>
  </div>
);

const data: Fixture[] = [
  {
    home: { name: "Brighton", short: "BHA", color: "#2563eb" },
    away: { name: "Leeds", short: "LEE", color: "#fbbf24" },
    hs: 3,
    as: 0,
    status: "FT",
  },
  {
    home: { name: "Burnley", short: "BUR", color: "#7c2d12" },
    away: { name: "Arsenal", short: "ARS", color: "#ef4444" },
    hs: 0,
    as: 2,
    status: "FT",
  },
  {
    home: { name: "Crystal Palace", short: "CRY", color: "#1d4ed8" },
    away: { name: "Brentford", short: "BRE", color: "#dc2626" },
    hs: 2,
    as: 0,
    status: "FT",
  },
  {
    home: { name: "Fulham", short: "FUL", color: "#6b7280" },
    away: { name: "Wolves", short: "WOL", color: "#f59e0b" },
    hs: 3,
    as: 0,
    status: "FT",
  },
  {
    home: { name: "Nottm Forest", short: "NFO", color: "#dc2626" },
    away: { name: "Man United", short: "MUN", color: "#ef4444" },
    hs: 2,
    as: 2,
    status: "FT",
  },
];

const MatchFixture: React.FC = () => {
  return (
    <div className="mt-5 w-full max-w-sm rounded-2xl bg-[#1a1a1a] text-gray-200 shadow-lg">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <div className="text-sm font-semibold">Premier League</div>
          <div className="text-xs text-gray-400">Round 10</div>
        </div>
        <Image src="/images/logo.png" alt="League" width={40} height={40} />
      </div>
      <div className="divide-dark-2 divide-y">
        {data.map((f, i) => (
          <Row
            key={`${f.home.short}-${f.away.short}-${f.hs}-${f.as}`}
            f={f}
            highlighted={i === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchFixture;
