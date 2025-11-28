import React from "react";

// --- Stat Card ---
interface StatCardProps {
  label: string;
  value: string | number;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="border-gray-2 rounded-lg border p-4 shadow">
    {label && (
      <span className="text-sm font-semibold text-slate-500">{label}</span>
    )}
    <div className="text-lg font-bold text-slate-700">{value}</div>
  </div>
);

const MatchTotalStats = () => {
  return (
    <div className="w-full rounded-2xl p-6 shadow md:p-8 lg:w-1/3">
      <h2 className="mb-6 text-xl font-bold">Stats</h2>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Shots APR" value="0" />
        <StatCard label="Shots RAY" value="0" />
        <StatCard label="Corner APR" value="0" />
        <StatCard label="Corner RAY" value="0" />
        <StatCard label="" value="0" />
        <StatCard label="Shots" value="0" />
      </div>
    </div>
  );
};

export default MatchTotalStats;
