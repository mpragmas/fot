import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline, MdSportsSoccer } from "react-icons/md";
import MatchTotalStats from "./MatchTotalStats";

// --- Shared recorded event types (used by RecordEvents + Timeline) ---
export type RecordedEventType =
  | "GOAL"
  | "OWN_GOAL"
  | "ASSIST"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION";

export type RecordedEventTeam = "HOME" | "AWAY";

export interface RecordedEvent {
  id: number;
  type: RecordedEventType;
  minute: number;
  team: RecordedEventTeam;
  playerId: number;
  playerName?: string;
}

// --- Timeline Item Component ---
type TimelineSide = "left" | "right";
type TimelineType = "goal" | "yellowCard" | "redCard" | "substitution";

interface TimelineItemProps {
  side: TimelineSide;
  type: TimelineType;
  title: string;
  subtitle: string;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  side,
  type,
  title,
  subtitle,
}) => {
  let Icon: React.ComponentType<{ className?: string }>;
  let iconBg: string;
  let iconColor = "";

  if (type === "goal") {
    Icon = MdSportsSoccer;
    iconBg = "bg-green-100";
    iconColor = "text-green-500";
  } else if (type === "yellowCard") {
    Icon = ({ className }) => (
      <div className={`h-4 w-3 rounded-sm bg-yellow-400 ${className ?? ""}`} />
    );
    iconBg = "bg-yellow-100";
  } else if (type === "redCard") {
    Icon = ({ className }) => (
      <div className={`h-4 w-3 rounded-sm bg-red-500 ${className ?? ""}`} />
    );
    iconBg = "bg-red-100";
  } else {
    Icon = ({ className }) => (
      <div
        className={`flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white ${className ?? ""}`}
      >
        S
      </div>
    );
    iconBg = "bg-blue-100";
  }

  return (
    <div
      className={`relative mb-8 flex w-full ${side === "left" ? "justify-end" : "justify-start"}`}
    >
      <div className="flex w-1/2 items-center gap-4">
        {/* LEFT SIDE EVENTS */}
        {side === "left" && (
          <div className="flex w-full flex-col items-end text-right">
            <div className="flex items-center gap-5">
              <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-gray-1 text-sm">{subtitle}</p>
              </div>
            </div>
          </div>
        )}

        {/* Center Icon (white outer circle so the line does not touch the colored icon) */}
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${iconBg}`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>

        {/* RIGHT SIDE EVENTS */}
        {side === "right" && (
          <div className="flex w-full flex-col items-start">
            <div className="flex items-center gap-5">
              <div>
                <h4 className="font-bold text-gray-800">{title}</h4>
                <p className="text-sm text-gray-400">{subtitle}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function formatMinute(minute: number) {
  if (!Number.isFinite(minute) || minute < 0) return "0'";
  return `${minute}'`;
}

function sortKey(event: RecordedEvent) {
  const base = Number.isFinite(event.minute) ? event.minute : 0;
  return base * 100;
}

// --- Format Recorded Event into Timeline props ---
const toTimelineProps = (
  event: RecordedEvent,
  homeTeamName: string,
  awayTeamName: string,
): TimelineItemProps => {
  const teamName = event.team === "HOME" ? homeTeamName : awayTeamName;

  const type: TimelineType =
    event.type === "GOAL" ||
    event.type === "OWN_GOAL" ||
    event.type === "ASSIST"
      ? "goal"
      : event.type === "YELLOW_CARD"
        ? "yellowCard"
        : event.type === "RED_CARD"
          ? "redCard"
          : "substitution";

  const title =
    event.type === "GOAL"
      ? `Goal by ${event.playerName ?? "Unknown"}`
      : event.type === "OWN_GOAL"
        ? `Own goal by ${event.playerName ?? "Unknown"}`
        : event.type === "ASSIST"
          ? `Assist by ${event.playerName ?? "Unknown"}`
          : event.type === "YELLOW_CARD"
            ? `Yellow card for ${event.playerName ?? "Unknown"}`
            : event.type === "RED_CARD"
              ? `Red card for ${event.playerName ?? "Unknown"}`
              : `Substitution: ${event.playerName ?? "Unknown"}`;

  const subtitleParts = [`${formatMinute(event.minute)} ${teamName}`].filter(
    Boolean,
  ) as string[];

  return {
    side: event.team === "HOME" ? "right" : "left",
    type,
    title,
    subtitle: subtitleParts.join(" • "),
  };
};

interface LiveTimelineSectionProps {
  events: RecordedEvent[];
  counters: {
    homeShotsOnTarget: number;
    awayShotsOnTarget: number;
    homeCorners: number;
    awayCorners: number;
  };
  homeTeamName: string;
  awayTeamName: string;
  homePlayers: { id: number; name: string }[];
  awayPlayers: { id: number; name: string }[];
  onDeleteEvent: (statId: number) => void;
  onEditEvent: (payload: {
    statId: number;
    playerId: number;
    type: RecordedEventType;
    minute: number;
  }) => void;
}

// --- Main Component ---
export default function LiveTimelineSection({
  events,
  counters,
  homeTeamName,
  awayTeamName,
  homePlayers,
  awayPlayers,
  onDeleteEvent,
  onEditEvent,
}: LiveTimelineSectionProps) {
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [editMinute, setEditMinute] = React.useState<string>("0");
  const [editPlayerId, setEditPlayerId] = React.useState<string>("");
  const [editType, setEditType] = React.useState<RecordedEventType>("GOAL");

  const allPlayers = React.useMemo(
    () => [...homePlayers, ...awayPlayers],
    [homePlayers, awayPlayers],
  );

  const startEdit = React.useCallback(
    (e: RecordedEvent) => {
      setEditingId(e.id);
      setEditMinute(String(e.minute));
      setEditPlayerId(String(e.playerId));
      setEditType(e.type);
    },
    [setEditingId],
  );

  const cancelEdit = React.useCallback(() => {
    setEditingId(null);
  }, []);

  const saveEdit = React.useCallback(() => {
    if (editingId == null) return;
    const minute = Number(editMinute);
    const playerId = Number(editPlayerId);
    if (!Number.isFinite(minute) || minute < 0) return;
    if (!Number.isFinite(playerId) || playerId < 1) return;
    onEditEvent({
      statId: editingId,
      minute: Math.floor(minute),
      playerId,
      type: editType,
    });
    setEditingId(null);
  }, [editingId, editMinute, editPlayerId, editType, onEditEvent]);

  const sortedEvents = React.useMemo(() => {
    if (!events || events.length === 0) return [];
    const copy = [...events];
    copy.sort((a, b) => {
      const d = sortKey(a) - sortKey(b);
      return d !== 0 ? d : a.id - b.id;
    });
    return copy;
  }, [events]);

  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* TIMELINE */}
      <div className="relative w-full rounded-2xl bg-white p-6 shadow md:p-8 lg:w-2/3">
        <h2 className="mb-10 text-xl font-bold">Live Timeline</h2>

        <div className="relative">
          {/* Vertical center line */}
          <div className="bg-gray-2 absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />

          {sortedEvents.map((event, index) => (
            <div key={`${event.id}-${index}`}>
              {editingId === event.id ? (
                <div className="mb-8 rounded-lg border border-gray-200 p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Type
                      </label>
                      <select
                        className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                        value={editType}
                        onChange={(ev) =>
                          setEditType(ev.target.value as RecordedEventType)
                        }
                      >
                        <option value="GOAL">Goal</option>
                        <option value="OWN_GOAL">Own goal</option>
                        <option value="ASSIST">Assist</option>
                        <option value="YELLOW_CARD">Yellow card</option>
                        <option value="RED_CARD">Red card</option>
                        <option value="SUBSTITUTION">Substitution</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Player
                      </label>
                      <select
                        className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                        value={editPlayerId}
                        onChange={(ev) => setEditPlayerId(ev.target.value)}
                      >
                        {allPlayers.map((p) => (
                          <option key={p.id} value={String(p.id)}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm text-gray-600">
                        Minute
                      </label>
                      <input
                        className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
                        inputMode="numeric"
                        value={editMinute}
                        onChange={(ev) => setEditMinute(ev.target.value)}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        className="bg-blue-2 rounded-md px-4 py-2 text-white outline-none focus:outline-none"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="rounded-md border border-gray-200 px-4 py-2 outline-none focus:outline-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <TimelineItem
                    {...toTimelineProps(event, homeTeamName, awayTeamName)}
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(event)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <FiEdit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <MdDeleteOutline className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <MatchTotalStats
        counters={counters}
        homeTeamName={homeTeamName}
        awayTeamName={awayTeamName}
      />
    </div>
  );
}
