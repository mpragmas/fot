import MatchFixture from "@/app/components/MatchFixture";
import MatchResults from "@/app/components/MatchResults";
import LeftArrow from "@/app/ui/LeftArrow";
import RightArrow from "@/app/ui/RightArrow";
import React from "react";

const Matches = () => {
  return (
    <div className="dark:bg-dark-1 dark:text-whitish mt-5 w-full rounded-2xl p-5">
      <div className="mt-2 flex items-center justify-between">
        <LeftArrow />
        <p>Nov 29 - Nov 30</p>
        <RightArrow />
      </div>
      <p className="dark:bg-dark-4 mt-5 rounded-xl px-3 py-2 text-sm font-medium">
        Saturday, November 29
      </p>
      <MatchFixture />
      <MatchFixture />
      <MatchFixture />
    </div>
  );
};

export default Matches;
