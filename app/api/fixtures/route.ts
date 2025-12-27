import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { fixtureSchema } from "@/app/lib/validationSchema";
import { createInitialMatch } from "@/app/lib/matchService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "seasonId", type: "number" },
        { name: "homeTeamId", type: "number" },
        { name: "awayTeamId", type: "number" },
      ],
    });

    const data = await prisma.fixture.findMany({
      ...queryOptions,
      include: {
        season: true,
        homeTeam: true,
        awayTeam: true,
        match: {
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return handleError(e, "Failed to list fixtures");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = fixtureSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const fixture = await prisma.fixture.create({
      data: {
        seasonId: body.seasonId,
        homeTeamId: body.homeTeamId,
        awayTeamId: body.awayTeamId,
        date: new Date(body.date),
        stadium: body.stadium ?? null,
        referee: body.referee ?? null,
        roundNumber: body.roundNumber ?? 1,
      },
    });

    // Create the initial Match container for this fixture (status defaults to UPCOMING).
    await createInitialMatch(fixture.id);

    return NextResponse.json(fixture, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create fixture");
  }
}
