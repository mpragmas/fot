-- CreateEnum
CREATE TYPE "AbsenceType" AS ENUM ('RED_CARD', 'FIVE_YELLOW_CARDS', 'INJURY', 'PERSONAL');

-- AlterTable
ALTER TABLE "MatchStat" ALTER COLUMN "half" DROP NOT NULL,
ALTER COLUMN "half" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MatchAbsence" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "type" "AbsenceType" NOT NULL,
    "note" TEXT,

    CONSTRAINT "MatchAbsence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MatchAbsence_matchId_playerId_key" ON "MatchAbsence"("matchId", "playerId");

-- AddForeignKey
ALTER TABLE "MatchAbsence" ADD CONSTRAINT "MatchAbsence_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchAbsence" ADD CONSTRAINT "MatchAbsence_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
