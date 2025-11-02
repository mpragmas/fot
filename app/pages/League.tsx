import React from "react";
import Container from "../ui/Container";

import { FaSortDown } from "react-icons/fa";

const status = ["overview", "table", "Matches", "Stats", "Transfers", "news"];

const League = () => {
  return (
    <Container>
      <div className="dark:text-whitish dark:bg-dark-1 p-5">
        <div className="flex justify-between">
          <div className="flex gap-5">
            <p className="dark:bg-dark-3 rounded-2xl p-5"></p>
            <div>
              <h1 className="text-2xl font-bold">English Premier League</h1>
              <p className="dark:text-dark-3 text-base">Rwanda</p>
            </div>
          </div>
          <div className="relative inline-block">
            <select className="dark:bg-dark-4 w-full appearance-none rounded-xl px-3 py-1 pr-7 focus:outline-none">
              <option value="">2025/2026</option>
              <option value="">2024/2025</option>
              <option value="">2023/2024</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 -top-8 right-0 flex items-center pr-2">
              <FaSortDown className="h-4 w-4 text-gray-500" />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default League;
