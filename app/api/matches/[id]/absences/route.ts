import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { upsertAbsenceSchema } from "@/app/lib/validationSchema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const matchId = Number(id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const absences = await prisma.matchAbsence.findMany({
      where: { matchId },
      orderBy: [{ playerId: "asc" }],
    });

    return NextResponse.json(absences);
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch absences");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const matchId = Number(id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = upsertAbsenceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const { playerId, type, note } = parsed.data;

    const absence = await prisma.matchAbsence.upsert({
      where: {
        matchId_playerId: {
          matchId,
          playerId,
        },
      },
      update: {
        type,
        note,
      },
      create: {
        matchId,
        playerId,
        type,
        note,
      },
    });

    return NextResponse.json(absence, { status: 201 });
  } catch (e: unknown) {
    return handleError(e, "Failed to upsert absence");
  }
}
