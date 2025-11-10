import { NextResponse } from "next/server";

export function handleError(
  e: any,
  defaultMessage: string,
  opts?: { notFoundCodes?: string[]; status?: number },
) {
  const notFoundCodes = opts?.notFoundCodes || [];

  if (e?.code && notFoundCodes.includes(e.code)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = e?.message ?? defaultMessage;
  const status = opts?.status ?? 500;
  return NextResponse.json({ error: message }, { status });
}
