"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

type Team = { name: string; short: string; color: string };
type Fixture = {
  id: number;
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

const Row: React.FC<{
  f: Fixture;
  highlighted?: boolean;
  onClick: () => void;
}> = ({ f, highlighted, onClick }) => (
  <div className="px-3 py-3" onClick={onClick}>
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

const MatchFixture: React.FC = () => {
  const router = useRouter();

  const { data } = useQuery({
    queryKey: ["matches", "fan-sidebar"],
    queryFn: async () => {
      const res = await fetch("/api/matches");
      if (!res.ok) throw new Error("Failed to fetch matches");
      return res.json();
    },
  });

  const fixtures: Fixture[] = useMemo(() => {
    if (!data?.data) return [];
    return (data.data as any[]).slice(0, 5).map((m) => {
      const homeName = m.fixture?.homeTeam?.name ?? "Home";
      const awayName = m.fixture?.awayTeam?.name ?? "Away";
      const homeShort = homeName.substring(0, 3).toUpperCase();
      const awayShort = awayName.substring(0, 3).toUpperCase();
      const status: Fixture["status"] =
        m.status === "COMPLETED" ? "FT" : m.status === "LIVE" ? "LIVE" : "HT";
      return {
        id: m.id,
        home: { name: homeName, short: homeShort, color: "#2563eb" },
        away: { name: awayName, short: awayShort, color: "#ef4444" },
        hs: m.homeScore ?? 0,
        as: m.awayScore ?? 0,
        status,
      };
    });
  }, [data]);

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
        {fixtures.map((f, i) => (
          <Row
            key={f.id}
            f={f}
            highlighted={i === 0}
            onClick={() => router.push(`/fan/match/${f.id}`)}
          />
        ))}
      </div>
    </div>
  );
};

export default MatchFixture;
