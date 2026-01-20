import React, { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type Side = "HOME" | "AWAY";
type Tab = "STARTING" | "BENCH" | "MISSING" | "PLAYERS";

type MissingReasonType =
  | "red_card"
  | "five_yellow_cards"
  | "injury"
  | "personal";

type PlayerOption = {
  id: number;
  name: string;
  number?: number | null;
  position?: string | null;
  teamId?: number | null;
};

type LineupItem = {
  id: number;
  matchId: number;
  playerId: number;
  position: string;
  isStarting: boolean;
};

interface LineupReportProps {
  matchId: number;
  homeTeamName: string;
  awayTeamName: string;
  homePlayers: PlayerOption[];
  awayPlayers: PlayerOption[];
}

const LineupReport: React.FC<LineupReportProps> = ({
  matchId,
  homeTeamName,
  awayTeamName,
  homePlayers,
  awayPlayers,
}) => {
  const queryClient = useQueryClient();

  const [side, setSide] = useState<Side>("HOME");
  const [tab, setTab] = useState<Tab>("MISSING");
  const [missingReasons, setMissingReasons] = useState<Map<string, string>>(
    () => new Map(),
  );
  const [missingModalOpen, setMissingModalOpen] = useState(false);
  const [missingModalPlayer, setMissingModalPlayer] =
    useState<PlayerOption | null>(null);
  const [missingModalReason, setMissingModalReason] =
    useState<MissingReasonType | null>(null);
  const [missingModalInjuryNote, setMissingModalInjuryNote] = useState("");

  const {
    data: lineups = [],
    isLoading,
    isFetching,
  } = useQuery<LineupItem[]>({
    queryKey: ["lineups", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}/lineups`);
      if (!res.ok) throw new Error("Failed to fetch lineups");
      return res.json();
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const { data: absences = [] } = useQuery<
    { playerId: number; type: MissingReasonType; note: string | null }[]
  >({
    queryKey: ["absences", matchId],
    queryFn: async () => {
      const res = await fetch(`/api/matches/${matchId}/absences`);
      if (!res.ok) throw new Error("Failed to fetch absences");
      return res.json();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (next: LineupItem[]) => {
      const items = next.map((i) => ({
        playerId: i.playerId,
        position: i.position,
        isStarting: i.isStarting,
      }));

      const res = await fetch(`/api/matches/${matchId}/lineups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      if (!res.ok) throw new Error("Failed to save lineup");
      // Server + socket will broadcast authoritative lineup; we don't
      // need the body here, but read it to avoid stream locking.
      try {
        await res.json();
      } catch {
        // ignore
      }
    },
    onMutate: async (next) => {
      await queryClient.cancelQueries({ queryKey: ["lineups", matchId] });
      const previous = queryClient.getQueryData<LineupItem[]>([
        "lineups",
        matchId,
      ]);
      queryClient.setQueryData(["lineups", matchId], next);
      return { previous };
    },
    onError: (_err, _next, ctx) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["lineups", matchId], ctx.previous);
      }
    },
  });

  const applyLineupChange = useCallback(
    (updater: (prev: LineupItem[]) => LineupItem[]) => {
      const current =
        queryClient.getQueryData<LineupItem[]>(["lineups", matchId]) ?? [];
      const next = updater(current);
      upsertMutation.mutate(next);
    },
    [matchId, queryClient, upsertMutation],
  );

  const currentPlayers = side === "HOME" ? homePlayers : awayPlayers;

  // Hydrate missingReasons from backend absences for the current side
  useMemo(() => {
    if (!absences || absences.length === 0) return;
    setMissingReasons((prev) => {
      const next = new Map(prev);
      for (const a of absences) {
        // We don't know side from API, so just store by playerId; both sides share IDs
        const keyHome = `HOME:${a.playerId}`;
        const keyAway = `AWAY:${a.playerId}`;
        const baseLabel =
          a.type === "red_card"
            ? "red card"
            : a.type === "five_yellow_cards"
              ? "5 yellow cards"
              : a.type === "injury"
                ? "injury"
                : "personal reasons";
        const full =
          a.type === "injury" && a.note ? `${baseLabel}: ${a.note}` : baseLabel;
        // Store for both sides so whichever team this player belongs to can read it
        next.set(keyHome, full);
        next.set(keyAway, full);
      }
      return next;
    });
  }, [absences]);

  const upsertAbsenceMutation = useMutation({
    mutationFn: async (payload: {
      playerId: number;
      type: MissingReasonType;
      note?: string;
    }) => {
      const res = await fetch(`/api/matches/${matchId}/absences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to save absence");
      return res.json();
    },
    onSuccess: () => {
      // Refresh absences so UI picks up latest reasons
      queryClient.invalidateQueries({ queryKey: ["absences", matchId] });
    },
  });

  const lineupMap = useMemo(() => {
    const map = new Map<number, LineupItem>();
    for (const item of lineups) {
      map.set(item.playerId, item);
    }
    return map;
  }, [lineups]);

  const starting: PlayerOption[] = [];
  const bench: PlayerOption[] = [];
  const missing: PlayerOption[] = [];

  currentPlayers.forEach((p) => {
    const li = lineupMap.get(p.id);
    if (!li) {
      missing.push(p);
    } else if (li.isStarting) {
      starting.push(p);
    } else {
      bench.push(p);
    }
  });

  const isBusy = isLoading || isFetching || upsertMutation.isPending;

  const handleAdd = (player: PlayerOption, isStarting: boolean) => {
    const position = player.position || "Unknown";
    applyLineupChange((prev) => {
      // If already present, just toggle starting flag
      const existing = prev.find((i) => i.playerId === player.id);
      if (existing) {
        return prev.map((i) =>
          i.playerId === player.id ? { ...i, isStarting } : i,
        );
      }
      const maxId = prev.reduce((m, i) => Math.max(m, i.id), 0);
      const next: LineupItem = {
        id: maxId + 1,
        matchId,
        playerId: player.id,
        position,
        isStarting,
      };
      return [...prev, next];
    });
  };

  const handleToggleStarting = (player: PlayerOption, isStarting: boolean) => {
    applyLineupChange((prev) =>
      prev.map((i) => (i.playerId === player.id ? { ...i, isStarting } : i)),
    );
  };

  const handleRemove = (player: PlayerOption) => {
    applyLineupChange((prev) => prev.filter((i) => i.playerId !== player.id));
  };

  const openMissingModal = (player: PlayerOption) => {
    setMissingModalPlayer(player);
    setMissingModalReason(null);
    setMissingModalInjuryNote("");
    setMissingModalOpen(true);
  };

  const applyMissingFromModal = () => {
    if (!missingModalPlayer || !missingModalReason) return;

    // For injury, require a note
    if (missingModalReason === "injury" && !missingModalInjuryNote.trim()) {
      return;
    }

    const baseLabel =
      missingModalReason === "red_card"
        ? "red card"
        : missingModalReason === "five_yellow_cards"
          ? "5 yellow cards"
          : missingModalReason === "injury"
            ? "injury"
            : "personal reasons";

    const fullReason =
      missingModalReason === "injury"
        ? `${baseLabel}: ${missingModalInjuryNote.trim()}`
        : baseLabel;

    // Remove from lineup (if present)
    handleRemove(missingModalPlayer);
    const key = `${side}:${missingModalPlayer.id}`;
    setMissingReasons((prev) => {
      const next = new Map(prev);
      next.set(key, fullReason);
      return next;
    });

    // Persist to backend
    upsertAbsenceMutation.mutate({
      playerId: missingModalPlayer.id,
      type: missingModalReason,
      note:
        missingModalReason === "injury"
          ? missingModalInjuryNote.trim()
          : undefined,
    });

    setMissingModalOpen(false);
    setMissingModalPlayer(null);
    setMissingModalReason(null);
    setMissingModalInjuryNote("");
  };

  const renderList = (
    players: PlayerOption[],
    type: "STARTING" | "BENCH" | "MISSING" | "PLAYERS",
  ) => {
    if (players.length === 0) {
      return (
        <div className="py-6 text-center text-xs text-[#92c9a4]">
          No players in{" "}
          {type === "STARTING" ? "Starting XI" : type.toLowerCase()}.
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        {players.map((p) => (
          <div
            key={p.id}
            className="group/player flex items-center justify-between rounded-lg border border-[#23482f] bg-[#23482f]/50 p-2 transition-colors hover:bg-[#23482f]"
          >
            <div className="flex items-center gap-3">
              <span className="text-primary border-primary/20 flex h-6 w-6 items-center justify-center rounded border bg-[#23482f] text-xs font-bold">
                {p.number ?? "?"}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">{p.name}</span>
                {p.position && (
                  <span className="text-[10px] font-bold tracking-wider text-[#92c9a4] uppercase">
                    {p.position}
                  </span>
                )}
                {type === "MISSING" &&
                  (() => {
                    const key = `${side}:${p.id}`;
                    const reason = missingReasons.get(key);
                    return (
                      reason && (
                        <span className="mt-0.5 text-[10px] font-semibold text-amber-300 uppercase">
                          Missing: {reason}
                        </span>
                      )
                    );
                  })()}
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/player:opacity-100">
              {type === "STARTING" && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleRemove(p)}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-red-400/10 hover:text-red-400 disabled:opacity-50"
                >
                  Remove from lineup
                </button>
              )}
              {type === "PLAYERS" && (
                <>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAdd(p, true)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Add to Starting XI
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAdd(p, false)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Add to bench
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => openMissingModal(p)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-amber-300 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Mark missing
                  </button>
                </>
              )}
              {type === "BENCH" && (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleStarting(p, true)}
                  className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  Move to Starting XI
                </button>
              )}
              {type === "MISSING" && (
                <>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAdd(p, true)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Add to Starting XI
                  </button>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => handleAdd(p, false)}
                    className="rounded-md px-2 py-1 text-[11px] font-semibold text-[#92c9a4] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
                  >
                    Add to bench
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const activeList =
    tab === "STARTING"
      ? starting
      : tab === "BENCH"
        ? bench
        : tab === "MISSING"
          ? missing
          : currentPlayers;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-[#326744]/30 p-4 pb-2">
        <h3 className="text-lg font-bold">Manage Lineups</h3>
        <div className="flex rounded-lg bg-[#23482f] p-1">
          <button
            type="button"
            onClick={() => setSide("HOME")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold shadow-sm ${
              side === "HOME"
                ? "bg-primary text-[#112217]"
                : "text-[#92c9a4] hover:text-white"
            }`}
          >
            {homeTeamName}
          </button>
          <button
            type="button"
            onClick={() => setSide("AWAY")}
            className={`rounded-md px-3 py-1.5 text-xs font-bold ${
              side === "AWAY"
                ? "bg-primary text-[#112217]"
                : "text-[#92c9a4] hover:text-white"
            }`}
          >
            {awayTeamName}
          </button>
        </div>
      </div>
      <div className="flex gap-6 border-b border-[#326744]/30 px-4 pt-2">
        <button
          type="button"
          onClick={() => setTab("STARTING")}
          className={`border-b-2 pb-2 text-sm font-bold ${
            tab === "STARTING"
              ? "border-primary text-primary"
              : "border-transparent text-[#92c9a4] hover:text-white"
          }`}
        >
          Starting XI
        </button>
        <button
          type="button"
          onClick={() => setTab("BENCH")}
          className={`border-b-2 pb-2 text-sm font-bold ${
            tab === "BENCH"
              ? "border-primary text-primary"
              : "border-transparent text-[#92c9a4] hover:text-white"
          }`}
        >
          Bench
        </button>
        <button
          type="button"
          onClick={() => setTab("MISSING")}
          className={`border-b-2 pb-2 text-sm font-bold ${
            tab === "MISSING"
              ? "border-primary text-primary"
              : "border-transparent text-[#92c9a4] hover:text-white"
          }`}
        >
          Missing
        </button>
        <button
          type="button"
          onClick={() => setTab("PLAYERS")}
          className={`border-b-2 pb-2 text-sm font-bold ${
            tab === "PLAYERS"
              ? "border-primary text-primary"
              : "border-transparent text-[#92c9a4] hover:text-white"
          }`}
        >
          Players
        </button>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {isLoading ? (
          <div className="py-6 text-center text-xs text-[#92c9a4]">
            Loading lineup...
          </div>
        ) : (
          renderList(activeList, tab)
        )}
      </div>
      {missingModalOpen && missingModalPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg bg-[#102118] p-4 shadow-xl">
            <h4 className="mb-3 text-sm font-bold text-white">
              Mark {missingModalPlayer.name} as missing
            </h4>
            <p className="mb-3 text-[11px] text-[#92c9a4]">
              Select the reason why this player is not in the matchday squad.
            </p>
            <div className="mb-3 flex flex-col gap-2 text-[11px] text-white">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3 w-3"
                  checked={missingModalReason === "red_card"}
                  onChange={() => setMissingModalReason("red_card")}
                />
                <span>Red card suspension</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3 w-3"
                  checked={missingModalReason === "five_yellow_cards"}
                  onChange={() => setMissingModalReason("five_yellow_cards")}
                />
                <span>5 yellow cards suspension</span>
              </label>
              <label className="flex flex-col gap-1">
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    className="h-3 w-3"
                    checked={missingModalReason === "injury"}
                    onChange={() => setMissingModalReason("injury")}
                  />
                  <span>Injury (specify)</span>
                </span>
                <textarea
                  className="focus:border-primary mt-1 h-16 w-full rounded-md border border-[#23482f] bg-[#102118] p-2 text-[11px] text-white outline-none"
                  placeholder="Describe the injury (required)"
                  value={missingModalInjuryNote}
                  onChange={(e) => setMissingModalInjuryNote(e.target.value)}
                  disabled={missingModalReason !== "injury"}
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  className="h-3 w-3"
                  checked={missingModalReason === "personal"}
                  onChange={() => setMissingModalReason("personal")}
                />
                <span>Personal reasons</span>
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-md px-3 py-1 text-[11px] font-semibold text-[#92c9a4] hover:bg-white/5"
                onClick={() => {
                  setMissingModalOpen(false);
                  setMissingModalPlayer(null);
                  setMissingModalReason(null);
                  setMissingModalInjuryNote("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bg-primary rounded-md px-3 py-1 text-[11px] font-semibold text-[#102118] disabled:opacity-50"
                onClick={applyMissingFromModal}
                disabled={
                  !missingModalReason ||
                  (missingModalReason === "injury" &&
                    !missingModalInjuryNote.trim())
                }
              >
                Confirm missing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineupReport;
