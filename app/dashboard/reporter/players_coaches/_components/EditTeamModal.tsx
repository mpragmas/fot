"use client";

import React, { useState, FormEvent, useEffect } from "react";
import { useLeagues } from "@/app/hooks/useLeagues";
import { useUpdateTeam } from "@/app/hooks/useTeams";
import type { Team } from "@/app/hooks/useTeams";
import BaseModal from "@/app/components/BaseModal";
import ImageUploadField from "@/app/components/ImageUploadField";

interface EditTeamModalProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
}

const EditTeamModal = ({ open, team, onClose }: EditTeamModalProps) => {
  const { leagues } = useLeagues();
  const updateTeam = useUpdateTeam();

  const [name, setName] = useState("");
  const [leagueId, setLeagueId] = useState<number | "">("");
  const [coach, setCoach] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [logo, setLogo] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setName(team.name);
      setCoach(team.coach ?? "");
      setLocation(team.location ?? "");
      setLogo(team.logo ?? null);
      const league = leagues.find((l) => l.name === team.leagueName);
      setLeagueId(league ? league.id : "");
    }
  }, [team, leagues]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !team) return;

    await updateTeam.mutateAsync({
      id: team.id,
      name,
      leagueId: typeof leagueId === "number" ? leagueId : undefined,
      coach,
      location,
      logo: logo || undefined,
    });

    onClose();
  };

  if (!open || !team) return null;

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Team</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Name</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">League</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            value={leagueId}
            onChange={(e) =>
              setLeagueId(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select league</option>
            {leagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Coach</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={coach}
              onChange={(e) => setCoach(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <ImageUploadField label="Team logo" value={logo} onChange={setLogo} />

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
            disabled={updateTeam.isPending}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updateTeam.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditTeamModal;
