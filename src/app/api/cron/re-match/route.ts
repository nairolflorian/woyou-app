// Daily re-matching pass. Runs on the server via cron, hitting this endpoint
// with a shared secret in the Authorization header:
//
//   curl -H "Authorization: Bearer $CRON_SECRET" https://.../api/cron/re-match
//
// What it does: for each currently placeable candidate that has fewer than
// MAX_OPEN_MATCHES open matches, run autoMatchForCandidate again. Picks up
// candidates who paid before any matching jobs existed, and any new jobs
// posted in the last 24h that didn't sweep all eligible candidates.

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS } from "@/lib/enums";
import { autoMatchForCandidate, autoMatchForJobRequest } from "@/lib/auto-match";
import { audit } from "@/lib/audit";

const MAX_OPEN_MATCHES_PER_CANDIDATE = 5;

const ACTIVE_MATCH: string[] = [
  MATCH_STATUS.AWAITING_CANDIDATE_CONSENT,
  MATCH_STATUS.SHARED_WITH_COMPANY,
  MATCH_STATUS.COMPANY_INTERESTED,
  MATCH_STATUS.IN_CONVERSATION,
];

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization");
  if (!header) return false;
  const expected = `Bearer ${secret}`;
  // constant-time-ish — for a demo this is fine
  return header === expected;
}

async function run() {
  const candidates = await prisma.candidate.findMany({
    where: {
      status: { in: [CANDIDATE_STATUS.PAID_PLACEABLE, CANDIDATE_STATUS.PROPOSED] },
    },
    include: { matches: true },
  });

  let candidatesProcessed = 0;
  let candidateMatches = 0;
  for (const c of candidates) {
    const open = c.matches.filter((m) => ACTIVE_MATCH.includes(m.status)).length;
    if (open >= MAX_OPEN_MATCHES_PER_CANDIDATE) continue;
    const r = await autoMatchForCandidate(c.id);
    candidateMatches += r.created;
    candidatesProcessed++;
  }

  // Also re-sweep any open job request created in the last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fresh = await prisma.jobRequest.findMany({
    where: { status: "OPEN", isCustomRequest: false, createdAt: { gt: since } },
  });
  let jrProcessed = 0;
  let jrMatches = 0;
  for (const jr of fresh) {
    const r = await autoMatchForJobRequest(jr.id);
    jrMatches += r.created;
    jrProcessed++;
  }

  return {
    candidatesProcessed,
    candidateMatches,
    jrProcessed,
    jrMatches,
  };
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const result = await run();
  await audit(null, "CRON_REMATCH_RUN", {}, result);
  return NextResponse.json({ ok: true, ...result });
}

export async function GET(req: Request) {
  // Allow GET for ergonomic curl from cron, same auth.
  return POST(req);
}
