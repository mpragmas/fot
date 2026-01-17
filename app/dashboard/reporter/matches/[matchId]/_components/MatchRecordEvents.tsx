"use client";

import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import type { RecordedEventTeam } from "./LiveTimelineSection";

type MatchStatType =
  | "GOAL"
  | "OWN_GOAL"
  | "PENALTY_GOAL"
  | "ASSIST"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION";

// --- Reusable Counter Row Component ---
interface CounterRowProps {
  label: string;
  homeTeamName: string;
  awayTeamName: string;
  homeValue: number;
  awayValue: number;
  onHomeMinus: () => void;
  onHomePlus: () => void;
  onAwayMinus: () => void;
  onAwayPlus: () => void;
}

const CounterRow = memo<CounterRowProps>(function CounterRow({
  label,
  homeTeamName,
  awayTeamName,
  homeValue,
  awayValue,
  onHomeMinus,
  onHomePlus,
  onAwayMinus,
  onAwayPlus,
}) {
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
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <button
              type="button"
              onClick={onHomePlus}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-100 transition-colors"
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
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <button
              type="button"
              onClick={onAwayPlus}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// --- Main Component Props ---
interface MatchRecordEventsProps {
  homePlayers: { id: number; name: string }[];
  awayPlayers: { id: number; name: string }[];
  onCreateStat: (payload: {
    playerId: number;
    type: MatchStatType;
    minute: number;
    half: 1 | 2;
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
  isSubmitting: boolean;
  currentMinute?: number;
  defaultHalf?: 1 | 2;
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
  isSubmitting,
  currentMinute,
  defaultHalf,
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
  const [penalty, setPenalty] = useState(false);

  const [goalPlayerId, setGoalPlayerId] = useState<string>("");
  const [assistPlayerId, setAssistPlayerId] = useState<string>("");
  const [cardPlayerId, setCardPlayerId] = useState<string>("");
  const [subOffPlayerId, setSubOffPlayerId] = useState<string>("");
  const [subOnPlayerId, setSubOnPlayerId] = useState<string>("");

  const [cardColor, setCardColor] = useState<"YELLOW_CARD" | "RED_CARD">(
    "YELLOW_CARD",
  );

  // Controls whether the minute field follows the live match clock, and
  // whether the user has manually edited the minute (in which case we stop
  // auto-syncing until they re-enable it).
  const [useLiveMinute, setUseLiveMinute] = useState(true);
  const [hasTouchedMinute, setHasTouchedMinute] = useState(false);

  // Track which half this event belongs to. Default from parent when given.
  const [half, setHalf] = useState<1 | 2>(defaultHalf ?? 1);

  // Lightweight per-tab error message so the user knows why a click did nothing.
  const [goalError, setGoalError] = useState<string | null>(null);
  const [cardError, setCardError] = useState<string | null>(null);
  const [subError, setSubError] = useState<string | null>(null);

  // Keep half in sync with the current match half when it changes.
  useEffect(() => {
    if (defaultHalf === 1 || defaultHalf === 2) {
      setHalf(defaultHalf);
    }
  }, [defaultHalf]);

  // Whenever the current match minute changes, if live-sync is enabled and
  // the user hasn't manually edited the field, keep the form minute in sync.
  useEffect(() => {
    if (!useLiveMinute) return;
    if (currentMinute == null) return;
    if (hasTouchedMinute) return;
    setMinute(String(Math.max(0, Math.floor(currentMinute))));
  }, [currentMinute, useLiveMinute, hasTouchedMinute]);




  const parsedMinute = Number.isFinite(Number(minute))
    ? Math.max(0, Math.floor(Number(minute)))
    : 0;

  const resetForm = useCallback(() => {
    setMinute("0");
    setOwnGoal(false);
    setPenalty(false);
    setCardColor("YELLOW_CARD");
    setGoalPlayerId("");
    setAssistPlayerId("");
    setCardPlayerId("");
    setSubOffPlayerId("");
    setSubOnPlayerId("");
    setGoalError(null);
    setCardError(null);
    setSubError(null);
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
        onChange={(e) => {
          setHasTouchedMinute(true);
          setMinute(e.target.value);
        }}
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
                className={`border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none ${
                  ownGoal || penalty
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-white"
                }`}
                value={assistPlayerId}
                onChange={(e) => setAssistPlayerId(e.target.value)}
                disabled={ownGoal || penalty}
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
                onChange={(e) => {
                  const next = e.target.checked;
                  setOwnGoal(next);
                  if (next) {
                    // Own goal and penalty are mutually exclusive.
                    setPenalty(false);
                    // No assist for own goals: clear assist.
                    setAssistPlayerId("");
                  }
                }}
              />
              <span className="text-gray-600">Own goal</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 outline-none focus:outline-none"
                checked={penalty}
                onChange={(e) => {
                  const next = e.target.checked;
                  setPenalty(next);
                  if (next) {
                    // Penalty and own-goal are mutually exclusive.
                    setOwnGoal(false);
                    // No assist for penalties: clear assist.
                    setAssistPlayerId("");
                  }
                }}
              />
              <span className="text-gray-600">Penalty</span>
            </label>

            <button
              type="button"
              onClick={() => {
                const playerId = Number(goalPlayerId);
                if (!Number.isFinite(playerId) || playerId < 1) {
                  setGoalError("Select a goal scorer.");
                  return;
                }
                const type: MatchStatType = penalty
                  ? "PENALTY_GOAL"
                  : ownGoal
                    ? "OWN_GOAL"
                    : "GOAL";
                onCreateStat({
                  playerId,
                  type,
                  minute: parsedMinute,
                  half,
                });
                const aId = Number(assistPlayerId);
                if (
                  !ownGoal &&
                  !penalty &&
                  Number.isFinite(aId) &&
                  aId > 0 &&
                  aId !== playerId
                ) {
                  onCreateStat({
                    playerId: aId,
                    type: "ASSIST",
                    minute: parsedMinute,
                    half,
                  });
                }
                resetForm();
              }}
              disabled={isSubmitting}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Goal"}
            </button>
            {goalError && (
              <span className="text-xs text-red-500">{goalError}</span>
            )}
          </div>
        </>
      )}

      {(activeTab === "Goals" ||
        activeTab === "Cards" ||
        activeTab === "Substitution") && (
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={useLiveMinute}
              onChange={(e) => {
                const next = e.target.checked;
                setUseLiveMinute(next);
                if (next) {
                  setHasTouchedMinute(false);
                }
              }}
            />
            <span>Use live match time</span>
          </label>

          <div className="flex items-center gap-2">
            <span>Half:</span>
            <select
              className="border-gray-2 rounded-md border p-1 text-sm outline-none focus:outline-none"
              value={half}
              onChange={(e) => setHalf(Number(e.target.value) === 2 ? 2 : 1)}
            >
              <option value={1}>1st</option>
              <option value={2}>2nd</option>
            </select>
          </div>
        </div>
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
                if (!Number.isFinite(playerId) || playerId < 1) {
                  setCardError("Select a player for the card.");
                  return;
                }
                onCreateStat({
                  playerId,
                  type: cardColor,
                  minute: parsedMinute,
                  half,
                });
                resetForm();
              }}
              disabled={isSubmitting}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Card"}
            </button>
            {cardError && (
              <span className="ml-3 text-xs text-red-500">{cardError}</span>
            )}
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
                if (!Number.isFinite(offId) || offId < 1) {
                  setSubError("Select the player going off.");
                  return;
                }
                if (!Number.isFinite(onId) || onId < 1) {
                  setSubError("Select the player coming on.");
                  return;
                }
                onCreateStat({
                  playerId: offId,
                  type: "SUBSTITUTION",
                  minute: parsedMinute,
                  half,
                });
                if (onId !== offId) {
                  onCreateStat({
                    playerId: onId,
                    type: "SUBSTITUTION",
                    minute: parsedMinute,
                    half,
                  });
                }
                resetForm();
              }}
              disabled={isSubmitting}
              className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
            >
              {isSubmitting ? "Adding..." : "Add Substitution"}
            </button>
            {subError && (
              <span className="ml-3 text-xs text-red-500">{subError}</span>
            )}
          </div>
        </>
      )}

      {activeTab === "Shots on Target" && (
        <>
          <CounterRow
            label="Shots on Target"
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
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
            homeTeamName={homeTeamName}
            awayTeamName={awayTeamName}
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

export default memo(MatchRecordEvents);

