import type { Candidate } from "@prisma/client";
import { CANDIDATE_STATUS, type CandidateStatus } from "@/lib/enums";

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "dateOfBirth",
  "nationality",
  "countryOfResidence",
  "city",
  "desiredJobCategory",
  "germanLevel",
  "yearsExperience",
  "earliestStart",
  "aboutMe",
  "motivation",
] as const;

export function computeCompleteness(c: Partial<Candidate>): number {
  let filled = 0;
  for (const f of REQUIRED_FIELDS) {
    const v = (c as Record<string, unknown>)[f];
    if (v !== null && v !== undefined && v !== "") filled++;
  }
  return Math.round((filled / REQUIRED_FIELDS.length) * 100);
}

export function deriveStatus(
  c: Partial<Candidate> & { paidAt?: Date | null; placedAt?: Date | null },
  current: CandidateStatus
): CandidateStatus {
  if (current === CANDIDATE_STATUS.PLACED) return CANDIDATE_STATUS.PLACED;
  if (c.placedAt) return CANDIDATE_STATUS.PLACED;
  if (current === CANDIDATE_STATUS.PROPOSED) return CANDIDATE_STATUS.PROPOSED;
  if (c.paidAt) return CANDIDATE_STATUS.PAID_PLACEABLE;
  const completeness = computeCompleteness(c);
  if (completeness >= 100) return CANDIDATE_STATUS.COMPLETE;
  if (completeness > 10) return CANDIDATE_STATUS.INCOMPLETE;
  return CANDIDATE_STATUS.REGISTERED;
}
