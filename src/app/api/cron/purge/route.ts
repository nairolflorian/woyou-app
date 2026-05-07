// Hard-deletes users who were soft-deleted more than 30 days ago.
// Bearer-token protected via CRON_SECRET. Audited.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

const RETENTION_DAYS = 30;

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function run() {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const stale = await prisma.user.findMany({
    where: { deletedAt: { lt: cutoff, not: null } },
    select: { id: true },
  });
  let purged = 0;
  for (const u of stale) {
    try {
      await prisma.user.delete({ where: { id: u.id } });
      purged++;
    } catch (err) {
      console.error("purge failed for user", u.id, err);
    }
  }
  return { purged, retentionDays: RETENTION_DAYS };
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await run();
  await audit(null, "ACCOUNT_SELF_DELETE", {}, { cron: "purge", ...result });
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  return POST(req);
}
