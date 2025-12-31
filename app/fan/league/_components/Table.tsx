import Badge from "@/app/ui/Badge";
import React from "react";

export type LeagueTableDisplayRow = {
  rank: number;
  name: string;
  pl: number;
  w: number;
  d: number;
  l: number;
  goalsFor: number;
  goalsAgainst: number;
  gd: number;
  pts: number;
  form?: string[];
  nextOpponent?: string | null;
};

type Props = {
  rows?: LeagueTableDisplayRow[];
  scope: "overall" | "home" | "away";
  onScopeChange?: (scope: "overall" | "home" | "away") => void;
};

const Table: React.FC<Props> = ({ rows = [], scope, onScopeChange }) => {
  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-3 rounded-2xl p-5">
      <div className="mb-5 flex items-center gap-2">
        <button
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            scope === "overall"
              ? "bg-whitish text-dark dark:bg-whitish dark:text-dark"
              : "dark:bg-dark-4 dark:text-whitish"
          }`}
          onClick={() => onScopeChange?.("overall")}
        >
          All
        </button>
        <button
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            scope === "home"
              ? "bg-whitish text-dark"
              : "dark:bg-dark-4 dark:text-whitish"
          }`}
          onClick={() => onScopeChange?.("home")}
        >
          Home
        </button>
        <button
          className={`rounded-full px-4 py-1 text-sm font-medium ${
            scope === "away"
              ? "bg-whitish text-dark"
              : "dark:bg-dark-4 dark:text-whitish"
          }`}
          onClick={() => onScopeChange?.("away")}
        >
          Away
        </button>
      </div>

      <div className="border-dark-4/60 dark:border-dark-4/60 mb-3 border-t" />

      <div className="text-dark-3 mb-2 flex items-center gap-4 px-2 text-xs font-semibold">
        <div className="w-6">#</div>
        <div className="flex-1"></div>
        <div className="w-8 text-center">PL</div>
        <div className="w-8 text-center">W</div>
        <div className="w-8 text-center">D</div>
        <div className="w-8 text-center">L</div>
        <div className="w-12 text-center">+/-</div>
        <div className="w-10 text-center">GD</div>
        <div className="w-10 text-center">PTS</div>
        <div className="w-28 text-left">Form</div>
        <div className="w-10 text-center">Next</div>
      </div>

      <div className="divide-dark-4/60 dark:divide-dark-4/60 divide-y">
        {rows.map((t) => (
          <div
            key={t.rank}
            className="group relative flex items-center gap-4 px-2 py-3"
          >
            <div className="absolute top-0 left-0 h-full w-1 rounded-l-2xl bg-[--color-green]" />
            <div className="text-dark-3 w-6 text-sm">{t.rank}</div>
            <div className="flex flex-1 items-center gap-3">
              <span className="bg-dark-4 inline-block h-6 w-6 rounded-full" />
              <span className="text-sm font-semibold">{t.name}</span>
            </div>
            <div className="w-8 text-center text-sm">{t.pl}</div>
            <div className="w-8 text-center text-sm">{t.w}</div>
            <div className="w-8 text-center text-sm">{t.d}</div>
            <div className="w-8 text-center text-sm">{t.l}</div>
            <div className="w-12 text-center text-sm">{`${t.goalsFor}-${t.goalsAgainst}`}</div>
            <div className="w-10 text-center text-sm">
              {t.gd > 0 ? `+${t.gd}` : t.gd}
            </div>
            <div className="w-10 text-center text-sm font-bold">{t.pts}</div>
            <div className="w-28 text-left">
              <div className="flex items-center justify-start gap-1">
                {t.form?.map((f, i) => (
                  <Badge key={i} v={f} />
                ))}
              </div>
            </div>
            <div className="w-10 text-center text-xs">
              {t.nextOpponent ?? "-"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
