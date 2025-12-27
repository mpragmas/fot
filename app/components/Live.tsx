import React from "react";
import Filter from "./Filter";

const arr = [1, 2, 3, 4, 5, 6, 7];

const Live = () => {
  return (
    <div className="w-[54%] space-y-3">
      <Filter />
      <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl">
        <div className="dark:bg-dark-2 flex items-center gap-2 p-4">
          <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
          <p>Rwanda - Premier League</p>
        </div>

        {arr.map((item, i, arr) => (
          <div
            className={`flex items-center justify-between p-4 ${i == arr.length - 1 ? "" : "border-dark-4 border-b-1"}`}
            key={i}
          >
            <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
            <div className="flex gap-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm">APR FC</p>
                <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
              </div>
              <p className="self-center">0 - 0</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm">APR FC</p>
                <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
              </div>
            </div>
            <p className=""></p>
          </div>
        ))}
      </div>
      <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl">
        <div className="dark:bg-dark-2 flex items-center gap-2 p-4">
          <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
          <p>Rwanda - Second divion</p>
        </div>

        {arr.map((item, i, arr) => (
          <div
            className={`flex items-center justify-between p-4 ${i == arr.length - 1 ? "" : "border-dark-4 border-b-1"}`}
            key={i}
          >
            <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
            <div className="flex gap-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm">Barca</p>
                <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
              </div>
              <p className="self-center">0 - 0</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm">Madrid</p>
                <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
              </div>
            </div>
            <p className=""></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Live;
