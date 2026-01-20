import { NextRequest, NextResponse } from "next/server";
import { playerSchema } from "@/app/lib/validationSchema";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "teamId", type: "number" },
        { name: "position", type: "string" },
        { name: "name", type: "search", fields: ["firstName", "lastName"] },
        { name: "number", type: "range", min: "numberMin", max: "numberMax" },
      ],
    });

    // Fetch both players and total for pagination support
    const [players, total] = await Promise.all([
      prisma.player.findMany({ ...queryOptions, include: { team: true } }),
      prisma.player.count({ where: queryOptions.where }),
    ]);

    return NextResponse.json({
      total,
      data: players,
    });
  } catch (err: any) {
    return handleError(err, "Failed to list players");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = playerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const player = await prisma.player.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        position: body.position,
        age: body.age,
        number: body.number,
        teamId: body.teamId ?? null,
        image: body.image ?? null,
      },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create player");
  }
}
