import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchSeasonSchema } from "@/app/lib/validationSchema";

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

    const season = await prisma.season.findUnique({
      where: { id },
    });

    if (!season) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(season);
  } catch (e: any) {
    return handleError(e, "Failed to fetch season");
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
    const validation = patchSeasonSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const data: any = {};
    if (validation.data.year !== undefined) data.year = validation.data.year;
    if (validation.data.leagueId !== undefined)
      data.leagueId = validation.data.leagueId;
    if (validation.data.startDate !== undefined)
      data.startDate = new Date(validation.data.startDate);
    if (validation.data.endDate !== undefined)
      data.endDate = new Date(validation.data.endDate);
    if (validation.data.totalRounds !== undefined)
      data.totalRounds = validation.data.totalRounds;

    const season = await prisma.season.update({
      where: { id },
      data,
    });

    return NextResponse.json(season);
  } catch (e: any) {
    return handleError(e, "Failed to update season", {
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

    await prisma.season.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete season", {
      notFoundCodes: ["P2025"],
    });
  }
}
