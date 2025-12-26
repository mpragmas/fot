import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { ensureSocketStarted, emitMatchUpdated } from "@/app/lib/socket";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    ensureSocketStarted();

    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 },
      );
    }

    // Update match status
    const match = await prisma.match.update({
      where: { id },
      data: { status },
    });

    emitMatchUpdated(match.id, match.status);

    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to update match status");
  }
}
