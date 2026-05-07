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

// Each field is worth this many percentage points. Used by the strength-tips
// UI so the candidate sees concrete deltas like "+8% if you fill this in".
export const PROFILE_FIELD_WEIGHT = Math.round(100 / REQUIRED_FIELDS.length);

export type ProfileTip = {
  field: string;
  i18nKey: string;
  delta: number;
};

// Returns the missing required fields as actionable tips, sorted by impact.
// Fields are intentionally collapsed into a few candidate-friendly groups
// (so we don't spam them with 12 separate "+8%" tips).
export function profileStrengthTips(c: Partial<Candidate>): ProfileTip[] {
  const missing: { field: string; i18nKey: string }[] = [];
  for (const f of REQUIRED_FIELDS) {
    const v = (c as Record<string, unknown>)[f];
    if (v === null || v === undefined || v === "") {
      missing.push({ field: f, i18nKey: `tip.${f}` });
    }
  }
  return missing.map((m) => ({
    field: m.field,
    i18nKey: m.i18nKey,
    delta: PROFILE_FIELD_WEIGHT,
  }));
}

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
