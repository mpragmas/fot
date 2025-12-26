"use client";

import React, { useMemo } from "react";
import { FaSortDown } from "react-icons/fa";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const LeagueHeader = ({
  leagueName,
  leagueCountry,
  seasons,
}: {
  leagueName: string;
  leagueCountry: string;
  seasons: { id: number; year: string }[];
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedSeasonId = useMemo(() => {
    const raw = searchParams.get("seasonId");
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed)) return parsed;
    return seasons[0]?.id;
  }, [searchParams, seasons]);

  return (
    <div className="flex justify-between">
      <div className="flex gap-5">
        <Image src="/images/logo.png" alt="logo" width={50} height={50} />

        <div>
          <h1 className="text-2xl font-bold">{leagueName}</h1>
          <p className="dark:text-dark-3 text-base">{leagueCountry}</p>
        </div>
      </div>
      <div className="relative inline-block">
        <select
          className="dark:bg-dark-4 w-full appearance-none rounded-xl px-3 py-1 pr-7 focus:outline-none"
          value={selectedSeasonId ?? ""}
          onChange={(e) => {
            const next = e.target.value;
            const params = new URLSearchParams(searchParams.toString());
            if (!next) params.delete("seasonId");
            else params.set("seasonId", next);
            const qs = params.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
          }}
          disabled={seasons.length === 0}
        >
          {seasons.map((s) => (
            <option key={s.id} value={s.id}>
              {s.year}
            </option>
          ))}
        </select>

        <div className="pointer-events-none absolute inset-y-0 -top-8 right-0 flex items-center pr-2">
          <FaSortDown className="h-4 w-4 text-gray-500" />
        </div>
      </div>
    </div>
  );
};

export default LeagueHeader;
