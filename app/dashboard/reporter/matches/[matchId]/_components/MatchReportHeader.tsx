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
  controls: {
    startMatch: () => void;
    endFirstHalf: () => void;
    startSecondHalf: () => void;
    endMatch: () => void;
    addExtraTime: (minutes: number) => void;
    isLoading: boolean;
  };
}

type Phase =
  | "PRE" // before kickoff
  | "FIRST_HALF"
  | "HT"
  | "SECOND_HALF"
  | "ET" // extra time
  | "FT";

const MatchReportHeader = ({ match, controls }: MatchReportHeaderProps) => {
  const {
    startMatch,
    endFirstHalf,
    startSecondHalf,
    endMatch,
    addExtraTime,
    isLoading,
  } = controls;

  if (!match) return null;

  // Frontend clock & phase hydrated from backend
  const [phase, setPhase] = useState<Phase>(() => match.phase ?? "PRE");
  const [startTime, setStartTime] = useState<number | null>(() => {
    if (match.clockStartedAt) return new Date(match.clockStartedAt).getTime();
    return null;
  });
  const [elapsedMs, setElapsedMs] = useState(
    () => (match.elapsedSeconds ?? 0) * 1000,
  );

  // Simple undo support (frontend only)
  const [lastPhase, setLastPhase] = useState<Phase | null>(null);
  const [lastElapsedMs, setLastElapsedMs] = useState<number | null>(null);

  const snapshot = () => {
    setLastPhase(phase);
    setLastElapsedMs(elapsedMs);
  };

  const isRunning =
    phase === "FIRST_HALF" || phase === "SECOND_HALF" || phase === "ET";

  useEffect(() => {
    if (!isRunning || startTime == null) return;

    const tick = () => {
      setElapsedMs(Date.now() - startTime);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isRunning, startTime]);

  const minutesSeconds = useMemo(() => {
    const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
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
  }, [elapsedMs, phase]);

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

  const handleStartMatch = () => {
    snapshot();
    setPhase("FIRST_HALF");
    const now = Date.now();
    setStartTime(now);
    setElapsedMs(0);
    startMatch();
  };

  const handleEndFirstHalf = () => {
    snapshot();
    setPhase("HT");
    // clock freezes automatically because isRunning becomes false
    endFirstHalf();
  };

  const handleStartSecondHalf = () => {
    // resume from current elapsed
    snapshot();
    const now = Date.now();
    setStartTime(now - elapsedMs);
    setPhase("SECOND_HALF");
    startSecondHalf();
  };

  const handleAddExtraTime = () => {
    const minutes = Math.floor(elapsedMs / 60000);
    // Only meaningful once we've crossed 45' (first half) or 90' (second half)
    if (minutes < 45 && minutes < 90) return;
    snapshot();
    setPhase("ET");
    addExtraTime(minutes);
  };

  const handleEndMatch = () => {
    snapshot();
    setPhase("FT");
    endMatch();
  };

  const handleUndo = () => {
    if (!lastPhase) return;
    setPhase(lastPhase);
    if (lastElapsedMs !== null) setElapsedMs(lastElapsedMs);
  };

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
            <div className="text-gray-2 text-5xl font-bold">0 - 0</div>
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
                onClick={handleAddExtraTime}
                disabled={isLoading}
                className="bg-gray-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                Add Extra Time
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
                onClick={handleAddExtraTime}
                disabled={isLoading}
                className="bg-gray-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                Add Extra Time
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
                onClick={handleAddExtraTime}
                disabled={isLoading}
                className="bg-gray-2 rounded-md px-4 py-2 shadow disabled:opacity-50"
              >
                Add Extra Time
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

          {phase === "FT" && (
            <div className="px-4 py-2 font-semibold text-gray-500">FT</div>
          )}

          {lastPhase && (
            <button
              onClick={handleUndo}
              disabled={isLoading}
              className="border-gray-3 text-gray-3 rounded-md border px-4 py-2 text-sm shadow disabled:opacity-50"
            >
              Undo Last Action
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchReportHeader;
