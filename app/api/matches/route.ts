import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { matchSchema } from "@/app/lib/validationSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "fixtureId", type: "number" },
        { name: "reporterId", type: "number" },
        { name: "status", type: "string" },
      ],
    });

    const [data, total] = await Promise.all([
      prisma.match.findMany({
        ...queryOptions,
        include: {
          fixture: { include: { season: true, homeTeam: true, awayTeam: true } },
          reporter: true,
        },
      }),
      prisma.match.count({ where: queryOptions.where }),
    ]);

    return NextResponse.json({ total, data });
  } catch (e: any) {
    return handleError(e, "Failed to list matches");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = matchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.message }, { status: 400 });
    }

    const { fixtureId, status, reporterId } = body;

    const match = await prisma.match.create({
      data: {
        fixture: { connect: { id: fixtureId } },
        status: status ?? undefined,
        reporter: reporterId ? { connect: { id: reporterId } } : undefined,
      },
    });

    return NextResponse.json(match, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create match");
  }
}
