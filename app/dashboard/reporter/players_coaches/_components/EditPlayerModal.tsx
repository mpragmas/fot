"use client";

import React, { useEffect, useState, FormEvent } from "react";
import BaseModal from "@/app/components/BaseModal";
import { useTeams } from "@/app/hooks/useTeams";
import { Player, useUpdatePlayer } from "@/app/hooks/usePlayers";

interface EditPlayerModalProps {
  open: boolean;
  player: Player | null;
  onClose: () => void;
}

const EditPlayerModal = ({ open, player, onClose }: EditPlayerModalProps) => {
  const { teams } = useTeams();
  const updatePlayer = useUpdatePlayer();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [position, setPosition] = useState("");
  const [number, setNumber] = useState<number | "">("");
  const [teamId, setTeamId] = useState<number | "">("");

  useEffect(() => {
    if (player) {
      const [first, ...rest] = player.fullName.split(" ");
      setFirstName(first || "");
      setLastName(rest.join(" "));
      setPosition(player.position);
      setNumber(player.number);
      setTeamId(player.teamId);
    }
  }, [player]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!player || !firstName || !position || !number || !teamId) return;

    await updatePlayer.mutateAsync({
      id: player.id,
      firstName,
      lastName: lastName || undefined,
      position,
      number: Number(number),
      teamId: Number(teamId),
    });

    onClose();
  };

  if (!open || !player) return null;

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Edit Player</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">First name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Last name</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Position</label>
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Number</label>
            <input
              type="number"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
              value={number}
              onChange={(e) =>
                setNumber(e.target.value ? Number(e.target.value) : "")
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Team</label>
          <select
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
            value={teamId}
            onChange={(e) =>
              setTeamId(e.target.value ? Number(e.target.value) : "")
            }
            required
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
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
            disabled={updatePlayer.isPending}
            className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {updatePlayer.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default EditPlayerModal;
