import React from "react";

type MatchFixtureProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  leftLabel?: string;
  rightLabel?: string;
  centerLabel?: string;
  showDivider?: boolean;
};

const MatchFixture = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  leftLabel,
  rightLabel,
  centerLabel,
  showDivider = true,
}: MatchFixtureProps) => {
  return (
    <div
      className={`dark:border-dark-2 mx-auto flex justify-between p-4 ${showDivider ? "border-b-1" : ""}`}
    >
      <p>{leftLabel ?? ""}</p>
      <div className="flex items-center gap-3">
        <div className="flex items-center space-x-2">
          <p className="text-sm">{homeTeam}</p>
          <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
        </div>
        <p className="text-dark-3 self-center text-center text-sm font-semibold whitespace-pre-line">
          {centerLabel ??
            (typeof homeScore === "number" ? homeScore : "-") +
              " - " +
              (typeof awayScore === "number" ? awayScore : "-")}
        </p>
        <div className="flex items-center space-x-2">
          <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
          <p className="text-sm">{awayTeam}</p>
        </div>
      </div>
      <p>{rightLabel ?? ""}</p>
    </div>
  );
};

export default MatchFixture;
