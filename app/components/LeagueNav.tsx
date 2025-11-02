"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const status = [
  { name: "Overview", href: "overview" },
  { name: "Table", href: "table" },
  { name: "Matches", href: "matches" },
  { name: "Stats", href: "stats" },
  { name: "Transfers", href: "transfers" },
  { name: "News", href: "news" },
];

const LeagueNav = () => {
  const pathname = usePathname();

  return (
    <div className="dark:text-dark-3 mt-10 flex items-center gap-10 text-sm font-bold">
      {status.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className={`dark:hover:text-dark-4 pb-2 ${
            pathname === "/" ? "border-green border-b-3" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default LeagueNav;
