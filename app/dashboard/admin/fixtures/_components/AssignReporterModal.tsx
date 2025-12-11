"use client";

import React, { useEffect, useMemo, useState } from "react";
import BaseModal from "@/app/components/BaseModal";
import { useReporters } from "@/app/hooks/useReporters";
import { useAssignReporter } from "@/app/hooks/useMatchReporter";
import type { FixtureItem } from "@/app/hooks/useFixtures";

interface AssignReporterModalProps {
  open: boolean;
  fixture: FixtureItem | null;
  onClose: () => void;
}

const AssignReporterModal = ({
  open,
  fixture,
  onClose,
}: AssignReporterModalProps) => {
  const { reporters } = useReporters();
  const assignReporter = useAssignReporter();
  const [search, setSearch] = useState("");
  const [selectedReporterId, setSelectedReporterId] = useState<number | "">("");

  const filteredReporters = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return reporters;
    return reporters.filter(
      (r) =>
        (r.name || "").toLowerCase().includes(term) ||
        (r.email || "").toLowerCase().includes(term),
    );
  }, [reporters, search]);

  useEffect(() => {
    if (open && fixture) {
      setSelectedReporterId(fixture.reporterId ?? "");
      setSearch("");
    }
  }, [open, fixture]);

  if (!open || !fixture) return null;

  const handleSave = async () => {
    await assignReporter.mutateAsync({
      fixtureId: fixture.id,
      reporterId:
        typeof selectedReporterId === "number" ? selectedReporterId : null,
      status: fixture.status,
    });
    setSelectedReporterId("");
    setSearch("");
    onClose();
  };

  return (
    <BaseModal open={open} onClose={onClose}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Assign Reporter</h2>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Close
        </button>
      </div>

      <p className="mb-3 text-sm text-gray-600">
        {fixture.homeTeamName} vs {fixture.awayTeamName}
      </p>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search reporter by name or email"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
          value={selectedReporterId}
          onChange={(e) =>
            setSelectedReporterId(e.target.value ? Number(e.target.value) : "")
          }
        >
          <option value="">Select reporter</option>
          {filteredReporters.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.email})
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
          type="button"
          disabled={assignReporter.isPending || !selectedReporterId}
          onClick={handleSave}
          className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {assignReporter.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </BaseModal>
  );
};

export default AssignReporterModal;
