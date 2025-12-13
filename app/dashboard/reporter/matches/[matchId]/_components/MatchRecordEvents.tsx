"use client";

import React, { useCallback, useState } from "react";
import type {
  RecordedEvent,
  RecordedEventTeam,
  RecordedEventType,
} from "./LiveTimelineSection";

interface MatchRecordEventsProps {
  onAddEvent: (event: Omit<RecordedEvent, "id">) => void;
  homeTeamName: string;
  awayTeamName: string;
}

const MatchRecordEvents: React.FC<MatchRecordEventsProps> = ({
  onAddEvent,
  homeTeamName,
  awayTeamName,
}) => {
  const tabs = [
    "Goals",
    "Cards",
    "Substitution",
    "Shots",
    "Corners",
    "Fouls",
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Goals");

  // Shared minimal local state for forms
  const [selectedTeam, setSelectedTeam] = useState<RecordedEventTeam>("HOME");
  const [playerName, setPlayerName] = useState("");
  const [assistName, setAssistName] = useState("");
  const [ownGoal, setOwnGoal] = useState(false);

  const resetForm = useCallback(() => {
    setPlayerName("");
    setAssistName("");
    setOwnGoal(false);
  }, []);

  const handleAddEvent = useCallback(
    (type: RecordedEventType) => {
      if (!playerName.trim()) return;

      // Minute is kept simple for now; it can be wired to the authoritative clock later.
      const base: Omit<RecordedEvent, "id"> = {
        type,
        team: selectedTeam,
        minute: 0,
        playerName: playerName.trim(),
      };

      onAddEvent(base);
      resetForm();
    },
    [onAddEvent, playerName, resetForm, selectedTeam],
  );
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
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={selectedTeam}
                onChange={(e) =>
                  setSelectedTeam(e.target.value === "HOME" ? "HOME" : "AWAY")
                }
              >
                <option value="HOME">{homeTeamName}</option>
                <option value="AWAY">{awayTeamName}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <input
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                placeholder="Player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Assist (optional)
              </label>
              <input
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                placeholder="Assist name"
                value={assistName}
                onChange={(e) => setAssistName(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 outline-none focus:outline-none"
                checked={ownGoal}
                onChange={(e) => setOwnGoal(e.target.checked)}
              />
              <span className="text-gray-600">Own goal</span>
            </label>

            <button
              type="button"
              onClick={() => handleAddEvent("GOAL")}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
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
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={selectedTeam}
                onChange={(e) =>
                  setSelectedTeam(e.target.value === "HOME" ? "HOME" : "AWAY")
                }
              >
                <option value="HOME">{homeTeamName}</option>
                <option value="AWAY">{awayTeamName}</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <input
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                placeholder="Player name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Note</label>
              <input
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                placeholder="e.g. On for Salah"
                value={assistName}
                onChange={(e) => setAssistName(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => handleAddEvent("SUBSTITUTION")}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
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
