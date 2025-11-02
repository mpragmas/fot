"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeagueNav = ({ params }: { params: { id: string } }) => {
  const pathname = usePathname();

  const status = [
    { name: "Overview", href: `/league/${params.id}` },
    { name: "Table", href: `/league/${params.id}/table` },
    { name: "Matches", href: `/league/${params.id}/matches` },
    { name: "Stats", href: `/league/${params.id}/stats` },
    { name: "Transfers", href: `/league/${params.id}/transfers` },
    { name: "News", href: `/league/${params.id}/news` },
  ];

  return (
    <div className="dark:text-dark-3 mt-10 flex items-center gap-10 text-sm font-bold">
      {status.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className={`dark:hover:text-dark-4 pb-2 ${
            pathname === item.href ? "border-green border-b-3" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default LeagueNav;
