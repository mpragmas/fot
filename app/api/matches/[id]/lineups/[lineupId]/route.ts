import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchLineupItemSchema } from "@/app/lib/validationSchema";
import { ensureSocketStarted, emitLineup } from "@/app/lib/socket";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string; lineupId: string } },
) {
  try {
    const matchId = Number(params.id);
    const lineupId = Number(params.lineupId);
    if (!Number.isFinite(matchId) || !Number.isFinite(lineupId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const item = await prisma.lineup.findUnique({
      where: { id: lineupId },
      include: { player: true },
    });
    if (!item || item.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (e: unknown) {
    return handleError(e, "Failed to fetch lineup item");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; lineupId: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    const lineupId = Number(params.lineupId);
    if (!Number.isFinite(matchId) || !Number.isFinite(lineupId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const parsed = patchLineupItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.message },
        { status: 400 },
      );
    }

    const existing = await prisma.lineup.findUnique({ where: { id: lineupId } });
    if (!existing || existing.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.lineup.update({
      where: { id: lineupId },
      data: parsed.data,
    });

    const full = await prisma.lineup.findMany({
      where: { matchId },
      orderBy: [{ isStarting: "desc" }, { position: "asc" }, { id: "asc" }],
    });

    emitLineup(matchId, full);

    return NextResponse.json(updated);
  } catch (e: unknown) {
    return handleError(e, "Failed to update lineup item", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string; lineupId: string } },
) {
  try {
    ensureSocketStarted();

    const matchId = Number(params.id);
    const lineupId = Number(params.lineupId);
    if (!Number.isFinite(matchId) || !Number.isFinite(lineupId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const existing = await prisma.lineup.findUnique({ where: { id: lineupId } });
    if (!existing || existing.matchId !== matchId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.lineup.delete({ where: { id: lineupId } });

    const full = await prisma.lineup.findMany({
      where: { matchId },
      orderBy: [{ isStarting: "desc" }, { position: "asc" }, { id: "asc" }],
    });

    emitLineup(matchId, full);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return handleError(e, "Failed to delete lineup item", {
      notFoundCodes: ["P2025"],
    });
  }
}
