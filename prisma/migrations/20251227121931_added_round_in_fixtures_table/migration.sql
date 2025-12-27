/*
  Warnings:

  - You are about to drop the `MatchEvent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MatchEvent" DROP CONSTRAINT "MatchEvent_matchId_fkey";

-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "roundNumber" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "MatchEvent";

-- DropEnum
DROP TYPE "MatchEventTeam";

-- DropEnum
DROP TYPE "MatchEventType";
