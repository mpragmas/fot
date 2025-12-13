import { NextRequest, NextResponse } from "next/server";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { matchSchema } from "@/app/lib/validationSchema";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "fixtureId", type: "number" },
        { name: "id", type: "number" },
        { name: "reporterId", type: "number" },
        { name: "status", type: "string" },
        {
          name: "teamName",
          type: "search",
          fields: ["fixture.homeTeam.name", "fixture.awayTeam.name"],
        },
      ],
    });

    const [data, total] = await Promise.all([
      prisma.match.findMany({
        ...queryOptions,
        include: {
          fixture: {
            include: { season: true, homeTeam: true, awayTeam: true },
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
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { fixtureId, status, reporterId } = validation.data;

    // Each fixture can only have one match (fixtureId is unique on Match).
    // Use a single upsert to avoid race conditions between find/create.
    const match = await prisma.match.upsert({
      where: { fixtureId },
      update: {
        status: status ?? undefined,
        ...(reporterId
          ? { reporter: { connect: { id: reporterId } } }
          : { reporter: { disconnect: true } }),
      },
      create: {
        fixture: { connect: { id: fixtureId } },
        status: status ?? undefined,
        ...(reporterId ? { reporter: { connect: { id: reporterId } } } : {}),
      },
    });
    try {
      await fetch("http://localhost:4000/match-updated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: match.id, status: match.status }),
      });
    } catch (notifyError) {
      console.error("Failed to notify socket server", notifyError);
    }

    return NextResponse.json(match, { status: 200 });
  } catch (e: any) {
    return handleError(e, "Failed to create match");
  }
}
