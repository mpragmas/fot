import React from "react";
import { CiTrophy } from "react-icons/ci";

const stats = [
  {
    id: 1,
    name: "Total Matches covered",
    value: 1,
  },
  {
    id: 2,
    name: "Ongoing matches",
    value: 1,
  },
  {
    id: 3,
    name: "Completed today",
    value: 1,
  },
];

const WelcomeReporter = () => {
  return (
    <div className="my-8 px-8 py-4">
      <h1 className="mb-6 text-3xl font-bold">Welcome Back</h1>
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="border-gray-2 flex gap-2 rounded-xl border-2 p-6"
          >
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-1 text-2xl font-bold">
                <CiTrophy />
              </p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
            <p className="text-gray-1 self-start text-sm">{stat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeReporter;
