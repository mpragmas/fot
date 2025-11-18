import LeftArrow from "@/app/ui/LeftArrow";
import React from "react";
import Image from "next/image";
import RightArrow from "@/app/ui/RightArrow";

const page = () => {
  return (
    <div className="dark:text-whitish dark:bg-dark-1 mt-10 rounded-2xl p-5">
      <div className="dark:border-dark-2 w-ful flex items-center gap-3 border-b pb-3">
        <LeftArrow />
        <p>Back</p>
      </div>
      <div className="dark:border-dark-2 flex items-center gap-3 border-b py-3">
        <Image src="/images/logo.png" alt="" width={30} height={30} />
        <p>Premier Legue</p>
        <p>Player stats</p>
      </div>
      <h1 className="text-dark-5 dark:border-dark-2 border-b py-3 text-2xl font-extrabold">
        Top scorer
      </h1>

      <div className="flex items-center gap-3 py-4">
        <button className="bg-whitish text-dark dark:bg-whitish dark:text-dark rounded-full px-4 py-1 text-sm font-medium">
          All
        </button>
        <button className="bg-dark text-whitish dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Fowards
        </button>
        <button className="bg-dark text-whitish dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Midfielder
        </button>
        <button className="bg-dark text-whitish dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Defender
        </button>
        <button className="bg-dark text-whitish dark:bg-dark-4 dark:text-whitish rounded-full px-4 py-1 text-sm font-medium">
          Goalkeeper
        </button>
      </div>

      <div className="space-y-4">
        <div className="dark:text-dark-3 flex justify-between text-xs">
          <div className="flex gap-5">
            <p>#</p>
            <p>Player</p>
          </div>
          <p>Stats</p>
        </div>
        <div className="dark:border-dark-2 flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-5">
            <p>1</p>
            <Image src="/images/logo.png" alt="" width={50} height={50} />
            <p>Player Name</p>
          </div>
          <p className="pr-2">6</p>
        </div>
        <div className="text-dark-3 flex items-center justify-between text-sm font-bold">
          <div className="flex items-center gap-3">
            <LeftArrow />
            <p>Previous</p>
          </div>
          <p>1-10 of 35</p>
          <div className="flex items-center gap-3">
            <p>Next</p>
            <RightArrow />
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
