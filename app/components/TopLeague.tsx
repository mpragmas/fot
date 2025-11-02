import React from "react";

const arr = [1, 2, 3, 4, 5];

const TopLeague = () => {
  return (
    <div className="bg-whitish dark:text-whitish dark:bg-dark-1 inline-block w-[23%] grow-0 rounded-2xl">
      <h1 className="p-5">Top League</h1>
      <div className="space-y-2 px-7 py-4">
        {arr.map((item, i) => (
          <div className="flex items-center gap-1" key={i}>
            <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
            <p>English Premier League</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopLeague;
