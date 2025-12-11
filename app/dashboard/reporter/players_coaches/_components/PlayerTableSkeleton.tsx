import React from "react";

interface PlayerTableSkeletonProps {
  rows?: number;
}

const PlayerTableSkeleton = ({ rows = 5 }: PlayerTableSkeletonProps) => {
  return (
    <div className="border-gray-2 mt-6 rounded-xl border">
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-32 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100">
        <table className="w-full table-fixed">
          <thead className="bg-white">
            <tr className="text-left text-sm text-gray-600">
              {Array.from({ length: 5 }).map((_, idx) => (
                <th key={idx} className="px-6 py-4">
                  <div className="h-3 w-24 animate-pulse rounded bg-gray-100" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, idx) => (
              <tr
                key={idx}
                className="border-b border-gray-100 odd:bg-white even:bg-white"
              >
                {Array.from({ length: 5 }).map((__, cellIdx) => (
                  <td key={cellIdx} className="px-6 py-5">
                    <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerTableSkeleton;
