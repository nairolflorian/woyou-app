import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS } from "@/lib/enums";
import { scoreCandidate } from "@/lib/matching";
import { audit } from "@/lib/audit";

const schema = z.object({
  candidateId: z.string(),
  jobRequestId: z.string(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID" }, { status: 400 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { id: parsed.data.candidateId },
  });
  const jobRequest = await prisma.jobRequest.findUnique({
    where: { id: parsed.data.jobRequestId },
  });
  if (!candidate || !jobRequest) {
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  }
  if (candidate.status !== CANDIDATE_STATUS.PAID_PLACEABLE && candidate.status !== CANDIDATE_STATUS.PROPOSED) {
    return NextResponse.json({ error: "CANDIDATE_NOT_PLACEABLE" }, { status: 400 });
  }

  const existing = await prisma.match.findFirst({
    where: { candidateId: candidate.id, jobRequestId: jobRequest.id },
  });
  if (existing) {
    return NextResponse.json({ error: "ALREADY_PROPOSED" }, { status: 409 });
  }

  const { score } = scoreCandidate(candidate, jobRequest);

  // If candidate has BLANKET consent, skip waiting and share immediately
  const initialStatus =
    candidate.consentMode === "BLANKET"
      ? MATCH_STATUS.SHARED_WITH_COMPANY
      : MATCH_STATUS.AWAITING_CANDIDATE_CONSENT;

  await prisma.$transaction(async (tx) => {
    await tx.match.create({
      data: {
        candidateId: candidate.id,
        companyId: jobRequest.companyId,
        jobRequestId: jobRequest.id,
        matchScore: score,
        status: initialStatus,
      },
    });
    await tx.candidate.update({
      where: { id: candidate.id },
      data: {
        status: CANDIDATE_STATUS.PROPOSED,
        timesProposed: { increment: candidate.consentMode === "BLANKET" ? 1 : 0 },
      },
    });
    if (candidate.consentMode === "BLANKET") {
      const company = await tx.company.findUnique({ where: { id: jobRequest.companyId } });
      if (company) {
        await tx.notification.create({
          data: {
            userId: company.userId,
            type: "MATCH_SHARED",
            title: "Neuer Kandidat-Vorschlag",
            body: "Bitte schauen Sie das Profil im Dashboard an.",
            link: "/firmen/dashboard",
          },
        });
      }
    } else {
      await tx.notification.create({
        data: {
          userId: candidate.userId,
          type: "CONSENT_REQUESTED",
          title: "Ein Unternehmen interessiert sich",
          body: "Wir bitten dich kurz um deine Zustimmung im Dashboard.",
          link: "/profil",
        },
      });
    }
  });

  await audit(
    req,
    "MATCH_PROPOSE_MANUAL",
    { candidateId: candidate.id, companyId: jobRequest.companyId },
    { jobRequestId: jobRequest.id, score, consentMode: candidate.consentMode }
  );

  return NextResponse.json({ ok: true });
}
