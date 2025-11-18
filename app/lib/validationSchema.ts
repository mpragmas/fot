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

export const seasonSchema = z.object({
  year: z.string().min(1, "Year is required"),
  leagueId: z.number().min(1, "League is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

export const patchSeasonSchema = z.object({
  year: z.string().optional(),
  leagueId: z.number().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const teamSchema = z.object({
  name: z.string().min(1, "Name is required"),
  leagueId: z.number().min(1, "League is required"),
  coach: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

export const patchTeamSchema = z.object({
  name: z.string().optional(),
  leagueId: z.number().optional(),
  coach: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
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

export const statTypeEnum = z.enum([
  "GOAL",
  "ASSIST",
  "OWN_GOAL",
  "YELLOW_CARD",
  "RED_CARD",
  "SHOT",
  "CORNER",
  "SUBSTITUTION",
]);

export const createMatchStatSchema = z.object({
  playerId: z.number().min(1, "Player is required"),
  type: statTypeEnum,
  minute: z.number().int().min(0, "Minute must be >= 0"),
});

export const upsertLineupSchema = z.object({
  items: z
    .array(
      z.object({
        playerId: z.number().min(1, "Player is required"),
        position: z.string().min(1, "Position is required"),
        isStarting: z.boolean().optional(),
      }),
    )
    .min(1, "At least one lineup item is required"),
});

export const patchMatchStatSchema = z.object({
  playerId: z.number().min(1, "Player is required").optional(),
  type: statTypeEnum.optional(),
  minute: z.number().int().min(0, "Minute must be >= 0").optional(),
});

export const patchLineupItemSchema = z.object({
  playerId: z.number().min(1, "Player is required").optional(),
  position: z.string().min(1, "Position is required").optional(),
  isStarting: z.boolean().optional(),
});

export const newsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  authorId: z.number().min(1, "Author is required"),
});

export const patchNewsSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  authorId: z.number().optional(),
});
