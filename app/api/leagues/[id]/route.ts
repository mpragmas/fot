import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchLeagueSchema } from "@/app/lib/validationSchema";

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

    const league = await prisma.league.findUnique({ where: { id } });
    if (!league) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(league);
  } catch (e: any) {
    return handleError(e, "Failed to fetch league");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const validation = patchLeagueSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const league = await prisma.league.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(league);
  } catch (e: any) {
    return handleError(e, "Failed to update league", {
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

    await prisma.league.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete league", {
      notFoundCodes: ["P2025"],
    });
  }
}
