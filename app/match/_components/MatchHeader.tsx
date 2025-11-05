import LeftArrow from "@/app/ui/LeftArrow";
import React from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { GiWhistle } from "react-icons/gi";
import { MdStadium } from "react-icons/md";

const MatchCard = () => {
  return (
    <div className="dark:text-whitish dark:bg-dark-1 w-full overflow-hidden rounded-2xl font-sans">
      {/* Header */}
      <div className="flex items-center border-b border-neutral-800 px-4 py-3">
        <button className="flex items-center gap-2 text-sm text-gray-300">
          <LeftArrow /> <span>Matches</span>
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-white">
          <span className="mr-2">⚽</span> Champions League Round 4
        </div>
        <p></p>
      </div>

      {/* Match details */}
      <div className="flex items-center justify-center gap-4 border-b border-neutral-800 px-6 py-3 text-sm text-gray-300">
        <div className="flex items-center gap-1">
          <span>
            <FaRegCalendarAlt />
          </span>
          <span>Tue, November 4, 10:00 PM</span>
        </div>
        <div className="flex items-center gap-1">
          <span>
            <MdStadium />
          </span>
          <span>Anfield</span>
        </div>
        <div className="flex items-center gap-1">
          <span>
            <GiWhistle />
          </span>
          <span>István Kovács</span>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="py-10 text-center">
        <div className="flex w-full flex-nowrap items-start justify-center gap-12 px-16 text-center">
          {/* Left team */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold">Liverpool</span>
              <img
                src="https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
                alt="Liverpool"
                className="h-10 w-10"
              />
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
            </div>
          </div>

          {/* Score */}
          <div className="shrink-0 self-start">
            <div>
              <p className="text-2xl font-bold">1 - 0</p>
              <p className="mt-2 text-sm text-gray-400">Full time</p>
            </div>
            <p className="mt-4">⚽</p>
          </div>

          {/* Right team */}
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
                alt="Real Madrid"
                className="h-10 w-10"
              />
              <span className="text-lg font-semibold">Real Madrid</span>
            </div>
            <div className="mt-8">
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
              <p className="text-sm text-gray-400">Mac Allister 61’ </p>
            </div>
          </div>
          {/* Match info */}
          <div className="mt-4 flex items-center gap-2"></div>
        </div>
      </div>

      {/* Bottom tabs */}
      <div className="flex gap-17 px-6 py-3 text-sm text-gray-400">
        <span className="cursor-pointer border-b-2 border-green-500 pb-1 text-white">
          Facts
        </span>

        <span className="cursor-pointer">Lineup</span>
        <span className="cursor-pointer">Table</span>

        <span className="cursor-pointer">Stats</span>
      </div>
    </div>
  );
};

export default MatchCard;
