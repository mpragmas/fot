"use client";

import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface MatchVenueProps {
  matchId: number;
  fixtureId: number;
  referee: string;
  stadium: string;
}

const MatchVenue = ({
  matchId,
  fixtureId,
  referee,
  stadium,
}: MatchVenueProps) => {
  const queryClient = useQueryClient();
  const [refereeValue, setRefereeValue] = useState(referee);
  const [stadiumValue, setStadiumValue] = useState(stadium);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body: any = { referee: refereeValue, stadium: stadiumValue };
      const res = await fetch(`/api/fixtures/${fixtureId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update venue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match", matchId] });
    },
  });

  const isSaving = saveMutation.isPending;

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">Officials & Venue</h2>

      <div className="mb-4">
        <label className="mb-1 block text-sm text-gray-600">Referee</label>
        <input
          type="text"
          placeholder="Names"
          value={refereeValue}
          onChange={(e) => setRefereeValue(e.target.value)}
          className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-sm text-gray-600">Stadium</label>
        <input
          type="text"
          value={stadiumValue}
          onChange={(e) => setStadiumValue(e.target.value)}
          className="border-gray-2 w-full rounded-md border p-2 outline-none focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          disabled={isSaving}
          onClick={() => saveMutation.mutate()}
          className="bg-blue-2 w-full rounded-md px-4 py-2 text-white outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
        <button className="w-full rounded-md bg-gray-200 px-4 py-2 outline-none focus:outline-none">
          Submit Report
        </button>
      </div>
    </div>
  );
};

export default MatchVenue;
