import React from "react";
import { FaAngleLeft, FaSortDown } from "react-icons/fa";
import LeftArrow from "../ui/LeftArrow";
import RightArrow from "../ui/RightArrow";
import { IoSearch } from "react-icons/io5";
import { MdFilterList } from "react-icons/md";

const Filter = () => {
  return (
    <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl">
      <div className="flex justify-between p-3">
        <LeftArrow />
        <p className="flex items-center gap-2">
          <span>Today</span>
          <FaSortDown className="self-start" />
        </p>
        <RightArrow />
      </div>
      <p className="border-light-2 dark:border-dark-0 w-full border-[0.2px]"></p>
      <div className="flex items-center justify-between gap-5 p-3">
        <div className="space-x-3">
          <p className="dark:bg-dark-4 dark:text-whitish inline rounded-2xl px-5 py-1 text-xs">
            Ongoing
          </p>

          <p className="dark:bg-dark-4 dark:text-whitish inline rounded-2xl px-5 py-1 text-xs">
            By Time
          </p>
        </div>
        <div className="relative font-normal">
          <MdFilterList className="text-dark-3 absolute top-2 left-3 text-xl" />

          <input
            placeholder="Search"
            className="bg-light-1 dark:bg-dark-2 hidden rounded-3xl py-1 pr-15 pl-10 outline-none placeholder:text-sm focus:placeholder:opacity-0 lg:block"
          />
        </div>
      </div>
    </div>
  );
};

export default Filter;
