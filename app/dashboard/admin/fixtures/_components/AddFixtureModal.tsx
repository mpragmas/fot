"use client";

import React, { FormEvent, useState } from "react";
import BaseModal from "@/app/components/BaseModal";
import { useLeagues } from "@/app/hooks/useLeagues";
import { useTeams } from "@/app/hooks/useTeams";
import { useSeasons } from "@/app/hooks/useSeasons";
import { useCreateFixture } from "@/app/hooks/useFixtures";

interface AddFixtureModalProps {
  open: boolean;
  onClose: () => void;
}

const AddFixtureModal = ({ open, onClose }: AddFixtureModalProps) => {
  const { leagues } = useLeagues();
  const [leagueId, setLeagueId] = useState<number | "">("");
  const { seasons } = useSeasons(
    typeof leagueId === "number" ? leagueId : undefined,
  );
  const { teams: teamsByLeague } = useTeams(
    typeof leagueId === "number" ? leagueId : undefined,
  );
  const createFixture = useCreateFixture();

  const [seasonId, setSeasonId] = useState<number | "">("");
  const [homeTeamId, setHomeTeamId] = useState<number | "">("");
  const [awayTeamId, setAwayTeamId] = useState<number | "">("");
  const [date, setDate] = useState("");
  const [stadium, setStadium] = useState("");
  const [referee, setReferee] = useState("");
  const [roundNumber, setRoundNumber] = useState<string>("1");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!seasonId || !homeTeamId || !awayTeamId || !date) return;

    if (homeTeamId === awayTeamId) {
      setFormError("Home and away teams must be different.");
      return;
    }

    setFormError(null);

    await createFixture.mutateAsync({
      seasonId: Number(seasonId),
      homeTeamId: Number(homeTeamId),
      awayTeamId: Number(awayTeamId),
      date,
      stadium: stadium || undefined,
      referee: referee || undefined,
      roundNumber: roundNumber ? Number(roundNumber) : undefined,
    });

    setSeasonId("");
    setHomeTeamId("");
    setAwayTeamId("");
    setDate("");
    setStadium("");
    setReferee("");
    setRoundNumber("1");
    onClose();
  };

  if (!open) return null;

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Add Fixture</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">League</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={leagueId}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : "";
                setLeagueId(value);
                setSeasonId("");
                setHomeTeamId("");
                setAwayTeamId("");
              }}
              required
            >
              <option value="">Select league</option>
              {leagues.map((league) => (
                <option key={league.id} value={league.id}>
                  {league.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Season</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={seasonId}
              onChange={(e) =>
                setSeasonId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">Select season</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.year}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Home team</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={homeTeamId}
              onChange={(e) =>
                setHomeTeamId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">Select team</option>
              {teamsByLeague.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Away team</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={awayTeamId}
              onChange={(e) =>
                setAwayTeamId(e.target.value ? Number(e.target.value) : "")
              }
              required
            >
              <option value="">Select team</option>
              {teamsByLeague.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Date & time
            </label>
            <input
              type="datetime-local"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Stadium</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={stadium}
              onChange={(e) => setStadium(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Round</label>
            <input
              type="number"
              min={1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={roundNumber}
              onChange={(e) => setRoundNumber(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Referee</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            value={referee}
            onChange={(e) => setReferee(e.target.value)}
          />
        </div>

        {formError && <p className="text-sm text-red-500">{formError}</p>}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createFixture.isPending}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createFixture.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddFixtureModal;
