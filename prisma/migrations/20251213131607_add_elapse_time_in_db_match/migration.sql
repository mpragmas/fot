-- CreateEnum
CREATE TYPE "MatchPhase" AS ENUM ('PRE', 'FIRST_HALF', 'HT', 'SECOND_HALF', 'ET', 'FT');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "clockStartedAt" TIMESTAMP(3),
ADD COLUMN     "elapsedSeconds" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "phase" "MatchPhase" NOT NULL DEFAULT 'PRE';
