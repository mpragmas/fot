"use client";

import React, { useCallback, useMemo, useState } from "react";
import type { RecordedEventTeam } from "./LiveTimelineSection";

type MatchStatType =
  | "GOAL"
  | "OWN_GOAL"
  | "ASSIST"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION";

interface MatchRecordEventsProps {
  homePlayers: { id: number; name: string }[];
  awayPlayers: { id: number; name: string }[];
  onCreateStat: (payload: {
    playerId: number;
    type: MatchStatType;
    minute: number;
  }) => void;
  counters: {
    homeShotsOnTarget: number;
    awayShotsOnTarget: number;
    homeCorners: number;
    awayCorners: number;
  };
  onAdjustShotsOnTarget: (team: RecordedEventTeam, delta: 1 | -1) => void;
  onAdjustCorners: (team: RecordedEventTeam, delta: 1 | -1) => void;
  homeTeamName: string;
  awayTeamName: string;
}

const MatchRecordEvents: React.FC<MatchRecordEventsProps> = ({
  homePlayers,
  awayPlayers,
  onCreateStat,
  counters,
  onAdjustShotsOnTarget,
  onAdjustCorners,
  homeTeamName,
  awayTeamName,
}) => {
  const tabs = [
    "Goals",
    "Cards",
    "Substitution",
    "Shots on Target",
    "Corners",
  ] as const;

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Goals");

  // Shared minimal local state for forms
  const [selectedTeam, setSelectedTeam] = useState<RecordedEventTeam>("HOME");
  const [minute, setMinute] = useState("0");
  const [ownGoal, setOwnGoal] = useState(false);

  const [goalPlayerId, setGoalPlayerId] = useState<string>("");
  const [assistPlayerId, setAssistPlayerId] = useState<string>("");
  const [cardPlayerId, setCardPlayerId] = useState<string>("");
  const [subOffPlayerId, setSubOffPlayerId] = useState<string>("");
  const [subOnPlayerId, setSubOnPlayerId] = useState<string>("");

  const [cardColor, setCardColor] = useState<"YELLOW_CARD" | "RED_CARD">(
    "YELLOW_CARD",
  );

  const CounterRow = ({
    label,
    homeValue,
    awayValue,
    onHomeMinus,
    onHomePlus,
    onAwayMinus,
    onAwayPlus,
  }: {
    label: string;
    homeValue: number;
    awayValue: number;
    onHomeMinus: () => void;
    onHomePlus: () => void;
    onAwayMinus: () => void;
    onAwayPlus: () => void;
  }) => {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <div className="mb-3 text-sm font-semibold text-gray-700">{label}</div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
            <div>
              <div className="text-xs text-gray-500">{homeTeamName}</div>
              <div className="text-xl font-bold text-gray-800">{homeValue}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onHomeMinus}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold"
              >
                -
              </button>
              <button
                type="button"
                onClick={onHomePlus}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md bg-gray-50 p-3">
            <div>
              <div className="text-xs text-gray-500">{awayTeamName}</div>
              <div className="text-xl font-bold text-gray-800">{awayValue}</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onAwayMinus}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold"
              >
                -
              </button>
              <button
                type="button"
                onClick={onAwayPlus}
                className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const parsedMinute = Number.isFinite(Number(minute))
    ? Math.max(0, Math.floor(Number(minute)))
    : 0;

  const resetForm = useCallback(() => {
    setMinute("0");
    setOwnGoal(false);
    setCardColor("YELLOW_CARD");
    setGoalPlayerId("");
    setAssistPlayerId("");
    setCardPlayerId("");
    setSubOffPlayerId("");
    setSubOnPlayerId("");
  }, []);

  const teamPlayers = useMemo(
    () => (selectedTeam === "HOME" ? homePlayers : awayPlayers),
    [awayPlayers, homePlayers, selectedTeam],
  );

  const TeamSelect = (
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
  );

  const MinuteInput = (
    <div>
      <label className="mb-1 block text-sm text-gray-600">Minute</label>
      <input
        className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
        inputMode="numeric"
        value={minute}
        onChange={(e) => setMinute(e.target.value)}
        placeholder="e.g. 23"
      />
    </div>
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
            {TeamSelect}

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={goalPlayerId}
                onChange={(e) => setGoalPlayerId(e.target.value)}
              >
                <option value="">Select player</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">
                Assist (optional)
              </label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={assistPlayerId}
                onChange={(e) => setAssistPlayerId(e.target.value)}
              >
                <option value="">No assist</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">{MinuteInput}</div>

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
              onClick={() => {
                const playerId = Number(goalPlayerId);
                if (!Number.isFinite(playerId) || playerId < 1) return;
                onCreateStat({
                  playerId,
                  type: ownGoal ? "OWN_GOAL" : "GOAL",
                  minute: parsedMinute,
                });
                const aId = Number(assistPlayerId);
                if (
                  !ownGoal &&
                  Number.isFinite(aId) &&
                  aId > 0 &&
                  aId !== playerId
                ) {
                  onCreateStat({
                    playerId: aId,
                    type: "ASSIST",
                    minute: parsedMinute,
                  });
                }
                resetForm();
              }}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
              Add Goal
            </button>
          </div>
        </>
      )}

      {activeTab === "Cards" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {TeamSelect}

            <div>
              <label className="mb-1 block text-sm text-gray-600">Card</label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={cardColor}
                onChange={(e) =>
                  setCardColor(
                    e.target.value === "RED_CARD" ? "RED_CARD" : "YELLOW_CARD",
                  )
                }
              >
                <option value="YELLOW_CARD">Yellow</option>
                <option value="RED_CARD">Red</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">Player</label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={cardPlayerId}
                onChange={(e) => setCardPlayerId(e.target.value)}
              >
                <option value="">Select player</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {MinuteInput}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const playerId = Number(cardPlayerId);
                if (!Number.isFinite(playerId) || playerId < 1) return;
                onCreateStat({
                  playerId,
                  type: cardColor,
                  minute: parsedMinute,
                });
                resetForm();
              }}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
              Add Card
            </button>
          </div>
        </>
      )}

      {activeTab === "Substitution" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {TeamSelect}
            <div>
              <label className="mb-1 block text-sm text-gray-600">Off</label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={subOffPlayerId}
                onChange={(e) => setSubOffPlayerId(e.target.value)}
              >
                <option value="">Select player</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">On</label>
              <select
                className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                value={subOnPlayerId}
                onChange={(e) => setSubOnPlayerId(e.target.value)}
              >
                <option value="">Select player</option>
                {teamPlayers.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {MinuteInput}
          </div>

          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                const offId = Number(subOffPlayerId);
                const onId = Number(subOnPlayerId);
                if (!Number.isFinite(offId) || offId < 1) return;
                if (!Number.isFinite(onId) || onId < 1) return;
                onCreateStat({
                  playerId: offId,
                  type: "SUBSTITUTION",
                  minute: parsedMinute,
                });
                if (onId !== offId) {
                  onCreateStat({
                    playerId: onId,
                    type: "SUBSTITUTION",
                    minute: parsedMinute,
                  });
                }
                resetForm();
              }}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
              Add Substitution
            </button>
          </div>
        </>
      )}

      {activeTab === "Shots on Target" && (
        <>
          <CounterRow
            label="Shots on Target"
            homeValue={counters.homeShotsOnTarget}
            awayValue={counters.awayShotsOnTarget}
            onHomeMinus={() => onAdjustShotsOnTarget("HOME", -1)}
            onHomePlus={() => onAdjustShotsOnTarget("HOME", 1)}
            onAwayMinus={() => onAdjustShotsOnTarget("AWAY", -1)}
            onAwayPlus={() => onAdjustShotsOnTarget("AWAY", 1)}
          />
        </>
      )}

      {activeTab === "Corners" && (
        <>
          <CounterRow
            label="Corners"
            homeValue={counters.homeCorners}
            awayValue={counters.awayCorners}
            onHomeMinus={() => onAdjustCorners("HOME", -1)}
            onHomePlus={() => onAdjustCorners("HOME", 1)}
            onAwayMinus={() => onAdjustCorners("AWAY", -1)}
            onAwayPlus={() => onAdjustCorners("AWAY", 1)}
          />
        </>
      )}
    </div>
  );
};

export default MatchRecordEvents;
