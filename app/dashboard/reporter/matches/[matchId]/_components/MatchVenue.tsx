import React from "react";

const MatchVenue = () => {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Officials & Venue</h2>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-600">Referee</label>
        <input
          type="text"
          placeholder="Names"
          className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-gray-600">Stadium</label>
        <input
          type="text"
          value="Amahoro Stadium"
          readOnly
          className="border-gray-2 w-full rounded-md border bg-gray-100 p-2 outline-none focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button className="bg-blue-2 w-full rounded-md px-4 py-2 text-white outline-none focus:outline-none">
          Save
        </button>
        <button className="w-full rounded-md bg-gray-200 px-4 py-2 outline-none focus:outline-none">
          Submit Report
        </button>
      </div>
    </div>
  );
};

export default MatchVenue;
