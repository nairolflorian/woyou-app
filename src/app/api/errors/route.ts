// Client-side error logging endpoint. error.tsx calls this so unhandled
// React render errors land in the same table as server errors.

import { NextResponse } from "next/server";
import { z } from "zod";
import { captureError } from "@/lib/error-log";
import { getSession } from "@/lib/session";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const schema = z.object({
  digest: z.string().optional(),
  message: z.string().max(2000),
  stack: z.string().max(8000).optional(),
  path: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  // Rate-limit so a tab loop can't fill the table.
  const rl = rateLimit("error-report", clientIp(req), 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });
  }
  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const session = await getSession();
  await captureError(new Error(parsed.data.message), {
    level: "ERROR",
    digest: parsed.data.digest,
    path: parsed.data.path,
    method: "CLIENT",
    userId: session.userId,
    userAgent: req.headers.get("user-agent") ?? undefined,
  });
  return NextResponse.json({ ok: true });
}
