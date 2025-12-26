import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  _ctx: { params: Promise<{ id: string }> },
) {
  return NextResponse.json(
    { error: "Deprecated. Use /api/matches/[id]/stats" },
    { status: 410 },
  );
}

export async function POST(
  _req: NextRequest,
  _ctx: { params: Promise<{ id: string }> },
) {
  return NextResponse.json(
    { error: "Deprecated. Use /api/matches/[id]/stats" },
    { status: 410 },
  );
}
