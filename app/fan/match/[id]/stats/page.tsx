"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchRoomSocket } from "@/app/hooks/useMatchRoomSocket";

type StatKey = "possession" | "corners" | "shotsOnTarget" | "fouls" | "cards";
type Stats = Record<StatKey, { home: number; away: number }>;

type MatchStatLite = {
  id: number;
  matchId: number;
  playerId: number;
  type:
    | "GOAL"
    | "ASSIST"
    | "OWN_GOAL"
    | "PENALTY_GOAL"
    | "YELLOW_CARD"
    | "RED_CARD"
    | "SHOT"
    | "CORNER"
    | "SUBSTITUTION"
    | "FOUL";
  minute: number;
};

const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

const Pill: React.FC<{ value: string; variant: "left" | "right" }> = ({
  value,
  variant,
}) => (
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
  <div className="py-1 text-center text-sm font-medium text-gray-200">
    {children}
  </div>
);

const PossessionBar: React.FC<{ left: number; right: number }> = ({
  left,
  right,
}) => (
  <div className="mx-auto mt-2 flex w-full max-w-xl overflow-hidden rounded-full">
    <div
      className="flex items-center justify-end bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white"
      style={{ width: `${left}%` }}
    >
      {left}%
    </div>
    <div className="w-[2px] bg-[#111]" />
    <div
      className="flex items-center justify-start bg-white px-3 py-2 text-xs font-semibold text-[#111]"
      style={{ width: `${right}%` }}
    >
      {right}%
    </div>
  </div>
);

const StatCenterRow: React.FC<{
  label: string;
  left: string;
  right: string;
}> = ({ label, left, right }) => (
  <div className="mx-auto w-full max-w-xl py-3">
    <div className="grid grid-cols-5 items-center">
      <div className="flex justify-start">
        <Pill value={left} variant="left" />
      </div>
      <div className="col-span-3">
        <CenterLabel>{label}</CenterLabel>
      </div>
      <div className="flex justify-end">
        <Pill value={right} variant="right" />
      </div>
    </div>
  </div>
);

const MatchStats: React.FC = () => {
  const params = useParams();
  const matchId = Number(params.id);

  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: Number.isFinite(matchId),
  });

  useMatchRoomSocket(matchId);

  const stats: Stats = useMemo(() => {
    const base: Stats = {
      possession: { home: 50, away: 50 },
      corners: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      cards: { home: 0, away: 0 },
    };

    if (!match || !Array.isArray(match.stats)) return base;

    const statsArr: MatchStatLite[] = match.stats;

    const homePlayers = match.fixture?.homeTeam?.players ?? [];
    const awayPlayers = match.fixture?.awayTeam?.players ?? [];
    const homeIds = new Set(homePlayers.map((p: any) => p.id));
    const awayIds = new Set(awayPlayers.map((p: any) => p.id));

    const inc = (key: StatKey, side: "home" | "away") => {
      base[key][side] += 1;
    };

    for (const s of statsArr) {
      const side: "home" | "away" = homeIds.has(s.playerId)
        ? "home"
        : awayIds.has(s.playerId)
          ? "away"
          : "home";

      if (s.type === "CORNER") inc("corners", side);
      if (s.type === "SHOT") inc("shotsOnTarget", side);
      if (s.type === "YELLOW_CARD" || s.type === "RED_CARD") inc("cards", side);
      if (s.type === "FOUL") inc("fouls", side);
    }

    // If we never saw explicit fouls, fall back to a simple proxy based on cards
    if (base.fouls.home === 0 && base.fouls.away === 0) {
      base.fouls.home = base.cards.home * 3;
      base.fouls.away = base.cards.away * 3;
    }

    return base;
  }, [match]);
  return (
    <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex w-full justify-center p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-[#1a1a1a] p-6 shadow-lg">
        <div className="text-center text-base font-semibold">Top stats</div>
        <CenterLabel>Ball possession</CenterLabel>
        <PossessionBar
          left={stats.possession.home}
          right={stats.possession.away}
        />

        <div className="mt-4 space-y-1">
          <StatCenterRow
            label="Corners"
            left={String(stats.corners.home)}
            right={String(stats.corners.away)}
          />
          <StatCenterRow
            label="Shots on target"
            left={String(stats.shotsOnTarget.home)}
            right={String(stats.shotsOnTarget.away)}
          />
          <StatCenterRow
            label="Fouls committed"
            left={String(stats.fouls.home)}
            right={String(stats.fouls.away)}
          />
          <StatCenterRow
            label="Cards"
            left={String(stats.cards.home)}
            right={String(stats.cards.away)}
          />
        </div>
      </div>
    </div>
  );
};

export default MatchStats;
