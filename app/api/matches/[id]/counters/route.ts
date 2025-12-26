import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchMatchCountersSchema } from "@/app/lib/validationSchema";
import { emitCountersUpdated, ensureSocketStarted } from "@/app/lib/socket";

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

    const counters = await prisma.matchCounters.findUnique({
      where: { matchId },
    });

    return NextResponse.json(
      counters ?? {
        matchId,
        homeShotsOnTarget: 0,
        awayShotsOnTarget: 0,
        homeCorners: 0,
        awayCorners: 0,
      },
    );
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch match counters");
  }
}

function clamp0(n: number) {
  return n < 0 ? 0 : n;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    ensureSocketStarted();

    const { id } = await params;
    const matchId = Number(id);
    if (!Number.isFinite(matchId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchMatchCountersSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const deltas = parsed.data;

    const existing = await prisma.matchCounters.findUnique({
      where: { matchId },
    });

    const next = {
      homeShotsOnTarget: clamp0(
        (existing?.homeShotsOnTarget ?? 0) +
          (deltas.homeShotsOnTargetDelta ?? 0),
      ),
      awayShotsOnTarget: clamp0(
        (existing?.awayShotsOnTarget ?? 0) +
          (deltas.awayShotsOnTargetDelta ?? 0),
      ),
      homeCorners: clamp0(
        (existing?.homeCorners ?? 0) + (deltas.homeCornersDelta ?? 0),
      ),
      awayCorners: clamp0(
        (existing?.awayCorners ?? 0) + (deltas.awayCornersDelta ?? 0),
      ),
    };

    const updated = await prisma.matchCounters.upsert({
      where: { matchId },
      create: { matchId, ...next },
      update: next,
    });

    emitCountersUpdated(matchId, updated);

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleError(e, "Failed to update match counters", {
      notFoundCodes: ["P2025"],
    });
  }
}
