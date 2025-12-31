-- CreateTable
CREATE TABLE "LeagueTable" (
    "id" SERIAL NOT NULL,
    "leagueId" INTEGER NOT NULL,
    "seasonId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    "played" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "goalsFor" INTEGER NOT NULL DEFAULT 0,
    "goalsAgainst" INTEGER NOT NULL DEFAULT 0,
    "goalDiff" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueTable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueTable_league_season_points_goalDiff_idx" ON "LeagueTable"("leagueId", "seasonId", "points", "goalDiff");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueTable_leagueId_seasonId_teamId_key" ON "LeagueTable"("leagueId", "seasonId", "teamId");

-- AddForeignKey
ALTER TABLE "LeagueTable" ADD CONSTRAINT "LeagueTable_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTable" ADD CONSTRAINT "LeagueTable_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueTable" ADD CONSTRAINT "LeagueTable_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
