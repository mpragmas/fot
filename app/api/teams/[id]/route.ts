import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchTeamSchema } from "@/app/lib/validationSchema";

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

    const team = await prisma.team.findUnique({
      where: { id },
      include: { league: true },
    });
    if (!team) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(team);
  } catch (e: any) {
    return handleError(e, "Failed to fetch team");
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
    const validation = patchTeamSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { name, leagueId, coach } = validation.data;
    const data = {
      ...(name !== undefined ? { name } : {}),
      ...(coach !== undefined ? { coach } : {}),
      ...(leagueId !== undefined
        ? { league: { connect: { id: leagueId } } }
        : {}),
    };
    const team = await prisma.team.update({ where: { id }, data });

    return NextResponse.json(team);
  } catch (e: any) {
    return handleError(e, "Failed to update team", {
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

    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete team", {
      notFoundCodes: ["P2025"],
    });
  }
}
