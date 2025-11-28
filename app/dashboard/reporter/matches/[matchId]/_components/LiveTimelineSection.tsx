import React from "react";
import { FiEdit2 } from "react-icons/fi";
import { MdDeleteOutline, MdSportsSoccer } from "react-icons/md";
import MatchTotalStats from "./MatchTotalStats";

// --- Types ---
type MatchStatType =
  | "GOAL"
  | "ASSIST"
  | "YELLOW_CARD"
  | "RED_CARD"
  | "SUBSTITUTION";
type MatchTeam = "HOME" | "AWAY";

interface MatchStat {
  id: number;
  playerId: number;
  matchId: number;
  type: MatchStatType;
  minute: number;
  team: MatchTeam;
  player: { id: number; name: string };
}

// Sample Data
const dummyMatchStats: MatchStat[] = [
  {
    id: 1,
    matchId: 20220528,
    playerId: 20,
    type: "GOAL",
    minute: 59,
    team: "AWAY",
    player: { id: 20, name: "Vincius Junior" },
  },
  {
    id: 2,
    matchId: 20220528,
    playerId: 15,
    type: "ASSIST",
    minute: 59,
    team: "AWAY",
    player: { id: 15, name: "Federico Valverde" },
  },
  {
    id: 3,
    matchId: 20220528,
    playerId: 3,
    type: "YELLOW_CARD",
    minute: 62,
    team: "HOME",
    player: { id: 3, name: "Fabinho" },
  },
  {
    id: 4,
    matchId: 20220528,
    playerId: 4,
    type: "RED_CARD",
    minute: 75,
    team: "HOME",
    player: { id: 4, name: "Virgil van Dijk" },
  },
  {
    id: 5,
    matchId: 20220528,
    playerId: 9,
    type: "SUBSTITUTION",
    minute: 80,
    team: "HOME",
    player: { id: 9, name: "Roberto Firmino" },
  },
];

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
    // substitution
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

              {/* ACTIONS beside the player */}
              <div className="space-x-1">
                <button className="text-blue-400 hover:text-blue-600">
                  <FiEdit2 className="h-4 w-4" />
                </button>
                <button className="text-red-400 hover:text-red-600">
                  <MdDeleteOutline className="h-5 w-5" />
                </button>
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
              {/* ACTIONS beside player */}
              <div className="space-x-1">
                <button className="text-red-400 hover:text-red-600">
                  <MdDeleteOutline className="h-5 w-5" />
                </button>
                <button className="text-blue-400 hover:text-blue-600">
                  <FiEdit2 className="h-4 w-4" />
                </button>
              </div>
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

// --- Format Match Stat ---
const toTimelineProps = (stat: MatchStat): TimelineItemProps => ({
  side: stat.team === "HOME" ? "right" : "left",
  type:
    stat.type === "GOAL" || stat.type === "ASSIST"
      ? "goal"
      : stat.type === "YELLOW_CARD"
        ? "yellowCard"
        : stat.type === "RED_CARD"
          ? "redCard"
          : "substitution",
  title:
    stat.type === "GOAL"
      ? `Goal by ${stat.player.name}`
      : stat.type === "ASSIST"
        ? `Assist by ${stat.player.name}`
        : stat.type === "YELLOW_CARD"
          ? `Yellow card for ${stat.player.name}`
          : stat.type === "RED_CARD"
            ? `Red card for ${stat.player.name}`
            : `Substitution: ${stat.player.name}`,
  subtitle: `${stat.minute}' ${
    stat.team === "HOME" ? "Liverpool" : "Real Madrid"
  }`,
});

// --- Main Component ---
export default function LiveTimelineSection() {
  return (
    <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
      {/* TIMELINE */}
      <div className="relative w-full rounded-2xl bg-white p-6 shadow md:p-8 lg:w-2/3">
        <h2 className="mb-10 text-xl font-bold">Live Timeline</h2>

        <div className="relative">
          {/* Vertical center line */}
          <div className="bg-gray-2 absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />

          {dummyMatchStats.map((s) => (
            <TimelineItem key={s.id} {...toTimelineProps(s)} />
          ))}

          {/* HT divider: mask the vertical line and split the horizontal line into two segments with a gap */}
          <div className="relative z-10 bg-white py-4">
            {/* White mask over the vertical line in this band */}
            <div className="pointer-events-none absolute top-0 bottom-0 left-1/2 w-6 -translate-x-1/2 bg-white" />

            {/* Two separate horizontal segments with a visible gap in the middle */}
            <div className="relative flex items-center justify-between gap-4">
              <div className="bg-gray-2 h-px flex-1" />
              <div className="w-8" />
              <div className="bg-gray-2 h-px flex-1" />
            </div>
          </div>

          {dummyMatchStats.map((s) => (
            <TimelineItem key={`${s.id}-dup`} {...toTimelineProps(s)} />
          ))}
        </div>
      </div>

      {/* STATS */}
      <MatchTotalStats />
    </div>
  );
}
