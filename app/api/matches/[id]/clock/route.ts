import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { handleError } from "@/app/lib/routeError";

// Actions that control the authoritative match clock & phase
const VALID_ACTIONS = new Set([
  "START_FIRST_HALF",
  "END_FIRST_HALF",
  "START_SECOND_HALF",
  "ADD_EXTRA_TIME",
  "END_MATCH",
] as const);

export type MatchClockAction =
  | "START_FIRST_HALF"
  | "END_FIRST_HALF"
  | "START_SECOND_HALF"
  | "ADD_EXTRA_TIME"
  | "END_MATCH";

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
    const action: MatchClockAction | undefined = body?.action;

    if (!action || !VALID_ACTIONS.has(action)) {
      return NextResponse.json(
        { error: "Invalid or missing action" },
        { status: 400 },
      );
    }

    const match = await prisma.match.findUnique({ where: { id } });
    if (!match) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const now = new Date();
    // Use loose typing for clock fields to avoid Prisma client version issues
    const m: any = match as any;
    const baseElapsed: number = m.elapsedSeconds ?? 0;
    const startedAt: Date | null = m.clockStartedAt ?? null;
    const runningExtra = startedAt
      ? Math.max(0, Math.floor((now.getTime() - startedAt.getTime()) / 1000))
      : 0;
    const effectiveElapsed = baseElapsed + runningExtra;

    let nextStatus = match.status;
    let nextPhase: any = m.phase;
    let nextElapsed = baseElapsed;
    let nextClockStartedAt: Date | null | undefined = match.clockStartedAt;

    switch (action) {
      case "START_FIRST_HALF": {
        nextStatus = "LIVE";
        nextPhase = "FIRST_HALF";
        nextElapsed = 0;
        nextClockStartedAt = now;
        break;
      }
      case "END_FIRST_HALF": {
        nextPhase = "HT";
        nextElapsed = effectiveElapsed;
        nextClockStartedAt = null;
        break;
      }
      case "START_SECOND_HALF": {
        nextStatus = "LIVE";
        nextPhase = "SECOND_HALF";
        nextElapsed = effectiveElapsed;
        nextClockStartedAt = now;
        break;
      }
      case "ADD_EXTRA_TIME": {
        // Only meaningful near 45' or 90'
        if (effectiveElapsed < 45 * 60 && effectiveElapsed < 90 * 60) {
          // ignore silently
          break;
        }
        nextPhase = "ET";
        // keep clock running as-is
        nextElapsed = baseElapsed;
        nextClockStartedAt = match.clockStartedAt ?? now;
        break;
      }
      case "END_MATCH": {
        nextStatus = "COMPLETED";
        nextPhase = "FT";
        nextElapsed = effectiveElapsed;
        nextClockStartedAt = null;
        break;
      }
    }

    const updated = await prisma.match.update({
      where: { id },
      data: {
        status: nextStatus,
        phase: nextPhase,
        elapsedSeconds: nextElapsed,
        clockStartedAt: nextClockStartedAt ?? null,
      } as any,
    });

    // Notify Socket Server with full clock state
    try {
      await fetch("http://localhost:4000/match-updated", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: updated.id,
          status: (updated as any).status,
          phase: (updated as any).phase,
          elapsedSeconds: (updated as any).elapsedSeconds,
          clockStartedAt: (updated as any).clockStartedAt,
        }),
      });
    } catch (notifyError) {
      console.error("Failed to notify socket server", notifyError);
    }

    return NextResponse.json(updated);
  } catch (e: any) {
    return handleError(e, "Failed to update match clock");
  }
}
