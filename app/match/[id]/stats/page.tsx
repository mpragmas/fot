import React from "react";

type StatKey = "possession" | "corners" | "shotsOnTarget" | "fouls" | "cards";
type Stats = Record<StatKey, { home: number; away: number }>;

const Pill: React.FC<{ value: string; variant: "left" | "right" }> = ({ value, variant }) => (
  <span
    className={[
      "inline-flex min-w-[44px] items-center justify-center rounded-full px-2 py-1 text-xs font-semibold",
      variant === "left" ? "bg-[#2563eb] text-white" : "bg-white text-[#111]",
    ].join(" ")}
  >
    {value}
  </span>
);

const CenterLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-1 text-center text-sm font-medium text-gray-200">{children}</div>
);

const PossessionBar: React.FC<{ left: number; right: number }> = ({ left, right }) => (
  <div className="mx-auto mt-2 flex w-full max-w-xl overflow-hidden rounded-full">
    <div className="flex items-center justify-end bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white" style={{ width: `${left}%` }}>
      {left}%
    </div>
    <div className="w-[2px] bg-[#111]" />
    <div className="flex items-center justify-start bg-white px-3 py-2 text-xs font-semibold text-[#111]" style={{ width: `${right}%` }}>
      {right}%
    </div>
  </div>
);

const StatCenterRow: React.FC<{ label: string; left: string; right: string }> = ({ label, left, right }) => (
  <div className="mx-auto w-full max-w-xl py-3">
    <div className="grid grid-cols-5 items-center">
      <div className="flex justify-start"><Pill value={left} variant="left" /></div>
      <div className="col-span-3"><CenterLabel>{label}</CenterLabel></div>
      <div className="flex justify-end"><Pill value={right} variant="right" /></div>
    </div>
  </div>
);

const stats: Stats = {
  possession: { home: 50, away: 50 },
  corners: { home: 4, away: 7 },
  shotsOnTarget: { home: 7, away: 2 },
  fouls: { home: 10, away: 7 },
  cards: { home: 2, away: 3 },
};

const MatchStats: React.FC = () => {

  return (
    <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex w-full justify-center p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-[#1a1a1a] p-6 shadow-lg">
        <div className="text-center text-base font-semibold">Top stats</div>
        <CenterLabel>Ball possession</CenterLabel>
        <PossessionBar left={stats.possession.home} right={stats.possession.away} />

        <div className="mt-4 space-y-1">
          <StatCenterRow label="Corners" left={String(stats.corners.home)} right={String(stats.corners.away)} />
          <StatCenterRow label="Shots on target" left={String(stats.shotsOnTarget.home)} right={String(stats.shotsOnTarget.away)} />
          <StatCenterRow label="Fouls committed" left={String(stats.fouls.home)} right={String(stats.fouls.away)} />
          <StatCenterRow label="Cards" left={String(stats.cards.home)} right={String(stats.cards.away)} />
        </div>
      </div>
    </div>
  );
};

export default MatchStats;
