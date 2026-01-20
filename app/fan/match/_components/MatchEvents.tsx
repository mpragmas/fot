"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useMatchRoomSocket } from "@/app/hooks/useMatchRoomSocket";

type Event = {
  minute: string;
  type: "goal" | "penalty" | "yellow" | "red" | "sub";
  player: string;
  assist?: string;
  side: "home" | "away";
  subIn?: string;
  subOut?: string;
  detail?: string;
  note?: string;
};

type PlayerLite = {
  id: number;
  firstName: string;
  lastName: string | null;
};

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
    | "SUBSTITUTION";
  minute: number;
  half?: number | null;
};

const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

const EventIcon: React.FC<{ type: Event["type"] }> = ({ type }) => (
  <span className="text-lg">{icon(type)}</span>
);

const NonSubHome: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <div>
      <p className="text-dark dark:text-whitish inline-flex items-center gap-2 font-medium">
        {e.player}
      </p>
      {e.detail && <p className="text-xs">{e.detail}</p>}
      {e.assist && <p className="text-xs">assist by {e.assist}</p>}
    </div>
    <EventIcon type={e.type} />
  </div>
);

const NonSubAway: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <EventIcon type={e.type} />
    <div>
      <p className="text-dark dark:text-whitish inline-flex items-center gap-2 font-medium">
        {e.player}
      </p>
      {e.detail && <p className="text-xs">{e.detail}</p>}
      {e.assist && <p className="text-xs">assist by {e.assist}</p>}
    </div>
  </div>
);

const SubHome: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <EventIcon type="sub" />
    <p className="flex flex-col">
      <span className="inline-flex items-center gap-1 text-green-400">
        {e.subIn}
      </span>
      <span className="inline-flex items-center gap-1 text-red-400">
        {e.subOut}
      </span>
    </p>
  </div>
);

const SubAway: React.FC<{ e: Event }> = ({ e }) => (
  <div className="flex items-center gap-3">
    <EventIcon type="sub" />
    <p className="flex flex-col">
      <span className="inline-flex items-center gap-1 text-green-400">
        {e.subIn}
      </span>
      <span className="inline-flex items-center gap-1 text-red-400">
        {e.subOut}
      </span>
    </p>
  </div>
);

const icon = (type: Event["type"]) => {
  switch (type) {
    case "goal":
      return "⚽";
    case "penalty":
      return "⚽ (P)";
    case "yellow":
      return "🟨";
    case "red":
      return "🟥";
    case "sub":
      return "🔄";
    default:
      return "";
  }
};

const MatchEvents: React.FC = () => {
  const params = useParams();
  const matchId = Number(params.id);

  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: Number.isFinite(matchId),
  });

  useMatchRoomSocket(matchId);

  const homePlayers: PlayerLite[] = useMemo(
    () => match?.fixture?.homeTeam?.players ?? [],
    [match?.fixture?.homeTeam?.players],
  );
  const awayPlayers: PlayerLite[] = useMemo(
    () => match?.fixture?.awayTeam?.players ?? [],
    [match?.fixture?.awayTeam?.players],
  );

  const homeIds = useMemo(
    () => new Set(homePlayers.map((p) => p.id)),
    [homePlayers],
  );
  const awayIds = useMemo(
    () => new Set(awayPlayers.map((p) => p.id)),
    [awayPlayers],
  );

  const playersById = useMemo(() => {
    const map = new Map<number, PlayerLite>();
    [...homePlayers, ...awayPlayers].forEach((p) => map.set(p.id, p));
    return map;
  }, [homePlayers, awayPlayers]);

  const stats: MatchStatLite[] = useMemo(
    () => match?.stats ?? [],
    [match?.stats],
  );

  const events: Event[] = useMemo(() => {
    if (!stats || stats.length === 0) return [];

    const result: Event[] = [];

    const formatMinute = (minute: number, half?: number | null): string => {
      const h = half ?? 1;
      if (h === 1) {
        if (minute <= 45) return String(minute);
        return `45+${minute - 45}`;
      }
      // second half and beyond
      if (minute <= 90) return String(minute);
      return `90+${minute - 90}`;
    };
    const sortStats = (arr: MatchStatLite[]) =>
      [...arr].sort((a, b) => {
        const halfA = a.half === 2 ? 1 : 0;
        const halfB = b.half === 2 ? 1 : 0;
        if (halfA !== halfB) return halfA - halfB;
        if (a.minute !== b.minute) return a.minute - b.minute;
        return a.id - b.id;
      });

    const goalLike: MatchStatLite[] = [];
    const assists: MatchStatLite[] = [];
    const yellows: MatchStatLite[] = [];
    const reds: MatchStatLite[] = [];
    const substitutions: MatchStatLite[] = [];

    for (const s of stats) {
      if (
        s.type === "GOAL" ||
        s.type === "OWN_GOAL" ||
        s.type === "PENALTY_GOAL"
      ) {
        goalLike.push(s);
      } else if (s.type === "ASSIST") {
        assists.push(s);
      } else if (s.type === "YELLOW_CARD") {
        yellows.push(s);
      } else if (s.type === "RED_CARD") {
        reds.push(s);
      } else if (s.type === "SUBSTITUTION") {
        substitutions.push(s);
      }
    }

    // Build assists lookup per (team, minute)
    const assistsByTeamMinute = new Map<string, MatchStatLite[]>();
    const keyFor = (team: "home" | "away", minute: number) =>
      `${team}:${minute}`;

    for (const a of assists) {
      const isHome = homeIds.has(a.playerId);
      const team = isHome ? "home" : "away";
      const key = keyFor(team, a.minute);
      const list = assistsByTeamMinute.get(key);
      if (list) list.push(a);
      else assistsByTeamMinute.set(key, [a]);
    }

    // Goals with assists
    for (const g of sortStats(goalLike)) {
      const isHome = homeIds.has(g.playerId);
      const side: "home" | "away" = isHome ? "home" : "away";
      const baseSide: "home" | "away" =
        g.type === "OWN_GOAL" ? (side === "home" ? "away" : "home") : side;
      const player = playersById.get(g.playerId);
      const name = player
        ? `${player.firstName}${player.lastName ? " " + player.lastName : ""}`
        : "Unknown";
      const key = keyFor(baseSide, g.minute);
      const possibleAssists = assistsByTeamMinute.get(key) ?? [];
      const assist = possibleAssists.find((a) => a.playerId !== g.playerId);
      const assistPlayer = assist
        ? playersById.get(assist.playerId)
        : undefined;

      const minuteLabel = formatMinute(g.minute, g.half);

      result.push({
        minute: minuteLabel,
        type: g.type === "PENALTY_GOAL" ? "penalty" : "goal",
        player: name,
        assist: assistPlayer
          ? `${assistPlayer.firstName}${
              assistPlayer.lastName ? " " + assistPlayer.lastName : ""
            }`
          : undefined,
        side: baseSide,
        detail: g.type === "OWN_GOAL" ? "own goal" : undefined,
      });
    }

    // Cards: collapse second yellow + red at same minute into a red card event
    const yellowByPlayerMinute = new Map<string, MatchStatLite>();
    for (const y of yellows) {
      const key = `${y.playerId}:${y.minute}`;
      yellowByPlayerMinute.set(key, y);
    }

    const consumedYellowKeys = new Set<string>();

    for (const r of sortStats(reds)) {
      const key = `${r.playerId}:${r.minute}`;
      const pairedYellow = yellowByPlayerMinute.get(key);
      const isHome = homeIds.has(r.playerId);
      const side: "home" | "away" = isHome ? "home" : "away";
      const player = playersById.get(r.playerId);
      const name = player
        ? `${player.firstName}${player.lastName ? " " + player.lastName : ""}`
        : "Unknown";

      if (pairedYellow) {
        consumedYellowKeys.add(key);
        result.push({
          minute: formatMinute(r.minute, r.half),
          type: "red",
          player: name,
          side,
        });
      } else {
        result.push({
          minute: formatMinute(r.minute, r.half),
          type: "red",
          player: name,
          side,
        });
      }
    }

    for (const y of sortStats(yellows)) {
      const key = `${y.playerId}:${y.minute}`;
      if (consumedYellowKeys.has(key)) continue;
      const isHome = homeIds.has(y.playerId);
      const side: "home" | "away" = isHome ? "home" : "away";
      const player = playersById.get(y.playerId);
      const name = player
        ? `${player.firstName}${player.lastName ? " " + player.lastName : ""}`
        : "Unknown";
      result.push({
        minute: formatMinute(y.minute, y.half),
        type: "yellow",
        player: name,
        side,
      });
    }

    // Substitutions: group into one event per (team, minute) with in/out
    const subsByTeamMinute = new Map<string, MatchStatLite[]>();
    for (const s of substitutions) {
      const isHome = homeIds.has(s.playerId);
      const team: "home" | "away" = isHome ? "home" : "away";
      const key = keyFor(team, s.minute);
      const list = subsByTeamMinute.get(key);
      if (list) list.push(s);
      else subsByTeamMinute.set(key, [s]);
    }

    for (const [key, list] of subsByTeamMinute.entries()) {
      if (!list.length) continue;
      const [teamLabel, minuteStr] = key.split(":");
      const minute = Number(minuteStr);
      const side: "home" | "away" = teamLabel === "home" ? "home" : "away";

      const sortedList = sortStats(list);
      const first = playersById.get(sortedList[0].playerId);
      const second = sortedList[1]
        ? playersById.get(sortedList[1].playerId)
        : undefined;

      const subInName = second
        ? `${second.firstName}${second.lastName ? " " + second.lastName : ""}`
        : first
          ? `${first.firstName}${first.lastName ? " " + first.lastName : ""}`
          : "";
      const subOutName = first
        ? `${first.firstName}${first.lastName ? " " + first.lastName : ""}`
        : undefined;

      // Use the half from the first substitution entry for display formatting
      const half = list[0]?.half ?? 1;

      result.push({
        minute: formatMinute(minute, half),
        type: "sub",
        player: "",
        subIn: subInName,
        subOut: subOutName,
        side,
      });
    }

    // Sort final events by minute and then preserve insertion order for same minute
    return [...result].sort((a, b) => {
      const ma = parseInt(a.minute, 10) || 0;
      const mb = parseInt(b.minute, 10) || 0;
      return ma - mb;
    });
  }, [stats, homeIds, awayIds, playersById]);
  return (
    <div className="dark:bg-dark-1 dark:text-dark-3 mt-5 flex justify-center rounded-2xl p-6">
      <div className="w-full max-w-3xl rounded-2xl p-6 shadow-lg">
        <h2 className="mb-4 text-center text-lg font-semibold">Events</h2>

        <div className="">
          {events.map((e, i) => (
            <div
              key={`${e.minute}-${e.type}-${e.side}-${e.player || ""}-${e.subIn || ""}-${e.subOut || ""}-${i}`}
            >
              {e.note ? (
                <div className="my-3 flex justify-center text-sm italic">
                  {e.note}
                </div>
              ) : e.minute === "HT" ? (
                <div className="my-4 flex items-center justify-center gap-2">
                  <div className="h-[1px] flex-1 bg-gray-700"></div>
                  <span className="text-sm">{e.player}</span>
                  <div className="h-[1px] flex-1 bg-gray-700"></div>
                </div>
              ) : (
                <div className="grid grid-cols-3 items-center py-2 text-sm">
                  {/* Home side */}
                  {e.side === "home" ? (
                    <div className="flex justify-end pr-4 text-right">
                      <div>
                        {e.type === "sub" ? (
                          <SubHome e={e} />
                        ) : (
                          <NonSubHome e={e} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}

                  {/* Center minute + icon */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="dark:bg-dark-4 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
                      {e.minute}’
                    </div>
                  </div>

                  {/* Away side */}
                  {e.side === "away" ? (
                    <div className="flex justify-start pl-4">
                      <div>
                        {e.type === "sub" ? (
                          <SubAway e={e} />
                        ) : (
                          <NonSubAway e={e} />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchEvents;
