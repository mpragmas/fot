import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchFixtureSchema } from "@/app/lib/validationSchema";
import { updateLeagueTableForFixtureTeams } from "@/app/lib/leagueTableService";
import { recomputePlayerStatsForSeason } from "@/app/lib/playerStats";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: { season: true, homeTeam: true, awayTeam: true, match: true },
    });
    if (!fixture) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(fixture);
  } catch (e: any) {
    return handleError(e, "Failed to fetch fixture");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const validation = patchFixtureSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { seasonId, homeTeamId, awayTeamId, date, stadium, referee } =
      validation.data;

    const data: any = {
      ...(seasonId !== undefined
        ? { season: { connect: { id: seasonId } } }
        : {}),
      ...(homeTeamId !== undefined
        ? { homeTeam: { connect: { id: homeTeamId } } }
        : {}),
      ...(awayTeamId !== undefined
        ? { awayTeam: { connect: { id: awayTeamId } } }
        : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(stadium !== undefined ? { stadium } : {}),
      ...(referee !== undefined ? { referee } : {}),
    };

    const fixture = await prisma.fixture.update({ where: { id }, data });
    return NextResponse.json(fixture);
  } catch (e: any) {
    return handleError(e, "Failed to update fixture", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Fetch match + fixture context first so we can update league table *after* deletion.
    const matchContext = await prisma.match.findFirst({
      where: { fixtureId: id },
      select: {
        id: true,
        status: true,
        fixture: {
          select: {
            seasonId: true,
            homeTeamId: true,
            awayTeamId: true,
            season: {
              select: {
                leagueId: true,
              },
            },
          },
        },
      },
    });

    await prisma.$transaction(async (tx) => {
      // Find the match for this fixture, if any.
      const match = await tx.match.findUnique({
        where: { fixtureId: id },
        select: { id: true },
      });

      if (match) {
        // Delete all match-related data first to satisfy FK constraints.
        await tx.lineup.deleteMany({ where: { matchId: match.id } });
        await tx.matchStat.deleteMany({ where: { matchId: match.id } });
        await tx.matchCounters.deleteMany({ where: { matchId: match.id } });
        await tx.match.delete({ where: { id: match.id } });
      }

      await tx.fixture.delete({ where: { id } });
    });

    // After deletion, recompute league table rows for the two teams if the
    // deleted match was a completed one. This is best-effort so that failures
    // here do not break fixture deletion UX.
    if (
      matchContext &&
      matchContext.status === "COMPLETED" &&
      matchContext.fixture
    ) {
      try {
        await updateLeagueTableForFixtureTeams(
          matchContext.fixture.seasonId,
          matchContext.fixture.season.leagueId,
          matchContext.fixture.homeTeamId,
          matchContext.fixture.awayTeamId,
        );
      } catch {
        // Swallow league table update errors; the main deletion succeeded.
      }
    }

    // Also recompute season-level player stats so league stats pages stay in
    // sync with deleted fixtures. Best-effort and non-fatal.
    if (matchContext?.fixture?.seasonId) {
      try {
        await recomputePlayerStatsForSeason(matchContext.fixture.seasonId);
      } catch {
        // Ignore failures; main deletion already completed.
      }
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete fixture", {
      notFoundCodes: ["P2025"],
    });
  }
}
