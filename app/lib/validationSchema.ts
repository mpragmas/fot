import { z } from "zod";

export const playerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required").optional(),
  position: z.string().min(1, "Position is required"),
  number: z.number().min(1, "Number is required"),
  teamId: z.number().min(1, "Team is required"),
});

export const patchPlayerSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  position: z.string().optional(),
  number: z.number().optional(),
  teamId: z.number().optional(),
});

export const leagueSchema = z.object({
  name: z.string().min(1, "Name is required"),
  country: z.string().min(1, "Country is required"),
});

export const patchLeagueSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
});

export const teamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  leagueId: z.number().min(1, "League is required"),
  coach: z.string().optional().nullable(),
});

export const patchTeamSchema = z.object({
  name: z.string().optional(),
  leagueId: z.number().optional(),
  coach: z.string().optional().nullable(),
});
