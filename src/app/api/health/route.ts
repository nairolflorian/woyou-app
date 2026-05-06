// Public health endpoint for uptime probes (e.g. uptime-kuma).
// Verifies DB connectivity. No auth — but no sensitive info leaked either.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const startedAt = Date.now();

export async function GET() {
  let db: "ok" | "error" = "error";
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = "ok";
  } catch {
    db = "error";
  }

  const status = db === "ok" ? "ok" : "degraded";
  const code = db === "ok" ? 200 : 503;

  return NextResponse.json(
    {
      status,
      db,
      uptimeSec: Math.round((Date.now() - startedAt) / 1000),
      now: new Date().toISOString(),
    },
    {
      status: code,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
