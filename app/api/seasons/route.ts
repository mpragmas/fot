import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { seasonSchema } from "@/app/lib/validationSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "leagueId", type: "number" },
        { name: "year", type: "string" },
      ],
    });

    const [data, total] = await Promise.all([
      prisma.season.findMany({
        ...queryOptions,
        include: { league: true },
      }),
      prisma.season.count({ where: queryOptions.where }),
    ]);

    return NextResponse.json({ total, data });
  } catch (e: any) {
    return handleError(e, "Failed to list seasons");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = seasonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const season = await prisma.season.create({
      data: {
        year: body.year,
        leagueId: body.leagueId,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        totalRounds: body.totalRounds ?? null,
      },
    });

    return NextResponse.json(season, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create season");
  }
}
