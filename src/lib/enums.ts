export const ROLE = {
  CANDIDATE: "CANDIDATE",
  COMPANY: "COMPANY",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;
export type Role = (typeof ROLE)[keyof typeof ROLE];

export const CANDIDATE_STATUS = {
  REGISTERED: "REGISTERED",
  INCOMPLETE: "INCOMPLETE",
  COMPLETE: "COMPLETE",
  PAID_PLACEABLE: "PAID_PLACEABLE",
  PROPOSED: "PROPOSED",
  PLACED: "PLACED",
} as const;
export type CandidateStatus =
  (typeof CANDIDATE_STATUS)[keyof typeof CANDIDATE_STATUS];

export const CANDIDATE_STATUS_LABEL: Record<
  CandidateStatus,
  { de: string; en: string; fr: string; ar: string; color: string }
> = {
  REGISTERED: {
    de: "Registriert",
    en: "Registered",
    fr: "Inscrit",
    ar: "مسجل",
    color: "bg-slate-200 text-slate-700",
  },
  INCOMPLETE: {
    de: "Profil unvollständig",
    en: "Incomplete profile",
    fr: "Profil incomplet",
    ar: "ملف ناقص",
    color: "bg-amber-100 text-amber-800",
  },
  COMPLETE: {
    de: "Profil vollständig",
    en: "Profile complete",
    fr: "Profil complet",
    ar: "ملف مكتمل",
    color: "bg-blue-100 text-blue-800",
  },
  PAID_PLACEABLE: {
    de: "Vermittelbar",
    en: "Placeable",
    fr: "Plaçable",
    ar: "قابل للتوظيف",
    color: "bg-emerald-100 text-emerald-800",
  },
  PROPOSED: {
    de: "Vorgeschlagen",
    en: "Proposed",
    fr: "Proposé",
    ar: "مُقترح",
    color: "bg-indigo-100 text-indigo-800",
  },
  PLACED: {
    de: "Vermittelt",
    en: "Placed",
    fr: "Placé",
    ar: "تم التوظيف",
    color: "bg-emerald-600 text-white",
  },
};

export const MATCH_STATUS = {
  DRAFT: "DRAFT",
  AWAITING_CANDIDATE_CONSENT: "AWAITING_CANDIDATE_CONSENT",
  CANDIDATE_APPROVED: "CANDIDATE_APPROVED",
  CANDIDATE_DECLINED: "CANDIDATE_DECLINED",
  SHARED_WITH_COMPANY: "SHARED_WITH_COMPANY",
  COMPANY_INTERESTED: "COMPANY_INTERESTED",
  COMPANY_DECLINED: "COMPANY_DECLINED",
  IN_CONVERSATION: "IN_CONVERSATION",
  HIRED: "HIRED",
} as const;
export type MatchStatus = (typeof MATCH_STATUS)[keyof typeof MATCH_STATUS];

export const MATCH_STATUS_LABEL: Record<
  MatchStatus,
  { de: string; color: string }
> = {
  DRAFT: { de: "Entwurf", color: "bg-slate-200 text-slate-700" },
  AWAITING_CANDIDATE_CONSENT: {
    de: "Wartet auf Kandidaten-Zustimmung",
    color: "bg-amber-100 text-amber-800",
  },
  CANDIDATE_APPROVED: {
    de: "Kandidat hat zugestimmt",
    color: "bg-blue-100 text-blue-800",
  },
  CANDIDATE_DECLINED: {
    de: "Kandidat hat abgelehnt",
    color: "bg-rose-100 text-rose-800",
  },
  SHARED_WITH_COMPANY: {
    de: "An Unternehmen gesendet",
    color: "bg-indigo-100 text-indigo-800",
  },
  COMPANY_INTERESTED: {
    de: "Unternehmen interessiert",
    color: "bg-emerald-100 text-emerald-800",
  },
  COMPANY_DECLINED: {
    de: "Unternehmen hat abgelehnt",
    color: "bg-rose-100 text-rose-800",
  },
  IN_CONVERSATION: {
    de: "Im Gespräch",
    color: "bg-emerald-100 text-emerald-800",
  },
  HIRED: { de: "Eingestellt", color: "bg-emerald-600 text-white" },
};

export const LANGUAGE_LEVELS = ["NONE", "A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type LanguageLevel = (typeof LANGUAGE_LEVELS)[number];

export const CHANNELS = ["EMAIL", "TELEGRAM", "WHATSAPP", "PHONE"] as const;
export type Channel = (typeof CHANNELS)[number];

export const CONSENT_MODES = ["BLANKET", "PER_COMPANY"] as const;
export type ConsentMode = (typeof CONSENT_MODES)[number];

export const TASK_KINDS = [
  "VISA",
  "DOCUMENT_CHECK",
  "VERIFICATION",
  "CONTACT",
  "OTHER",
] as const;
export type TaskKind = (typeof TASK_KINDS)[number];

export const TASK_STATUS = ["OPEN", "IN_PROGRESS", "DONE"] as const;
export type TaskStatus = (typeof TASK_STATUS)[number];
