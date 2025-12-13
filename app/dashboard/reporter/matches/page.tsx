"use client";

import React, { useState } from "react";
import AllAssignedMatches from "./_components/AllAssignedMatches";
import AssigneeMatchTable from "./_components/AssigneeMatchTable";
import {
  useReporterMatches,
  ReporterMatchStatus,
} from "@/app/hooks/userReporterMatchs";

const Page = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ReporterMatchStatus | "">("");
  const [sortField, setSortField] = useState("fixture.date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { matches, total, isLoading } = useReporterMatches({
    search,
    status,
    orderBy: sortField,
    order: sortOrder,
    page,
    pageSize,
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div>
      <AllAssignedMatches
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
      />
      <AssigneeMatchTable
        matches={matches}
        loading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        setPage={setPage}
        sortField={sortField}
        sortOrder={sortOrder}
        onSort={handleSort}
      />
    </div>
  );
};

export default Page;
