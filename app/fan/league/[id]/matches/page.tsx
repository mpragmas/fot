import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";
import React from "react";
import MatchFixture from "@/app/components/MatchFixture";
import {
  getLeagueFixturesByRound,
  resolveSeasonForLeague,
} from "../../_lib/leagueData";
import { notFound } from "next/navigation";

type MatchesPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ seasonId?: string; round?: string }>;
};

function formatTimeParts(d: Date) {
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return { time: `${hh}:${mm}`, suffix: ampm };
}

function isoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatFullDate(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const Matches = async ({ params, searchParams }: MatchesPageProps) => {
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isFinite(leagueId)) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const seasonIdParam = sp.seasonId ? Number(sp.seasonId) : undefined;
  const season = await resolveSeasonForLeague(leagueId, seasonIdParam);
  if (!season) {
    notFound();
  }

  const roundParam = sp.round ? Number(sp.round) : 1;
  const baseRound =
    Number.isFinite(roundParam) && roundParam > 0 ? roundParam : 1;

  // If totalRounds is configured, clamp to [1, totalRounds].
  // If not, allow free navigation >= 1 like before.
  const hasMax =
    typeof season.totalRounds === "number" && season.totalRounds > 0;
  const safeRound = hasMax
    ? Math.min(Math.max(1, baseRound), season.totalRounds as number)
    : Math.max(1, baseRound);

  const canPrev = safeRound > 1;
  const canNext = hasMax ? safeRound < (season.totalRounds as number) : true;

  const base = `/fan/league/${leagueId}/matches`;
  const common = `seasonId=${season.id}`;
  const prevHref = `${base}?${common}&round=${safeRound - 1}`;
  const nextHref = `${base}?${common}&round=${safeRound + 1}`;

  const fixtures = await getLeagueFixturesByRound(season.id, safeRound);

  // Group fixtures by calendar day to render date headers like the original design
  const groupsMap = new Map<
    string,
    { label: string; items: typeof fixtures }
  >();
  for (const f of fixtures) {
    const key = isoDay(f.date);
    const existing = groupsMap.get(key);
    if (existing) {
      existing.items.push(f);
    } else {
      groupsMap.set(key, {
        label: formatFullDate(f.date),
        items: [f],
      });
    }
  }

  const grouped = Array.from(groupsMap.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([, value]) => value);

  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-5 w-full rounded-2xl p-5">
      <div className="mt-2 flex items-center justify-between">
        <LeftArrow href={canPrev ? prevHref : undefined} disabled={!canPrev} />
        <p>Round {safeRound}</p>
        <RightArrow href={canNext ? nextHref : undefined} disabled={!canNext} />
      </div>
      {grouped.map((group) => (
        <React.Fragment key={group.label}>
          <p className="dark:bg-dark-4 mt-5 rounded-xl px-3 py-2 text-sm font-medium">
            {group.label}
          </p>
          {group.items.map((f, index) => {
            const timeParts = formatTimeParts(f.date);

            return (
              <MatchFixture
                key={f.fixtureId}
                homeTeam={f.homeTeam}
                awayTeam={f.awayTeam}
                homeScore={
                  f.status === "LIVE" || f.status === "COMPLETED"
                    ? f.homeScore
                    : undefined
                }
                awayScore={
                  f.status === "LIVE" || f.status === "COMPLETED"
                    ? f.awayScore
                    : undefined
                }
                leftLabel=""
                centerLabel={
                  f.status === "UPCOMING"
                    ? `${timeParts.time}\n${timeParts.suffix}`
                    : undefined
                }
                rightLabel={f.status === "LIVE" ? "Live" : ""}
                showDivider={
                  group.items.length > 1 && index < group.items.length - 1
                }
              />
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Matches;
