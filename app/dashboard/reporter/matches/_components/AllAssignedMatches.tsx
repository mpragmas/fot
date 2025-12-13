import React from "react";

interface AllAssignedMatchesProps {
  search: string;
  setSearch: (val: string) => void;
  status: string;
  setStatus: (val: any) => void;
}

const AllAssignedMatches = ({
  search,
  setSearch,
  status,
  setStatus,
}: AllAssignedMatchesProps) => {
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
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border-gray-2 text-dark w-32 rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </div>
  );
};

export default AllAssignedMatches;
