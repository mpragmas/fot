"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeagueNav = ({
  params,
  status,
}: {
  params: { id: string };
  status: { name: string; href: string }[];
}) => {
  const pathname = usePathname();

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
