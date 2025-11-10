import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { leagueSchema } from "@/app/lib/validationSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "country", type: "string" },
        { name: "name", type: "search", fields: ["name"] },
      ],
    });

    const [data, total] = await Promise.all([
      prisma.league.findMany(queryOptions),
      prisma.league.count({ where: queryOptions.where }),
    ]);

    return NextResponse.json({ total, data });
  } catch (e: any) {
    return handleError(e, "Failed to list leagues");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = leagueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.message }, { status: 400 });
    }

    const league = await prisma.league.create({
      data: {
        name: body.name,
        country: body.country,
      },
    });

    return NextResponse.json(league, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create league");
  }
}
