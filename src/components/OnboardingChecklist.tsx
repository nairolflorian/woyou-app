import Link from "next/link";
import { getT } from "@/lib/i18n";

type Step = {
  key: string;
  title: string;
  desc: string;
  done: boolean;
  href?: string;
  cta?: string;
};

export async function OnboardingChecklist({
  profileCompleteness,
  testTaken,
  hasDocuments,
  paid,
}: {
  profileCompleteness: number;
  testTaken: boolean;
  hasDocuments: boolean;
  paid: boolean;
}) {
  const { t } = await getT();
  const fmt = (key: string, vars?: Record<string, string | number>) => {
    let s = t(key);
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
    return s;
  };

  const steps: Step[] = [
    {
      key: "profile",
      title: t("onb.step1_title"),
      desc: fmt("onb.step1_desc", { percent: profileCompleteness }),
      done: profileCompleteness >= 100,
      href: "/registrierung/profil",
      cta: profileCompleteness >= 100 ? t("onb.step1_cta_done") : t("onb.step1_cta"),
    },
    {
      key: "test",
      title: t("onb.step2_title"),
      desc: t("onb.step2_desc"),
      done: testTaken,
      href: "/sprachtest",
      cta: testTaken ? t("onb.step2_cta_done") : t("onb.step2_cta"),
    },
    {
      key: "docs",
      title: t("onb.step3_title"),
      desc: t("onb.step3_desc"),
      done: hasDocuments,
      href: "#dokumente",
      cta: hasDocuments ? t("onb.step3_cta_done") : t("onb.step3_cta"),
    },
    {
      key: "paid",
      title: t("onb.step4_title"),
      desc: t("onb.step4_desc"),
      done: paid,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">
          {allDone ? t("onb.title_done") : t("onb.title_active")}
        </h2>
        <span className="text-sm font-semibold text-[color:var(--color-brand)]">
          {fmt("onb.progress", { done: doneCount, total: steps.length })}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
        <div
          className="h-full bg-[color:var(--color-brand)] transition-all"
          style={{ width: `${(doneCount / steps.length) * 100}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.key}
            className={`flex items-start gap-4 rounded-lg p-4 border ${
              s.done
                ? "border-emerald-200 bg-emerald-50"
                : "border-[color:var(--color-border)] bg-white"
            }`}
          >
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                s.done
                  ? "bg-emerald-600 text-white"
                  : "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)]"
              }`}
              aria-hidden="true"
            >
              {s.done ? "✓" : i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.title}</div>
              <p className="text-sm text-[color:var(--color-ink-soft)] mt-0.5">
                {s.desc}
              </p>
            </div>
            {s.href && s.cta && (
              <Link
                href={s.href}
                className={s.done ? "btn-ghost text-xs" : "btn-primary text-xs"}
              >
                {s.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
