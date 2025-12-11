"use client";

import { useQuery } from "@tanstack/react-query";

export type Reporter = {
  id: number;
  name: string;
  email: string;
  role: string;
  image: string | null;
};

interface UsersResponse {
  users: {
    id: number;
    name: string;
    email: string;
    role: string;
    Image: string | null;
    isActive: boolean;
  }[];
}

async function fetchReporters(): Promise<Reporter[]> {
  const res = await fetch("/api/users");
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  const data: UsersResponse = await res.json();
  return data.users
    .filter((u) => u.role === "REPORTER" && u.isActive)
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      image: u.Image,
    }));
}

export function useReporters() {
  const query = useQuery<Reporter[]>({
    queryKey: ["reporters"],
    queryFn: fetchReporters,
  });

  return {
    reporters: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
  };
}
