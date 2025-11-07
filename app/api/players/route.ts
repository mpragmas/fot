import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get("teamId");
    const take = searchParams.get("take");
    const skip = searchParams.get("skip");

    const where = teamId ? { teamId: Number(teamId) } : {};

    const data = await prisma.player.findMany({
      where,
      orderBy: { id: "desc" },
      take: take ? Number(take) : undefined,
      skip: skip ? Number(skip) : undefined,
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to list players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, position, number, teamId } = body ?? {};

    if (!firstName || !lastName || !position || typeof number !== "number" || typeof teamId !== "number") {
      return NextResponse.json({ error: "firstName, lastName, position, number, teamId are required" }, { status: 400 });
    }

    const player = await prisma.player.create({
      data: { firstName, lastName, position, number, teamId },
    });

    return NextResponse.json(player, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "Failed to create player" }, { status: 500 });
  }
}
