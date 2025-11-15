import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchMatchSchema } from "@/app/lib/validationSchema";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        fixture: { include: { season: true, homeTeam: true, awayTeam: true } },
        reporter: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            Image: true,
          },
        },
      },
    });
    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to fetch match");
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const validation = patchMatchSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { status, reporterId } = validation.data;

    const data: any = {
      ...(status !== undefined ? { status } : {}),
      ...(reporterId !== undefined
        ? reporterId === null
          ? { reporter: { disconnect: true } }
          : { reporter: { connect: { id: reporterId } } }
        : {}),
    };

    const match = await prisma.match.update({ where: { id }, data });
    return NextResponse.json(match);
  } catch (e: any) {
    return handleError(e, "Failed to update match", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await prisma.match.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete match", {
      notFoundCodes: ["P2025"],
    });
  }
}
