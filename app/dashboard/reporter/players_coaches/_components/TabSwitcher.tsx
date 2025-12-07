"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

const tabs = ["Teams", "Players", "Coaches"] as const;

export default function TabSwitcher() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("tab") ||
    "Teams") as (typeof tabs)[number];

  const handleTabChange = (tab: (typeof tabs)[number]) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-gray-2 mt-5 inline-flex gap-1 rounded-xl p-1">
      {tabs.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => handleTabChange(t)}
          className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors outline-none focus:outline-none ${
            activeTab === t
              ? "bg-gray-3 text-gray-900"
              : "text-gray-1 hover:text-gray-700"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
