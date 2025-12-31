"use client";

import React from "react";
import Table from "../../_components/Table";
import { useLeagueTable } from "../../_lib/useLeagueTable";
import { useSeasonTable, SeasonTableScope } from "../../_lib/useSeasonTable";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  leagueId: number;
  seasonId: number;
  initialScope?: "overall" | "home" | "away";
};

const TableClient: React.FC<Props> = ({ leagueId, seasonId, initialScope }) => {
  const [scope, setScope] = React.useState<SeasonTableScope>(
    (initialScope as SeasonTableScope) ?? "overall",
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const leagueQuery = useLeagueTable(leagueId, seasonId);
  const seasonQuery = useSeasonTable(
    seasonId,
    scope === "overall" ? "overall" : scope,
  );

  const isOverall = scope === "overall";
  const activeQuery = isOverall ? leagueQuery : seasonQuery;
  const { data, isLoading, error } = activeQuery;

  if (!Number.isFinite(leagueId) || !Number.isFinite(seasonId)) {
    return <Table rows={[]} scope={scope} onScopeChange={setScope} />;
  }

  if (isLoading) {
    return <Table rows={[]} scope={scope} onScopeChange={setScope} />;
  }

  if (error || !data) {
    return <Table rows={[]} scope={scope} onScopeChange={setScope} />;
  }

  // Build a lookup for form + nextOpponent from the league table so that
  // Home/Away scopes can still show consistent badges and next fixture.
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

  const handleScopeChange = (next: SeasonTableScope) => {
    setScope(next);

    // Keep seasonId and other params, just update filter for persistence.
    const params = new URLSearchParams(searchParams.toString());
    if (next === "overall") {
      // Represent overall scope explicitly as filter=all so URLs like
      // league/:id/table?filter=all work consistently.
      params.set("filter", "all");
    } else {
      params.set("filter", next);
    }

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  };

  return <Table rows={rows} scope={scope} onScopeChange={handleScopeChange} />;
};

export default TableClient;
