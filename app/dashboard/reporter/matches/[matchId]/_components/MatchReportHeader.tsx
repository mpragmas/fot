import React, { useEffect, useMemo, useState } from "react";
import { ReporterMatchStatus } from "@/app/hooks/userReporterMatchs";

interface Match {
  id: number;
  status: ReporterMatchStatus;
  fixture: {
    homeTeam: { name: string };
    awayTeam: { name: string };
    date: string; // kickoff
  };
  phase?: "PRE" | "FIRST_HALF" | "HT" | "SECOND_HALF" | "ET" | "FT";
  elapsedSeconds?: number;
  clockStartedAt?: string | null;
}

interface MatchReportHeaderProps {
  match?: Match;
  score: { home: number; away: number };
  controls: {
    startMatch: () => void;
    endFirstHalf: () => void;
    startSecondHalf: () => void;
    endMatch: () => void;
    pauseClock: () => void;
    resumeClock: () => void;
    undoLastAction: () => void;
    isLoading: boolean;
  };
}

type Phase = "PRE" | "FIRST_HALF" | "HT" | "SECOND_HALF" | "ET" | "FT";

function isRunningPhase(phase: Phase) {
  return phase === "FIRST_HALF" || phase === "SECOND_HALF" || phase === "ET";
}

function formatClock(phase: Phase, effectiveElapsedSeconds: number) {
  const totalSeconds = Math.max(0, Math.floor(effectiveElapsedSeconds));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const pad2 = (n: number) => (n < 10 ? `0${n}` : String(n));

  // Extra time formatting
  if (minutes >= 90) {
    return `90+${minutes - 90}`;
  }
  if (minutes >= 45 && minutes < 60) {
    return `45+${minutes - 45}`;
  }

  return `${minutes}:${pad2(seconds)}`;
}

const MatchReportHeader = ({
  match,
  controls,
  score,
}: MatchReportHeaderProps) => {
  const {
    startMatch,
    endFirstHalf,
    startSecondHalf,
    endMatch,
    pauseClock,
    resumeClock,
    undoLastAction,
    isLoading,
  } = controls;

  if (!match) return null;

  const phase: Phase = match.phase ?? "PRE";

  // Tick purely for displaying derived live time; backend clock remains source of truth.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!isRunningPhase(phase)) return;
    const id = window.setInterval(
      () => setTick((t) => (t + 1) % 1000000),
      1000,
    );
    return () => window.clearInterval(id);
  }, [phase]);

  const effectiveElapsedSeconds = useMemo(() => {
    const base = match.elapsedSeconds ?? 0;
    const startedAt = match.clockStartedAt
      ? new Date(match.clockStartedAt).getTime()
      : null;
    if (!isRunningPhase(phase) || !startedAt) return base;
    const delta = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    return base + delta;
  }, [match.clockStartedAt, match.elapsedSeconds, phase, tick]);

  const minutesSeconds = useMemo(
    () => formatClock(phase, effectiveElapsedSeconds),
    [effectiveElapsedSeconds, phase],
  );

  const phaseLabel = useMemo(() => {
    switch (phase) {
      case "FIRST_HALF":
        return "1ST";
      case "HT":
        return "HT";
      case "SECOND_HALF":
        return "2ND";
      case "ET":
        return "ET";
      case "FT":
        return "FT";
      case "PRE":
      default:
        return "UPCOMING";
    }
  }, [phase]);

  const handleStartMatch = () => startMatch();
  const handleEndFirstHalf = () => endFirstHalf();
  const handleStartSecondHalf = () => startSecondHalf();
  const handleEndMatch = () => endMatch();

  const handlePauseClock = () => pauseClock();
  const handleResumeClock = () => resumeClock();
  const handleUndoLastAction = () => undoLastAction();

  return (
    <>
      <div className="border-gray-2 rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="text-gray-1 font-semibold">
              {match.fixture.homeTeam.name}
            </div>
          </div>

          <div className="text-center">
            <div className="text-gray-2 text-5xl font-bold">
              {score.home} - {score.away}
            </div>
            <div className="text-blue-2 font-medium">
              {phaseLabel}
              {phase === "PRE"
                ? ` • ${new Date(match.fixture.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : ` • ${minutesSeconds}`}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200" />
            <div className="text-gray-1 font-semibold">
              {match.fixture.awayTeam.name}
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap justify-center gap-3">
          {phase === "PRE" && (
            <button
              onClick={handleStartMatch}
              disabled={isLoading}
              className="bg-blue-2 rounded-md px-4 py-2 text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              Start Match
            </button>
          )}

          {phase === "FIRST_HALF" && (
            <>
              <button
                onClick={handleEndFirstHalf}
                disabled={isLoading}
                className="bg-gray-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                End First Half
              </button>
              <button
                onClick={handlePauseClock}
                disabled={isLoading}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pause Clock
              </button>
              <button
                onClick={handleEndMatch}
                disabled={isLoading}
                className="bg-red-1 text-red-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                End Match
              </button>
            </>
          )}

          {phase === "HT" && (
            <>
              <div className="px-4 py-2 font-semibold text-gray-500">HT</div>
              <button
                onClick={handleStartSecondHalf}
                disabled={isLoading}
                className="bg-gray-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                Start Second Half
              </button>
              <button
                onClick={handleResumeClock}
                disabled={isLoading}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resume Clock
              </button>
              <button
                onClick={handleEndMatch}
                disabled={isLoading}
                className="bg-red-1 text-red-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                End Match
              </button>
            </>
          )}

          {(phase === "SECOND_HALF" || phase === "ET") && (
            <>
              <button
                onClick={handlePauseClock}
                disabled={isLoading}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                Pause Clock
              </button>
              <button
                onClick={handleResumeClock}
                disabled={isLoading}
                className="rounded-md border border-gray-200 bg-white px-4 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                Resume Clock
              </button>
              <button
                onClick={handleEndMatch}
                disabled={isLoading}
                className="bg-red-1 text-red-2 rounded-md px-4 py-2 shadow disabled:cursor-not-allowed disabled:opacity-50"
              >
                End Match
              </button>
            </>
          )}

          {/* Undo last clock action */}
          <button
            onClick={handleUndoLastAction}
            disabled={isLoading}
            className="border-gray-2 text-gray-2 rounded-md border px-4 py-2 shadow-sm disabled:opacity-50"
          >
            Undo Last Action
          </button>

          {phase === "FT" && (
            <div className="px-4 py-2 font-semibold text-gray-500">FT</div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchReportHeader;
