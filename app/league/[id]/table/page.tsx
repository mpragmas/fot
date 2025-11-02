import React from "react";

const teams = [
  {
    rank: 1,
    name: "Arsenal",
    pl: 10,
    w: 8,
    d: 1,
    l: 1,
    goals: "18-3",
    gd: "+15",
    pts: 25,
    form: ["W", "W", "W", "W", "W"],
  },
  {
    rank: 2,
    name: "AFC Bournemouth",
    pl: 9,
    w: 5,
    d: 3,
    l: 1,
    goals: "16-11",
    gd: "+5",
    pts: 18,
    form: ["D", "D", "W", "D", "W"],
  },
  {
    rank: 3,
    name: "Liverpool",
    pl: 10,
    w: 6,
    d: 0,
    l: 4,
    goals: "18-18",
    gd: "+0",
    pts: 18,
    form: ["L", "L", "L", "W", "D"],
  },
  {
    rank: 4,
    name: "Tottenham Hotspur",
    pl: 10,
    w: 5,
    d: 2,
    l: 3,
    goals: "17-8",
    gd: "+9",
    pts: 17,
    form: ["D", "W", "W", "L", "W"],
  },
  {
    rank: 5,
    name: "Chelsea",
    pl: 10,
    w: 5,
    d: 2,
    l: 3,
    goals: "18-11",
    gd: "+7",
    pts: 17,
    form: ["L", "W", "W", "L", "W"],
  },
];

const Badge = ({ v }: { v: string }) => {
  const color =
    v === "W" ? "bg-green-2" : v === "D" ? "bg-dark-5" : "bg-red-500";
  return (
    <span
      className={`${color} text-whitish inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold`}
    >
      {v}
    </span>
  );
};

const Table = () => {
  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-8 rounded-2xl p-5">
      <div className="mb-5 flex items-center gap-2">
        <button className="bg-whitish text-dark dark:bg-whitish dark:text-dark rounded-full px-4 py-1 text-sm font-medium">
          All
        </button>
        <button className="dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Home
        </button>
        <button className="dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Away
        </button>
        <button className="dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Form
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
        {teams.map((t) => (
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
            <div className="w-12 text-center text-sm">{t.goals}</div>
            <div className="w-10 text-center text-sm">{t.gd}</div>
            <div className="w-10 text-center text-sm font-bold">{t.pts}</div>
            <div className="w-28 text-left">
              <div className="flex items-center justify-start gap-1">
                {t.form.map((f, i) => (
                  <Badge key={i} v={f} />
                ))}
              </div>
            </div>
            <div className="w-10 text-center">
              <span className="bg-dark-4 inline-block h-6 w-6 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Table;
