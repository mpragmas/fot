"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LeagueNav = ({
  status,
}: {
  status: { name: string; href: string }[];
}) => {
  const pathname = usePathname();

  const activeHref = React.useMemo(() => {
    const matches = status.filter(
      (s) => pathname === s.href || pathname.startsWith(`${s.href}/`),
    );
    matches.sort((a, b) => b.href.length - a.href.length);
    return matches[0]?.href;
  }, [pathname, status]);

  return (
    <div className="dark:text-dark-3 mt-10 flex items-center gap-10 text-sm font-bold">
      {status.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className={`dark:hover:text-dark-4 pb-2 ${
            activeHref === item.href ? "border-green border-b-3" : ""
          }`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default LeagueNav;
