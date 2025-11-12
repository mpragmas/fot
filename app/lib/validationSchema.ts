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

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long")
  .regex(/\d/, "Password must contain at least one number");

export const fixtureSchema = z.object({
  seasonId: z.number().min(1, "Season is required"),
  homeTeamId: z.number().min(1, "Home team is required"),
  awayTeamId: z.number().min(1, "Away team is required"),
  date: z.string().min(1, "Date is required"),
  stadium: z.string().optional().nullable(),
  referee: z.string().optional().nullable(),
});

export const patchFixtureSchema = z.object({
  seasonId: z.number().optional(),
  homeTeamId: z.number().optional(),
  awayTeamId: z.number().optional(),
  date: z.string().optional(),
  stadium: z.string().optional().nullable(),
  referee: z.string().optional().nullable(),
});

export const matchStatusEnum = z.enum(["UPCOMING", "LIVE", "COMPLETED"]);

export const matchSchema = z.object({
  fixtureId: z.number().min(1, "Fixture is required"),
  status: matchStatusEnum.optional(),
  reporterId: z.number().optional(),
});

export const patchMatchSchema = z.object({
  status: matchStatusEnum.optional(),
  reporterId: z.number().nullable().optional(),
});
