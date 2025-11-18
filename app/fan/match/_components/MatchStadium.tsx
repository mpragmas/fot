import React from "react";

const IconPin = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-300">
    <path
      fill="currentColor"
      d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
    />
  </svg>
);

type Props = {
  name?: string;
  location?: string;
  capacity?: number;
  attendance?: number;
};

const formatNum = (n: number) => n.toLocaleString();

const MatchStadium: React.FC<Props> = ({
  name = "Jan Breydelstadion",
  location = "Brugge, Belgium",
  capacity = 29062,
  attendance = 27037,
}) => {
  const percent = Math.round((attendance / capacity) * 100);

  return (
    <div className="w-full max-w-sm rounded-2xl bg-[#1a1a1a] p-5 text-gray-200 shadow-lg">
      <div className="mb-2 flex items-center gap-2">
        <IconPin />
        <div>
          <div className="text-base font-semibold">{name}</div>
          <div className="text-xs text-gray-400">{location}</div>
        </div>
      </div>

      <div className="dark:bg-dark-2 my-3 h-px w-full" />

      <div className="flex items-center gap-2 py-2 text-sm">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Capacity</span>
            <span className="font-medium">{formatNum(capacity)}</span>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-gray-300">Attendance</span>
            <span className="font-medium">{formatNum(attendance)}</span>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="dark:bg-dark-2 relative h-1.5 w-full rounded-full">
              <div
                className="h-1.5 rounded-full bg-green-600"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="flex h-6 items-center rounded-full bg-green-600 px-2 text-xs font-semibold">
              {percent}%
            </div>
          </div>
        </div>
      </div>

      <div className="dark:bg-dark-2 my-3 h-px w-full" />
    </div>
  );
};

export default MatchStadium;
