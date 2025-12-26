-- CreateEnum
CREATE TYPE "MatchEventType" AS ENUM ('GOAL', 'YELLOW_CARD', 'RED_CARD', 'SUBSTITUTION');

-- CreateEnum
CREATE TYPE "MatchEventTeam" AS ENUM ('HOME', 'AWAY');

-- CreateTable
CREATE TABLE "MatchCounters" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "homeShotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "awayShotsOnTarget" INTEGER NOT NULL DEFAULT 0,
    "homeCorners" INTEGER NOT NULL DEFAULT 0,
    "awayCorners" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchCounters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchEvent" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "type" "MatchEventType" NOT NULL,
    "team" "MatchEventTeam" NOT NULL,
    "minute" INTEGER NOT NULL,
    "extraMinute" INTEGER,
    "playerName" TEXT,
    "assistName" TEXT,
    "note" TEXT,
    "ownGoal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchCounters_matchId_key" ON "MatchCounters"("matchId");

-- CreateIndex
CREATE INDEX "MatchEvent_matchId_minute_id_idx" ON "MatchEvent"("matchId", "minute", "id");

-- AddForeignKey
ALTER TABLE "MatchCounters" ADD CONSTRAINT "MatchCounters_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchEvent" ADD CONSTRAINT "MatchEvent_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
