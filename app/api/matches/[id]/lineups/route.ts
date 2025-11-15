import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { upsertLineupSchema } from "@/app/lib/validationSchema";
import { ensureSocketStarted, emitLineup } from "@/app/lib/socket";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const lineups = await prisma.lineup.findMany({
      where: { matchId },
      include: { player: true },
      orderBy: [{ isStarting: "desc" }, { position: "asc" }, { id: "asc" }],
    });

    return NextResponse.json(lineups);
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch lineups");
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = upsertLineupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const items = parsed.data.items.map((i) => ({
      matchId,
      playerId: i.playerId,
      position: i.position,
      isStarting: i.isStarting ?? false,
    }));

    // Write → Delete and Insert → Fetch full lineup with player
    const result = await prisma.$transaction(async (tx) => {
      await tx.lineup.deleteMany({ where: { matchId } });

      await tx.lineup.createMany({ data: items });

      const full = await tx.lineup.findMany({
        where: { matchId },
        include: { player: true },
        orderBy: [{ isStarting: "desc" }, { position: "asc" }, { id: "asc" }],
      });

      return full;
    });

    // Real-time emit always returns full objects with player
    emitLineup(matchId, result);

    // Also return lineup in the API response
    return NextResponse.json(result, { status: 201 });
  } catch (e: unknown) {
    return handleError(e, "Failed to upsert lineup");
  }
}
