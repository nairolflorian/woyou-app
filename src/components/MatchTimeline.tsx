"use client";

// Visual timeline of a Match's lifecycle. We map the granular MATCH_STATUS
// onto 4 visible stages so non-tech users grasp it at a glance.

import { useT } from "@/components/TranslationProvider";

type StageState = "done" | "active" | "todo" | "rejected";

function classify(status: string): { reachedUntil: number; ended: boolean; positive: boolean } {
  switch (status) {
    case "DRAFT":
      return { reachedUntil: 0, ended: false, positive: true };
    case "AWAITING_CANDIDATE_CONSENT":
      return { reachedUntil: 1, ended: false, positive: true };
    case "CANDIDATE_DECLINED":
      return { reachedUntil: 1, ended: true, positive: false };
    case "CANDIDATE_APPROVED":
    case "SHARED_WITH_COMPANY":
      return { reachedUntil: 2, ended: false, positive: true };
    case "COMPANY_DECLINED":
      return { reachedUntil: 2, ended: true, positive: false };
    case "COMPANY_INTERESTED":
    case "IN_CONVERSATION":
      return { reachedUntil: 3, ended: false, positive: true };
    case "HIRED":
      return { reachedUntil: 3, ended: true, positive: true };
    default:
      return { reachedUntil: 0, ended: false, positive: true };
  }
}

export function MatchTimeline({ status }: { status: string }) {
  const { t } = useT();
  const STAGES = [
    { key: "proposal", label: t("ml.proposal") },
    { key: "consent", label: t("ml.consent") },
    { key: "review", label: t("ml.review") },
    { key: "outcome", label: t("ml.outcome") },
  ];
  const { reachedUntil, ended, positive } = classify(status);

  const stageState = (i: number): StageState => {
    if (i < reachedUntil) return "done";
    if (i === reachedUntil) {
      if (ended) return positive ? "done" : "rejected";
      return "active";
    }
    return "todo";
  };

  const colorOf = (s: StageState) => {
    switch (s) {
      case "done":
        return "bg-emerald-500 text-white";
      case "active":
        return "bg-[color:var(--color-brand)] text-white animate-pulse";
      case "rejected":
        return "bg-rose-500 text-white";
      case "todo":
        return "bg-[color:var(--color-border)] text-[color:var(--color-ink-soft)]";
    }
  };
  const lineColor = (s: StageState) =>
    s === "done" || s === "rejected"
      ? "bg-emerald-300"
      : "bg-[color:var(--color-border)]";

  return (
    <div className="flex items-center" role="list" aria-label={t("ml.aria_label")}>
      {STAGES.map((s, i) => {
        const st = stageState(i);
        return (
          <div
            key={s.key}
            className="flex items-center flex-1 last:flex-initial"
            role="listitem"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colorOf(st)}`}
                aria-hidden="true"
              >
                {st === "done" ? "✓" : st === "rejected" ? "✗" : i + 1}
              </div>
              <div
                className={`mt-1 text-[10px] font-semibold ${
                  st === "todo"
                    ? "text-[color:var(--color-ink-soft)]"
                    : st === "rejected"
                      ? "text-rose-700"
                      : "text-[color:var(--color-ink)]"
                }`}
              >
                {s.label}
              </div>
            </div>
            {i < STAGES.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${lineColor(st)}`} aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}
