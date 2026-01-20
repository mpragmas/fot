import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { teamSchema } from "@/app/lib/validationSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "leagueId", type: "number" },
        { name: "coach", type: "string" },
        { name: "location", type: "string" },
        { name: "name", type: "search", fields: ["name"] },
      ],
    });

    const where = {
      ...queryOptions.where,
      isActive: true,
    };

    const [data, total] = await Promise.all([
      prisma.team.findMany({
        ...queryOptions,
        where,
        include: {
          league: true,
          _count: { select: { players: true } },
        },
      }),
      prisma.team.count({ where }),
    ]);

    return NextResponse.json({ total, data });
  } catch (e: any) {
    return handleError(e, "Failed to list teams");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = teamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const team = await prisma.team.create({
      data: {
        name: body.name,
        leagueId: body.leagueId,
        coach: body.coach ?? null,
        location: body.location ?? null,
        logo: body.logo ?? null,
      },
    });

    return NextResponse.json(team, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create team");
  }
}
