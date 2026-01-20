"use client";

import LeftArrow from "@/app/ui/LeftArrow";
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";
import { MdStadium } from "react-icons/md";

const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

const MatchHeader = () => {
  const params = useParams();
  const router = useRouter();
  const matchId = Number(params.id);

  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: Number.isFinite(matchId),
  });

  const fixture = match?.fixture;

  const dateLabel = useMemo(() => {
    if (!fixture?.date) return "";
    try {
      const d = new Date(fixture.date);
      return d.toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }, [fixture?.date]);

  const statusLabel = useMemo(() => {
    if (!match) return "";
    if (match.status === "COMPLETED") return "Full time";
    if (match.status === "LIVE") return "Live";
    return "Upcoming";
  }, [match]);

  const homeName = fixture?.homeTeam?.name ?? "Home";
  const awayName = fixture?.awayTeam?.name ?? "Away";
  const homeScore = match?.homeScore ?? 0;
  const awayScore = match?.awayScore ?? 0;

  const homePlayers = fixture?.homeTeam?.players ?? [];
  const awayPlayers = fixture?.awayTeam?.players ?? [];

  const playersById = useMemo(() => {
    const m = new Map<number, { firstName: string; lastName: string | null }>();
    [...homePlayers, ...awayPlayers].forEach((p: any) =>
      m.set(p.id, { firstName: p.firstName, lastName: p.lastName ?? null }),
    );
    return m;
  }, [homePlayers, awayPlayers]);

  const scorers = useMemo(() => {
    const home: string[] = [];
    const away: string[] = [];

    const stats: any[] = Array.isArray(match?.stats) ? match!.stats : [];
    for (const s of stats) {
      if (
        s.type !== "GOAL" &&
        s.type !== "OWN_GOAL" &&
        s.type !== "PENALTY_GOAL"
      ) {
        continue;
      }
      const isHome = homePlayers.some((p: any) => p.id === s.playerId);
      const isAway = awayPlayers.some((p: any) => p.id === s.playerId);
      if (!isHome && !isAway) continue;

      const player = playersById.get(s.playerId);
      const baseName = player
        ? `${player.firstName}${player.lastName ? " " + player.lastName : ""}`
        : "Unknown";
      const formatMinute = (minute: number, half?: number | null): string => {
        const h = half ?? 1;
        if (h === 1) {
          if (minute <= 45) return String(minute);
          return `45+${minute - 45}`;
        }
        if (minute <= 90) return String(minute);
        return `90+${minute - 90}`;
      };

      const minuteLabel = formatMinute(s.minute, s.half);

      const label =
        s.type === "OWN_GOAL"
          ? `${baseName} (OG)`
          : `${baseName} ${minuteLabel}’`;

      const baseSide: "home" | "away" =
        s.type === "OWN_GOAL"
          ? isHome
            ? "away"
            : "home"
          : isHome
            ? "home"
            : "away";

      const teamArray = baseSide === "home" ? home : away;
      teamArray.push(label);
    }

    return { home, away };
  }, [match?.stats, homePlayers, awayPlayers, playersById]);

  return (
    <div className="dark:text-whitish dark:bg-dark-1 w-full overflow-hidden rounded-2xl font-sans">
      {/* Header */}
      <div className="flex items-center border-b border-neutral-800 px-4 py-3">
        <button
          className="flex items-center gap-2 text-sm text-gray-300"
          onClick={() => router.push("/fan/matches")}
        >
          <LeftArrow /> <span>Matches</span>
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-white">
          <span className="mr-2">⚽</span>
          {fixture?.season?.league?.name
            ? `${fixture.season.league.name} Round ${fixture.roundNumber ?? 1}`
            : "Match"}
        </div>
        <p></p>
      </div>

      {/* Match details */}
      <div className="flex items-center justify-center gap-4 border-b border-neutral-800 px-6 py-3 text-sm text-gray-300">
        <div className="flex items-center gap-1">
          <span>
            <FaRegCalendarAlt />
          </span>
          <span>{dateLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>
            <MdStadium />
          </span>
          <span>{fixture?.stadium ?? ""}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>
            <GiWhistle />
          </span>
          <span>{fixture?.referee ?? ""}</span>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="py-10 text-center">
        <div className="flex w-full flex-nowrap items-start justify-center gap-12 px-16 text-center">
          {/* Left team */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">{homeName}</span>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
                alt="Liverpool"
                className="h-10 w-10"
              />
            </div>
            <div className="mt-8">
              {scorers.home.map((s) => (
                <p key={s} className="text-sm text-gray-400">
                  {s}
                </p>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="shrink-0 self-start">
            <div>
              <p className="text-2xl font-bold">
                {homeScore} - {awayScore}
              </p>
              <p className="mt-2 text-sm text-gray-400">{statusLabel}</p>
            </div>
            <p className="mt-4">⚽</p>
          </div>

          {/* Right team */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
                alt={awayName}
                className="h-10 w-10"
              />
              <span className="text-lg font-semibold">{awayName}</span>
            </div>
            <div className="mt-8">
              {scorers.away.map((s) => (
                <p key={s} className="text-sm text-gray-400">
                  {s}
                </p>
              ))}
            </div>
          </div>
          {/* Match info */}
          <div className="mt-4 flex items-center gap-2"></div>
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="flex gap-17 px-6 py-3 text-sm text-gray-400">
        <span
          className="cursor-pointer border-b-2 border-green-500 pb-1 text-white"
          onClick={() => router.push(`/fan/match/${matchId}`)}
        >
          Facts
        </span>

        <span
          className="cursor-pointer"
          onClick={() => router.push(`/fan/match/${matchId}/lineup`)}
        >
          Lineup
        </span>
        <span
          className="cursor-pointer"
          onClick={() => router.push(`/fan/match/${matchId}/table`)}
        >
          Table
        </span>

        <span
          className="cursor-pointer"
          onClick={() => router.push(`/fan/match/${matchId}/stats`)}
        >
          Stats
        </span>
      </div>
    </div>
  );
};

export default MatchHeader;
