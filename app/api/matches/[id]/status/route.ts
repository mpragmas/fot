import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Update match status
    const match = await prisma.match.update({
      where: { id },
      data: { status },
    });

    // Notify Socket Server
    try {
      await fetch("http://localhost:4000/match-updated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: match.id, status: match.status }),
      });
    } catch (notifyError) {
      console.error("Failed to notify socket server", notifyError);
      // We don't fail the request if socket notification fails, but we log it.
    }

    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to update match status");
  }
}
