import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchMatchSchema } from "@/app/lib/validationSchema";
import { ensureSocketStarted } from "@/app/lib/socket";
import {
  updateLeagueTableForFixtureTeams,
  updateLeagueTableForMatch,
} from "@/app/lib/leagueTableService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    ensureSocketStarted();

    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        fixture: {
          include: {
            season: true,
            homeTeam: {
              include: {
                players: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    number: true,
                    teamId: true,
                  },
                },
              },
            },
            awayTeam: {
              include: {
                players: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    number: true,
                    teamId: true,
                  },
                },
              },
            },
          },
        },
        counters: true,
        stats: {
          orderBy: [{ minute: "asc" }, { id: "asc" }],
          select: {
            id: true,
            matchId: true,
            playerId: true,
            type: true,
            minute: true,
            createdAt: true,
          },
        },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            Image: true,
          },
        },
      } as any,
    });
    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to fetch match");
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
    const validation = patchMatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { status, reporterId } = validation.data;

    const existing = await prisma.match.findUnique({
      where: { id },
      select: { status: true },
    });

    const data: any = {
      ...(status !== undefined ? { status } : {}),
      ...(reporterId !== undefined
        ? reporterId === null
          ? { reporter: { disconnect: true } }
          : { reporter: { connect: { id: reporterId } } }
        : {}),
    };

    const match = await prisma.match.update({ where: { id }, data });

    if (existing && existing.status !== match.status) {
      if (existing.status === "COMPLETED" || match.status === "COMPLETED") {
        await updateLeagueTableForMatch(match.id);
      }
    }

    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to update match", {
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

    const match = await prisma.match.findUnique({
      where: { id },
      select: {
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

    await prisma.match.delete({ where: { id } });

    if (match && match.status === "COMPLETED" && match.fixture) {
      await updateLeagueTableForFixtureTeams(
        match.fixture.seasonId,
        match.fixture.season.leagueId,
        match.fixture.homeTeamId,
        match.fixture.awayTeamId,
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete match", {
      notFoundCodes: ["P2025"],
    });
  }
}
