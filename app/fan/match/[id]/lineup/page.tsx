"use client";

import React, { useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useMatchRoomSocket } from "@/app/hooks/useMatchRoomSocket";

type BadgeType = "goal" | "yellow" | "sub";

type Player = {
  id?: number;
  number?: number;
  name: string;
  badges?: BadgeType[];
};

// Tiny SVG icons (keeps design/layout; replaces emoji)
const IconGoal: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="currentColor"
      className="text-gray-200"
    />
    <circle
      cx="12"
      cy="12"
      r="6"
      fill="transparent"
      stroke="#1a1a1a"
      strokeWidth="2"
    />
  </svg>
);

const IconYellow: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-3", className].join(" ")}>
    <rect x="5" y="3" width="14" height="18" rx="2" fill="#facc15" />
  </svg>
);

const IconSubIn: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle cx="12" cy="12" r="10" fill="#16a34a" />
    <path
      d="M8 12h8M12 8l4 4-4 4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconSubOut: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" className={["h-4 w-4", className].join(" ")}>
    <circle cx="12" cy="12" r="10" fill="#dc2626" />
    <path
      d="M16 12H8M12 16l-4-4 4-4"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShirtNumber: React.FC<{ n: number }> = ({ n }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-xs text-gray-200">
    {n}
  </div>
);

const EventIcon: React.FC<{ type: BadgeType }> = ({ type }) => {
  if (type === "goal") return <IconGoal />;
  if (type === "yellow") return <IconYellow />;
  return <IconSubIn />;
};

const Badge: React.FC<{ type: BadgeType }> = ({ type }) => (
  <span className="text-sm leading-none">{<EventIcon type={type} />}</span>
);

const PlayerCell: React.FC<{
  player: Player;
  align?: "left" | "right";
}> = ({ player, align = "left" }) => (
  <div
    className={[
      "flex items-center gap-3 py-3",
      align === "right" ? "justify-end text-right" : "justify-start",
    ].join(" ")}
  >
    {align === "left" && player.number !== undefined && (
      <ShirtNumber n={player.number} />
    )}

    <div className="flex items-center gap-3">
      <p className="text-sm text-gray-200">{player.name}</p>
      <div className="flex items-center gap-2">
        {player.badges?.map((b, i) => (
          <Badge key={i} type={b} />
        ))}
      </div>
    </div>

    {align === "right" && player.number !== undefined && (
      <ShirtNumber n={player.number} />
    )}
  </div>
);

const Row: React.FC<{ left?: Player; right?: Player }> = ({ left, right }) => (
  <div className="grid grid-cols-3 items-center">
    <div>{left && <PlayerCell player={left} align="left" />}</div>
    <div />
    <div>{right && <PlayerCell player={right} align="right" />}</div>
  </div>
);
type SubEvent = { minute: number; out: string; in: string };

const coaches = {
  home: "",
  away: "",
};

const MinuteBadge: React.FC<{ m: number }> = ({ m }) => (
  <div className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-200">
    {m}’
  </div>
);

const SubRow: React.FC<{ left?: SubEvent; right?: SubEvent }> = ({
  left,
  right,
}) => (
  <div className="grid grid-cols-3 items-center gap-2 py-2 text-sm">
    <div className="flex items-center justify-start gap-3">
      {left && (
        <>
          <MinuteBadge m={left.minute} />
          <div className="flex flex-col">
            <span className="dark:text-dark-3 inline-flex items-center gap-2">
              <IconSubOut />
              {left.out}
            </span>
            <span className="dark:text-whitish inline-flex items-center gap-2 font-semibold">
              <IconSubIn />
              {left.in}
            </span>
          </div>
        </>
      )}
    </div>
    <div />
    <div className="flex items-center justify-end gap-3">
      {right && (
        <>
          <div className="flex flex-col text-right">
            <span className="dark:text-dark-3 inline-flex items-center justify-end gap-1">
              {right.out}
              <IconSubOut />
            </span>
            <span className="dark:text-whitish inline-flex items-center justify-end gap-1 font-semibold">
              {right.in}
              <IconSubIn />
            </span>
          </div>
          <MinuteBadge m={right.minute} />
        </>
      )}
    </div>
  </div>
);

const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

const fetchLineups = async (id: number) => {
  const res = await fetch(`/api/matches/${id}/lineups`);
  if (!res.ok) throw new Error("Failed to fetch lineups");
  return res.json();
};

const Lineup: React.FC = () => {
  const params = useParams();
  const matchId = Number(params.id);

  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: Number.isFinite(matchId),
  });

  const { data: lineupData } = useQuery({
    queryKey: ["lineups", matchId],
    queryFn: () => fetchLineups(matchId),
    enabled: Number.isFinite(matchId),
  });

  useMatchRoomSocket(matchId);

  const homePlayers = match?.fixture?.homeTeam?.players ?? [];
  const awayPlayers = match?.fixture?.awayTeam?.players ?? [];

  const homeIds = useMemo(
    () => new Set(homePlayers.map((p: any) => p.id)),
    [homePlayers],
  );
  const awayIds = useMemo(
    () => new Set(awayPlayers.map((p: any) => p.id)),
    [awayPlayers],
  );

  const startingHome: Player[] = useMemo(() => {
    if (!Array.isArray(lineupData)) return [];
    const starters = lineupData.filter(
      (l: any) => l.isStarting && homeIds.has(l.playerId),
    );
    return starters.map((l: any) => {
      const p = homePlayers.find((hp: any) => hp.id === l.playerId);
      return {
        id: p?.id,
        number: p?.number,
        name: p
          ? `${p.firstName}${p.lastName ? " " + p.lastName : ""}`
          : "Unknown",
      } as Player;
    });
  }, [lineupData, homeIds, homePlayers]);

  const startingAway: Player[] = useMemo(() => {
    if (!Array.isArray(lineupData)) return [];
    const starters = lineupData.filter(
      (l: any) => l.isStarting && awayIds.has(l.playerId),
    );
    return starters.map((l: any) => {
      const p = awayPlayers.find((ap: any) => ap.id === l.playerId);
      return {
        id: p?.id,
        number: p?.number,
        name: p
          ? `${p.firstName}${p.lastName ? " " + p.lastName : ""}`
          : "Unknown",
      } as Player;
    });
  }, [lineupData, awayIds, awayPlayers]);

  const benchHome: Player[] = useMemo(() => {
    if (!Array.isArray(lineupData)) return [];
    const startersIds = new Set(
      lineupData
        .filter((l: any) => l.isStarting && homeIds.has(l.playerId))
        .map((l: any) => l.playerId),
    );
    const bench = homePlayers.filter((p: any) => !startersIds.has(p.id));
    return bench.map((p: any) => ({
      id: p.id,
      number: p.number,
      name: `${p.firstName}${p.lastName ? " " + p.lastName : ""}`,
    }));
  }, [lineupData, homeIds, homePlayers]);

  const benchAway: Player[] = useMemo(() => {
    if (!Array.isArray(lineupData)) return [];
    const startersIds = new Set(
      lineupData
        .filter((l: any) => l.isStarting && awayIds.has(l.playerId))
        .map((l: any) => l.playerId),
    );
    const bench = awayPlayers.filter((p: any) => !startersIds.has(p.id));
    return bench.map((p: any) => ({
      id: p.id,
      number: p.number,
      name: `${p.firstName}${p.lastName ? " " + p.lastName : ""}`,
    }));
  }, [lineupData, awayIds, awayPlayers]);

  const subsHome: SubEvent[] = useMemo(() => {
    if (!match || !Array.isArray(match.stats)) return [];
    const stats = match.stats as any[];
    const subs = stats.filter(
      (s) => s.type === "SUBSTITUTION" && homeIds.has(s.playerId),
    );
    const grouped = new Map<number, any[]>();
    for (const s of subs) {
      const list = grouped.get(s.minute) ?? [];
      list.push(s);
      grouped.set(s.minute, list);
    }
    const events: SubEvent[] = [];
    for (const [minute, list] of grouped.entries()) {
      if (!list.length) continue;
      const sorted = [...list].sort((a, b) => a.id - b.id);
      const outStat = sorted[0];
      const inStat = sorted[1] ?? sorted[0];
      const outPlayer = homePlayers.find((p: any) => p.id === outStat.playerId);
      const inPlayer = homePlayers.find((p: any) => p.id === inStat.playerId);
      events.push({
        minute,
        out: outPlayer
          ? `${outPlayer.firstName}${outPlayer.lastName ? " " + outPlayer.lastName : ""}`
          : "",
        in: inPlayer
          ? `${inPlayer.firstName}${inPlayer.lastName ? " " + inPlayer.lastName : ""}`
          : "",
      });
    }
    return events.sort((a, b) => a.minute - b.minute);
  }, [match, homeIds, homePlayers]);

  const subsAway: SubEvent[] = useMemo(() => {
    if (!match || !Array.isArray(match.stats)) return [];
    const stats = match.stats as any[];
    const subs = stats.filter(
      (s) => s.type === "SUBSTITUTION" && awayIds.has(s.playerId),
    );
    const grouped = new Map<number, any[]>();
    for (const s of subs) {
      const list = grouped.get(s.minute) ?? [];
      list.push(s);
      grouped.set(s.minute, list);
    }
    const events: SubEvent[] = [];
    for (const [minute, list] of grouped.entries()) {
      if (!list.length) continue;
      const sorted = [...list].sort((a, b) => a.id - b.id);
      const outStat = sorted[0];
      const inStat = sorted[1] ?? sorted[0];
      const outPlayer = awayPlayers.find((p: any) => p.id === outStat.playerId);
      const inPlayer = awayPlayers.find((p: any) => p.id === inStat.playerId);
      events.push({
        minute,
        out: outPlayer
          ? `${outPlayer.firstName}${outPlayer.lastName ? " " + outPlayer.lastName : ""}`
          : "",
        in: inPlayer
          ? `${inPlayer.firstName}${inPlayer.lastName ? " " + inPlayer.lastName : ""}`
          : "",
      });
    }
    return events.sort((a, b) => a.minute - b.minute);
  }, [match, awayIds, awayPlayers]);

  const rows = Math.max(startingHome.length, startingAway.length);

  const homeName = match?.fixture?.homeTeam?.name ?? "Home";
  const awayName = match?.fixture?.awayTeam?.name ?? "Away";

  return (
    <>
      <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex justify-center rounded-2xl p-4">
        <div className="w-full max-w-3xl overflow-hidden rounded-2xl shadow-lg">
          <div className="px-5 py-4">
            <h2 className="mb-2 text-center text-lg font-semibold">
              {homeName} vs {awayName} - Lineups
            </h2>
          </div>

          <div className="divide-y divide-gray-800/60">
            {Array.from({ length: rows }).map((_, i) => (
              <Row key={i} left={startingHome[i]} right={startingAway[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Substitutions */}
      <div className="dark:bg-dark-1 mt-5 rounded-2xl px-5 py-6">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Substitutions
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="divide-y divide-gray-800/60 p-3">
            {Array.from({
              length: Math.max(subsHome.length, subsAway.length),
            }).map((_, i) => (
              <SubRow key={i} left={subsHome[i]} right={subsAway[i]} />
            ))}
          </div>
        </div>
      </div>

      {/* Substitute Players */}
      <div className="dark:bg-dark-1 mt-5 rounded-2xl px-5 pb-6">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Substitute Players
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="divide-y divide-gray-800/60 p-3">
            {Array.from({
              length: Math.max(benchHome.length, benchAway.length),
            }).map((_, i) => (
              <Row key={i} left={benchHome[i]} right={benchAway[i]} />
            ))}
          </div>
        </div>
      </div>
      {/* Coaches */}
      <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 rounded-2xl p-5 pb-8">
        <h3 className="mb-3 text-sm font-semibold tracking-wide uppercase">
          Coaches
        </h3>
        <div className="overflow-hidden rounded-2xl">
          <div className="grid grid-cols-2">
            <div className="p-4 font-semibold">
              {match?.fixture?.homeTeam?.coach ?? ""}
            </div>
            <div className="p-4 text-right font-semibold">
              {match?.fixture?.awayTeam?.coach ?? ""}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Lineup;
