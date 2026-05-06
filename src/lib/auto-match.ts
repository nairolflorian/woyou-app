// Auto-matching: triggered when a candidate becomes placeable, or when a new
// non-custom job request is created. No human in the loop. Custom requests
// (isCustomRequest = true) deliberately stay manual — they need a vermittler.
//
// Logic:
//   - Score candidate × jobRequest with the existing scoreCandidate().
//   - Above MIN_SCORE → create a Match.
//   - Candidate consent mode decides initial match status:
//       BLANKET     → SHARED_WITH_COMPANY (company sees profile immediately)
//       PER_COMPANY → AWAITING_CANDIDATE_CONSENT (candidate is asked first)
//   - Limits: at most TOP_N matches per trigger, skip if a Match already
//     exists for that pair.

import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS } from "@/lib/enums";
import { scoreCandidate } from "@/lib/matching";

const MIN_SCORE = 60;
const TOP_N = 5;

function categoryMatches(
  candidate: { desiredJobCategory: string | null; alternativeJobs: string | null },
  jobCategory: string
): boolean {
  if (candidate.desiredJobCategory === jobCategory) return true;
  if (!candidate.alternativeJobs) return false;
  try {
    const alts: string[] = JSON.parse(candidate.alternativeJobs);
    return alts.includes(jobCategory);
  } catch {
    return false;
  }
}

type AutoMatchResult = {
  created: number;
  awaitingConsent: number;
  sharedWithCompany: number;
};

export async function autoMatchForCandidate(
  candidateId: string
): Promise<AutoMatchResult> {
  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
  });
  if (!candidate) return empty();
  if (
    candidate.status !== CANDIDATE_STATUS.PAID_PLACEABLE &&
    candidate.status !== CANDIDATE_STATUS.PROPOSED
  ) {
    return empty();
  }

  const openRequests = await prisma.jobRequest.findMany({
    where: { status: "OPEN", isCustomRequest: false },
  });

  const scored = openRequests
    .filter((jr) => categoryMatches(candidate, jr.jobCategory))
    .map((jr) => ({ jr, ...scoreCandidate(candidate, jr) }))
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);

  return createMatches(
    scored.map((s) => ({
      candidateId: candidate.id,
      candidateUserId: candidate.userId,
      candidateConsent: candidate.consentMode,
      jobRequestId: s.jr.id,
      companyId: s.jr.companyId,
      score: s.score,
    }))
  );
}

export async function autoMatchForJobRequest(
  jobRequestId: string
): Promise<AutoMatchResult> {
  const jr = await prisma.jobRequest.findUnique({ where: { id: jobRequestId } });
  if (!jr || jr.status !== "OPEN" || jr.isCustomRequest) return empty();

  const candidates = await prisma.candidate.findMany({
    where: {
      status: { in: [CANDIDATE_STATUS.PAID_PLACEABLE, CANDIDATE_STATUS.PROPOSED] },
    },
  });

  const scored = candidates
    .filter((c) => categoryMatches(c, jr.jobCategory))
    .map((c) => ({ c, ...scoreCandidate(c, jr) }))
    .filter((x) => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_N);

  return createMatches(
    scored.map((s) => ({
      candidateId: s.c.id,
      candidateUserId: s.c.userId,
      candidateConsent: s.c.consentMode,
      jobRequestId: jr.id,
      companyId: jr.companyId,
      score: s.score,
    }))
  );
}

async function createMatches(
  pairs: {
    candidateId: string;
    candidateUserId: string;
    candidateConsent: string;
    jobRequestId: string;
    companyId: string;
    score: number;
  }[]
): Promise<AutoMatchResult> {
  if (pairs.length === 0) return empty();

  // Skip pairs that already have a Match.
  const existing = await prisma.match.findMany({
    where: {
      OR: pairs.map((p) => ({
        candidateId: p.candidateId,
        jobRequestId: p.jobRequestId,
      })),
    },
    select: { candidateId: true, jobRequestId: true },
  });
  const exKey = (a: string, b: string | null) => `${a}::${b ?? ""}`;
  const existingSet = new Set(
    existing.map((e) => exKey(e.candidateId, e.jobRequestId))
  );
  const fresh = pairs.filter(
    (p) => !existingSet.has(exKey(p.candidateId, p.jobRequestId))
  );

  let awaitingConsent = 0;
  let sharedWithCompany = 0;

  for (const p of fresh) {
    const initialStatus =
      p.candidateConsent === "BLANKET"
        ? MATCH_STATUS.SHARED_WITH_COMPANY
        : MATCH_STATUS.AWAITING_CANDIDATE_CONSENT;

    await prisma.$transaction(async (tx) => {
      await tx.match.create({
        data: {
          candidateId: p.candidateId,
          companyId: p.companyId,
          jobRequestId: p.jobRequestId,
          matchScore: p.score,
          status: initialStatus,
        },
      });
      await tx.candidate.update({
        where: { id: p.candidateId },
        data: {
          status: CANDIDATE_STATUS.PROPOSED,
          timesProposed: {
            increment: p.candidateConsent === "BLANKET" ? 1 : 0,
          },
        },
      });
      if (p.candidateConsent === "BLANKET") {
        const company = await tx.company.findUnique({ where: { id: p.companyId } });
        if (company) {
          await tx.notification.create({
            data: {
              userId: company.userId,
              type: "MATCH_SHARED",
              title: "Neuer Kandidaten-Vorschlag (Auto-Match)",
              body: "Wir haben einen passenden Kandidaten gefunden.",
              link: "/firmen/dashboard",
            },
          });
        }
        sharedWithCompany++;
      } else {
        await tx.notification.create({
          data: {
            userId: p.candidateUserId,
            type: "CONSENT_REQUESTED",
            title: "Ein Unternehmen passt zu deinem Profil",
            body: "Wir bitten dich kurz um deine Zustimmung im Dashboard.",
            link: "/profil",
          },
        });
        awaitingConsent++;
      }
    });
  }

  return {
    created: awaitingConsent + sharedWithCompany,
    awaitingConsent,
    sharedWithCompany,
  };
}

function empty(): AutoMatchResult {
  return { created: 0, awaitingConsent: 0, sharedWithCompany: 0 };
}
