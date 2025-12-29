"use client";

import React, { useEffect, useMemo, useState } from "react";
import Filter from "./Filter";
import { useFixtures } from "@/app/hooks/useFixtures";

const Live = () => {
  const { fixtures, isLoading, isError } = useFixtures();

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    // default to today; will be overridden from URL if date param exists
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ONGOING">("ALL");
  const [search, setSearch] = useState("");
  const [nowTs, setNowTs] = useState<number>(() => Date.now());

  const formatDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // On mount, read ?date=YYYY-MM-DD from URL (if present) so reload keeps the same day
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("date");
    if (!raw) return;
    const parsed = new Date(`${raw}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    setCurrentDate(parsed);
  }, []);

  // Keep URL in sync with currentDate AFTER render to avoid Router update during render
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const key = formatDateKey(currentDate);
    if (params.get("date") === key) return;
    params.set("date", key);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  }, [currentDate]);

  const formatKickoffTime = useMemo(
    () => (dateString: string) => {
      const d = new Date(dateString);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      if (hours === 0) hours = 12;
      const hh = hours.toString().padStart(2, "0");
      const mm = minutes.toString().padStart(2, "0");
      return { timeLine: `${hh}:${mm}`, ampm };
    },
    [],
  );

  const getStatusLabel = useMemo(
    () => (fixture: (typeof fixtures)[number]) => {
      if (fixture.status === "UPCOMING") return "";
      if (fixture.status === "COMPLETED") return "FT";
      if (fixture.status === "LIVE") {
        if (fixture.phase === "HT") return "HT";
        let seconds = fixture.elapsedSeconds ?? 0;
        if (
          fixture.clockStartedAt &&
          fixture.phase &&
          ["FIRST_HALF", "SECOND_HALF", "ET"].includes(fixture.phase)
        ) {
          const started = new Date(fixture.clockStartedAt).getTime();
          const extra = Math.max(0, Math.floor((nowTs - started) / 1000));
          seconds += extra;
        }
        const minutes = Math.max(0, Math.floor(seconds / 60));
        return `${minutes}'`;
      }
      return "";
    },
    [fixtures, nowTs],
  );

  // Lightweight ticking: only run timer when there is at least one LIVE fixture
  useEffect(() => {
    const hasLive = fixtures.some((f) => f.status === "LIVE");
    if (!hasLive) return;
    const id = window.setInterval(() => {
      setNowTs(Date.now());
    }, 15000); // 15s step for performance; still keeps minutes fresh
    return () => window.clearInterval(id);
  }, [fixtures]);

  const handlePrevDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 1);
      return d;
    });
  };

  const handleNextDate = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 1);
      return d;
    });
  };

  const filteredByDateAndFilters = useMemo(() => {
    const targetY = currentDate.getFullYear();
    const targetM = currentDate.getMonth();
    const targetD = currentDate.getDate();

    return fixtures.filter((fixture) => {
      const d = new Date(fixture.date);
      if (
        d.getFullYear() !== targetY ||
        d.getMonth() !== targetM ||
        d.getDate() !== targetD
      ) {
        return false;
      }

      if (statusFilter === "ONGOING" && fixture.status !== "LIVE") {
        return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const home = fixture.homeTeamName.toLowerCase();
        const away = fixture.awayTeamName.toLowerCase();
        if (!home.includes(q) && !away.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [fixtures, currentDate, statusFilter, search]);

  const fixturesByLeague = useMemo(() => {
    const map = new Map<
      number,
      {
        leagueName: string;
        leagueCountry: string;
        fixtures: typeof filteredByDateAndFilters;
      }
    >();

    for (const f of filteredByDateAndFilters) {
      const existing = map.get(f.leagueId);
      if (!existing) {
        map.set(f.leagueId, {
          leagueName: f.leagueName,
          leagueCountry: f.leagueCountry,
          fixtures: [f],
        });
      } else {
        existing.fixtures.push(f);
      }
    }

    return Array.from(map.entries()).map(([leagueId, group]) => ({
      leagueId,
      ...group,
    }));
  }, [filteredByDateAndFilters]);

  return (
    <div className="w-[54%] space-y-3">
      <Filter
        date={currentDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onDateChange={setCurrentDate}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        search={search}
        onSearchChange={setSearch}
      />

      {isLoading && (
        <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl p-4 text-sm">
          Loading live fixtures...
        </div>
      )}

      {isError && !isLoading && (
        <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl p-4 text-sm">
          Failed to load fixtures.
        </div>
      )}

      {!isLoading && fixturesByLeague.length === 0 && !isError && (
        <div className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl p-4 text-sm">
          No fixtures for this date.
        </div>
      )}

      {fixturesByLeague.map((group) => {
        return (
          <div
            key={group.leagueId}
            className="text-dark bg:text-whitish dark:bg-dark-1 dark:text-whitish w-full rounded-2xl"
          >
            <div className="dark:bg-dark-2 flex items-center gap-2 p-4">
              <p className="bg-dark-4 inline rounded-full px-4 py-4"></p>
              <p>
                {group.leagueCountry} - {group.leagueName}
              </p>
            </div>

            {group.fixtures.map((fixture, index) => {
              const isLast = index === group.fixtures.length - 1;

              const statusLabel = getStatusLabel(fixture);

              return (
                <div
                  key={fixture.id}
                  className={`flex items-center justify-between p-4 ${
                    isLast ? "" : "border-dark-4 border-b-1"
                  }`}
                >
                  <p className="bg-dark-4 rounded-full px-2 py-2 text-center text-xs font-semibold">
                    {/* this the plave for minutes if match is live  and stauts if its ended FT, and nothing visible if its upcoming */}
                    {statusLabel}
                  </p>
                  <div className="flex gap-3">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm">{fixture.homeTeamName}</p>
                      <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
                    </div>
                    <div className="self-center text-center text-xs whitespace-pre-line">
                      {fixture.status === "UPCOMING"
                        ? (() => {
                            const { timeLine, ampm } = formatKickoffTime(
                              fixture.date,
                            );
                            return `${timeLine}\n${ampm}`;
                          })()
                        : `${fixture.homeScore ?? 0} - ${fixture.awayScore ?? 0}`}
                      {/* this the place for time of upcoming match like it was before and score of match is live or ended */}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-dark-4 inline rounded-full px-4 py-4"></span>
                      <p className="text-sm">{fixture.awayTeamName}</p>
                    </div>
                  </div>
                  <p className="text-xs tracking-wide uppercase"></p>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Live;
