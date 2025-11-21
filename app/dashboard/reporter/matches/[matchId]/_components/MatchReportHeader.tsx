import React from "react";

const MatchReportHeader = () => {
  return (
    <>
      <div className="border-gray-2 rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="text-gray-1 font-semibold">APR FC</div>
          </div>

          <div className="text-center">
            <div className="text-gray-2 text-5xl font-bold">0 - 0</div>
            <div className="text-blue-2 font-medium">Upcoming • 00:00</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="text-gray-1 font-semibold">Rayon Sports</div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-3">
          <button className="bg-blue-2 rounded-md px-4 py-2 text-white shadow">
            Start Match
          </button>
          <button className="bg-gray-2 rounded-md px-4 py-2 shadow">
            End First Half
          </button>
          <button className="bg-gray-2 rounded-md px-4 py-2 shadow">
            Start Second Half
          </button>
          <button className="bg-gray-2 rounded-md px-4 py-2 shadow">
            Add Extra Time
          </button>
          <button className="bg-red-1 text-red-2 rounded-md px-4 py-2 shadow">
            End Match
          </button>
        </div>
      </div>
    </>
  );
};

export default MatchReportHeader;
