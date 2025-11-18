import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";
import { patchNewsSchema } from "@/app/lib/validationSchema";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const id = Number(params.id);

    const news = await prisma.news.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!news) {
      return NextResponse.json({ error: "News not found" }, { status: 404 });
    }

    return NextResponse.json(news);
  } catch (e: any) {
    return handleError(e, "Failed to fetch news item");
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const id = Number(params.id);
    const body = await req.json();

    const validation = patchNewsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const news = await prisma.news.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(news);
  } catch (e: any) {
    return handleError(e, "Failed to update news item", {
      notFoundCodes: ["P2025"],
    });
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const id = Number(params.id);

    await prisma.news.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return handleError(e, "Failed to delete news item", {
      notFoundCodes: ["P2025"],
    });
  }
}
