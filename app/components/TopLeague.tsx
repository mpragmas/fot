"use client";

import React from "react";
import { useTopLeagues } from "../hooks/useTopLeagues";
import TopLeagueSkeleton from "./TopLeagueSkeleton";

const TopLeague = () => {
  const { leagues, isLoading, isError } = useTopLeagues();

  if (isLoading) {
    return <TopLeagueSkeleton />;
  }

  if (isError) {
    return (
      <div className="bg-whitish dark:text-whitish dark:bg-dark-1 inline-block w-[23%] grow-0 rounded-2xl">
        <h1 className="p-5">Top League</h1>
        <div className="px-7 pb-4 text-sm text-red-500">
          Failed to load leagues.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-whitish dark:text-whitish dark:bg-dark-1 inline-block w-[23%] grow-0 rounded-2xl">
      <h1 className="p-5">Top League</h1>
      <div className="space-y-2 px-7 py-4">
        {leagues.map((league) => (
          <div className="flex items-center gap-1" key={league.id}>
            <p className="bg-dark-4 inline rounded-full px-4 py-4" />
            <p>{league.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopLeague;
