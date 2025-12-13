"use client";

import React, { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import MatchReportHeader from "./_components/MatchReportHeader";
import MatchRecordEvents from "./_components/MatchRecordEvents";
import MatchVenue from "./_components/MatchVenue";
import LiveTimelineSection, {
  RecordedEvent,
} from "./_components/LiveTimelineSection";
import { useMatchStatusSocket } from "@/app/hooks/useMatchStatusSocket";
import { useMatchClockControls } from "@/app/hooks/useMatchClockControls";

// Fetch a single match by ID (includes phase/clock fields)
const fetchMatch = async (id: number) => {
  const res = await fetch(`/api/matches/${id}`);
  if (!res.ok) throw new Error("Failed to fetch match");
  return res.json();
};

export default function MatchControlPage() {
  const params = useParams();
  const matchId = Number(params.matchId);

  // We should ideally have a specific GET /api/matches/[id] endpoint.
  // For now, I'll assume we can get it from the list or I'll quickly fix the fetcher if needed.
  // Wait, params.matchId is the ID of the MATCH table, right?
  // The route is matches/[matchId].

  // Let's create a useMatch hook or just useQuery here.
  const { data: match, isLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => fetchMatch(matchId),
    enabled: !!matchId,
  });

  // Enable socket for this match (although the socket hook listens to ALL matches for reporter)
  // We can just rely on the global one if we pass reporterId.
  // But wait, useMatchStatusSocket requires reporterId.
  // We can get reporterId from session or from the match object once loaded.
  useMatchStatusSocket(match?.reporterId);

  const rawControls = useMatchClockControls(matchId);
  const controls = {
    startMatch: rawControls.startFirstHalf,
    endFirstHalf: rawControls.endFirstHalf,
    startSecondHalf: rawControls.startSecondHalf,
    endMatch: rawControls.endMatch,
    addExtraTime: rawControls.addExtraTime,
    isLoading: rawControls.isLoading,
  };

  if (isLoading)
    return <div className="p-10 text-center">Loading match...</div>;
  if (!match) return <div className="p-10 text-center">Match not found</div>;

  const [events, setEvents] = useState<RecordedEvent[]>([]);

  const handleAddEvent = useCallback((event: Omit<RecordedEvent, "id">) => {
    setEvents((prev) => {
      const nextId = prev.length > 0 ? prev[prev.length - 1].id + 1 : 1;
      return [...prev, { id: nextId, ...event }];
    });
  }, []);

  return (
    <div className="bg-whitish min-h-screen w-full p-6">
      <MatchReportHeader match={match} controls={controls} />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <MatchRecordEvents
          onAddEvent={handleAddEvent}
          homeTeamName={match.fixture.homeTeam.name}
          awayTeamName={match.fixture.awayTeam.name}
        />
        <MatchVenue />
      </div>
      <LiveTimelineSection
        events={events}
        homeTeamName={match.fixture.homeTeam.name}
        awayTeamName={match.fixture.awayTeam.name}
      />
    </div>
  );
}
