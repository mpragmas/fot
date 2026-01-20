"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Table from "@/app/fan/league/_components/Table";
import { useLeagueTable } from "@/app/fan/league/_lib/useLeagueTable";
import {
  useSeasonTable,
  type SeasonTableScope,
} from "@/app/fan/league/_lib/useSeasonTable";

const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

const MatchTablePage: React.FC = () => {
  const params = useParams();
  const matchId = Number(params.id);

  const { data: match } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: Number.isFinite(matchId),
  });

  const [scope, setScope] = React.useState<SeasonTableScope>("overall");

  const leagueId = match?.fixture?.season?.leagueId as number | undefined;
  const seasonId = match?.fixture?.seasonId as number | undefined;

  const leagueQuery = useLeagueTable(
    leagueId ?? Number.NaN,
    seasonId ?? Number.NaN,
  );
  const seasonQuery = useSeasonTable(
    seasonId ?? Number.NaN,
    scope === "overall" ? "overall" : scope,
  );

  const isOverall = scope === "overall";
  const activeQuery = isOverall ? leagueQuery : seasonQuery;
  const { data, isLoading, error } = activeQuery;

  if (!Number.isFinite(leagueId ?? NaN) || !Number.isFinite(seasonId ?? NaN)) {
    return <Table rows={[]} scope={scope} onScopeChange={setScope} />;
  }

  if (isLoading || error || !data) {
    return <Table rows={[]} scope={scope} onScopeChange={setScope} />;
  }

  const leagueMeta = new Map<
    number,
    { form?: ("W" | "D" | "L")[]; nextOpponent?: string | null }
  >();

  if (leagueQuery.data) {
    for (const r of leagueQuery.data) {
      leagueMeta.set(r.teamId, {
        form: r.form,
        nextOpponent: r.nextOpponent,
      });
    }
  }

  const rows = data.map((row, index) => {
    const meta = leagueMeta.get(row.teamId);
    const scopedForm = (row as any).form as ("W" | "D" | "L")[] | undefined;
    const scopedNext = (row as any).nextOpponent as string | null | undefined;

    const useScoped = scope !== "overall";

    return {
      teamId: row.teamId,
      rank: index + 1,
      name: row.teamName,
      pl: row.played,
      w: row.wins,
      d: row.draws,
      l: row.losses,
      goalsFor: row.goalsFor,
      goalsAgainst: row.goalsAgainst,
      gd: row.goalDiff,
      pts: row.points,
      form: useScoped ? scopedForm : meta?.form,
      nextOpponent: useScoped
        ? (scopedNext ?? null)
        : (meta?.nextOpponent ?? null),
    };
  });

  return <Table rows={rows} scope={scope} onScopeChange={setScope} />;
};

export default MatchTablePage;
