-- AlterTable
ALTER TABLE "Season" ADD COLUMN     "totalRounds" INTEGER;

-- CreateIndex
CREATE INDEX "Fixture_seasonId_roundNumber_date_idx" ON "Fixture"("seasonId", "roundNumber", "date");
