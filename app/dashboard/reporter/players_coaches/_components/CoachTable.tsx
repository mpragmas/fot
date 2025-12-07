import React from "react";

type Coach = {
  name: string;
  team: string;
};

const coaches: Coach[] = Array.from({ length: 4 }).map(() => ({
  name: "Mugiraneza Lotfi",
  team: "APR FC",
}));

const CoachTable = () => {
  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">Coaches</h2>
            <p className="mt-1 text-xs text-gray-500"> </p>
          </div>

          {/* Filters + Add button (right side) */}
          <div className="flex items-center gap-3">
            <select
              className="rounded border border-gray-200 px-3 py-1 text-sm outline-none"
              aria-label="league"
            >
              <option>League</option>
            </select>

            <select
              className="rounded border border-gray-200 px-3 py-1 text-sm outline-none"
              aria-label="teams"
            >
              <option>Teams</option>
            </select>

            <select
              className="rounded border border-gray-200 bg-white px-3 py-1 text-sm outline-none"
              aria-label="all"
            >
              <option>All</option>
            </select>

            <button className="inline-flex items-center gap-2 rounded bg-sky-600 px-3 py-1.5 text-white hover:bg-sky-700">
              <span className="text-sm font-medium">+ Add Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Coach List - Card based */}
      <div className="border-t border-gray-100 px-6 py-4">
        <div className="flex flex-col gap-3">
          {coaches.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{c.name}</h3>
                <p className="mt-1 text-sm text-gray-600">{c.team}</p>
              </div>
              <button className="text-dark rounded border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CoachTable;
