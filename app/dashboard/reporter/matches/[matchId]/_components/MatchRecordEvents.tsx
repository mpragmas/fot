import React, { useState } from "react";

const MatchRecordEvents = () => {
  const tabs = [
    "Goals",
    "Cards",
    "Substitution",
    "Shots",
    "Corners",
    "Fouls",
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Goals");
  return (
    <div className="rounded-xl bg-white p-6 shadow lg:col-span-2">
      <h2 className="mb-4 text-xl font-semibold">Record Events</h2>

      {/* Tabs */}
      <div className="bg-gray-2 mb-4 inline-flex gap-1 rounded-xl p-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setActiveTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus:outline-none ${
              activeTab === t
                ? "bg-gray-3 text-gray-900"
                : "text-gray-1 hover:text-gray-700"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "Goals" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Team</label>
              <select className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none">
                <option>Home</option>
                <option>Away</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <select className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none">
                <option>Select player</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Assist (optional)
              </label>
              <select className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none">
                <option>Assist name</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 outline-none focus:outline-none"
              />
              <span className="text-gray-600">Own goal</span>
            </label>

            <button className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none">
              Add Goal
            </button>

            <span className="text-sm text-gray-500">Minute: 0'</span>
          </div>
        </>
      )}

      {activeTab === "Substitution" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600">Team</label>
              <select className="border-gray-2 w-full rounded-md border p-2">
                <option>Home</option>
                <option>Away</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <select className="border-gray-2 w-full rounded-md border p-2">
                <option>Select player</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Card</label>
              <select className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none">
                <option>Yellow card</option>
                <option>Red card</option>
                <option>No card</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <button className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none">
              Add Substitution
            </button>
          </div>
        </>
      )}

      {activeTab !== "Goals" && activeTab !== "Substitution" && (
        <div className="rounded-md border border-dashed border-gray-200 p-4 text-sm text-gray-500">
          Event form for <span className="font-semibold">{activeTab}</span> will
          go here.
        </div>
      )}
    </div>
  );
};

export default MatchRecordEvents;
