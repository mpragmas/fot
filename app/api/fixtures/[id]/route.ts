import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchFixtureSchema } from "@/app/lib/validationSchema";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: { season: true, homeTeam: true, awayTeam: true, match: true },
    });
    if (!fixture) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(fixture);
  } catch (e: any) {
    return handleError(e, "Failed to fetch fixture");
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
    const validation = patchFixtureSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const { seasonId, homeTeamId, awayTeamId, date, stadium, referee } =
      validation.data;

    const data: any = {
      ...(seasonId !== undefined
        ? { season: { connect: { id: seasonId } } }
        : {}),
      ...(homeTeamId !== undefined
        ? { homeTeam: { connect: { id: homeTeamId } } }
        : {}),
      ...(awayTeamId !== undefined
        ? { awayTeam: { connect: { id: awayTeamId } } }
        : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(stadium !== undefined ? { stadium } : {}),
      ...(referee !== undefined ? { referee } : {}),
    };

    const fixture = await prisma.fixture.update({ where: { id }, data });
    return NextResponse.json(fixture);
  } catch (e: any) {
    return handleError(e, "Failed to update fixture", {
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

    await prisma.fixture.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete fixture", {
      notFoundCodes: ["P2025"],
    });
  }
}
