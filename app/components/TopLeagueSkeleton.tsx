import React from "react";

interface TopLeagueSkeletonProps {
  title?: string;
  skeletonCount?: number;
}

const TopLeagueSkeleton = ({
  title = "Top League",
  skeletonCount = 5,
}: TopLeagueSkeletonProps) => {
  return (
    <div className="bg-whitish dark:text-whitish dark:bg-dark-1 inline-block w-[23%] grow-0 rounded-2xl">
      <h1 className="p-5">{title}</h1>
      <div className="space-y-2 px-7 py-4">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <div key={index} className="flex animate-pulse items-center gap-2">
            <span className="bg-dark-4 inline rounded-full px-4 py-4" />
            <span className="bg-dark-4 h-4 w-32 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopLeagueSkeleton;
