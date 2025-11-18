import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchPlayerSchema } from "@/app/lib/validationSchema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { id } });

    if (!player) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (e: any) {
    return handleError(e, "Failed to fetch player");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id))
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();
    const validation = patchPlayerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.format() },
        { status: 400 },
      );
    }

    const { firstName, lastName, position, number, teamId } = validation.data;

    const player = await prisma.player.update({
      where: { id },
      data: {
        ...(firstName !== undefined ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(position !== undefined ? { position } : {}),
        ...(number !== undefined ? { number } : {}),
        ...(teamId !== undefined ? { teamId } : {}),
      },
    });

    return NextResponse.json(player);
  } catch (e: any) {
    return handleError(e, "Failed to update player", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.player.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    // Foreign key constraint (e.g. Lineup_playerId_fkey) – cannot delete player
    if (e?.code === "P2003") {
      return NextResponse.json(
        {
          error:
            "Cannot delete player because they are still referenced in other records (e.g. lineups or stats). Remove those references first.",
        },
        { status: 409 },
      );
    }

    return handleError(e, "Failed to delete player", {
      notFoundCodes: ["P2025"],
    });
  }
}
