import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    // Make all players of this team unemployed by clearing their teamId
    await prisma.player.updateMany({
      where: { teamId: id },
      data: { teamId: null },
    });

    const team = await prisma.team.update({
      where: { id },
      data: { isActive: false, deactivatedAt: new Date() },
    });

    return NextResponse.json(team);
  } catch (e: any) {
    return handleError(e, "Failed to deactivate team", {
      notFoundCodes: ["P2025"],
    });
  }
}
