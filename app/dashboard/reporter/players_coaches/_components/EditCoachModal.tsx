"use client";

import React, { useEffect, useState, FormEvent } from "react";
import BaseModal from "@/app/components/BaseModal";
import { useUpdateTeam } from "@/app/hooks/useTeams";
import type { Team } from "@/app/hooks/useTeams";

interface EditCoachModalProps {
  open: boolean;
  team: Team | null;
  onClose: () => void;
}

const EditCoachModal = ({ open, team, onClose }: EditCoachModalProps) => {
  const updateTeam = useUpdateTeam();
  const [coach, setCoach] = useState("");

  useEffect(() => {
    if (team) {
      setCoach(team.coach ?? "");
    }
  }, [team]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!team) return;

    await updateTeam.mutateAsync({
      id: team.id,
      coach,
    });

    onClose();
  };

  if (!open || !team) return null;

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Coach</h2>
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
          <label className="mb-1 block text-sm font-medium">Team</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
            {team.name}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Coach name</label>
          <input
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            value={coach}
            onChange={(e) => setCoach(e.target.value)}
            placeholder="Enter coach name"
          />
        </div>

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
            {updateTeam.isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditCoachModal;
