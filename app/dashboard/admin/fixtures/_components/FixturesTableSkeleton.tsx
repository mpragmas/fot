"use client";

import React from "react";

interface FixturesTableSkeletonProps {
  rows?: number;
}

const FixturesTableSkeleton = ({ rows = 5 }: FixturesTableSkeletonProps) => {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-3">
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
      </div>
      <div className="border-t border-gray-100">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-xs font-semibold text-gray-600">
              {Array.from({ length: 6 }).map((_, idx) => (
                <th key={idx} className="px-6 py-3">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr
                key={rowIdx}
                className="border-b border-gray-100 odd:bg-white even:bg-white"
              >
                {Array.from({ length: 6 }).map((__, cellIdx) => (
                  <td key={cellIdx} className="px-6 py-4">
                    <div className="h-4 w-full max-w-[160px] animate-pulse rounded bg-gray-100" />
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

export default FixturesTableSkeleton;
