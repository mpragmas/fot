import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { buildQueryOptions } from "@/app/lib/buildQueryOptions";
import { handleError } from "@/app/lib/routeError";
import { newsSchema } from "@/app/lib/validationSchema";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const queryOptions = buildQueryOptions(searchParams, {
      allowedFilters: [
        { name: "authorId", type: "number" },
        { name: "title", type: "search", fields: ["title", "content"] },
      ],
    });

    const [data, total] = await Promise.all([
      prisma.news.findMany(queryOptions),
      prisma.news.count({ where: queryOptions.where }),
    ]);

    return NextResponse.json({ total, data });
  } catch (e: any) {
    return handleError(e, "Failed to list news");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = newsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 },
      );
    }

    const news = await prisma.news.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: body.authorId,
      },
    });

    return NextResponse.json(news, { status: 201 });
  } catch (e: any) {
    return handleError(e, "Failed to create news");
  }
}
