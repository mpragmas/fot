import React from "react";

const AllAssignedMatches = () => {
  return (
    <div className="mb-8 flex items-center justify-between px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold">My Matches</h1>
        <p className="text-gray-1 text-base">
          Manage your assigned matches, start live consoles, and edit reports.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search Team"
          className="border-gray-2 rounded-lg border px-4 py-2 text-sm focus:outline-none"
        />
        <select className="border-gray-2 text-dark w-22 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none">
          <option value="">All</option>
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default AllAssignedMatches;
