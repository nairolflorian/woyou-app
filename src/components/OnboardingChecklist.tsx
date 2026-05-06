import Link from "next/link";

type Step = {
  key: string;
  title: string;
  desc: string;
  done: boolean;
  href?: string;
  cta?: string;
};

export function OnboardingChecklist({
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
  const steps: Step[] = [
    {
      key: "profile",
      title: "Profil ausfüllen",
      desc: `Aktuell ${profileCompleteness}% — wir brauchen 100% für die Vermittlung.`,
      done: profileCompleteness >= 100,
      href: "/registrierung/profil",
      cta: profileCompleteness >= 100 ? "Bearbeiten" : "Weiter ausfüllen",
    },
    {
      key: "test",
      title: "Sprachtest absolvieren",
      desc: "12 Multiple-Choice-Fragen, dauert ca. 5 Minuten. Wir zeigen Unternehmen dein objektives Niveau.",
      done: testTaken,
      href: "/sprachtest",
      cta: testTaken ? "Wiederholen" : "Test starten",
    },
    {
      key: "docs",
      title: "Mindestens den Lebenslauf hochladen",
      desc: "Bewerbungsgespräche werden so 3× schneller — Firmen sehen direkt was du kannst.",
      done: hasDocuments,
      href: "#dokumente",
      cta: hasDocuments ? "Dokumente verwalten" : "Hochladen",
    },
    {
      key: "paid",
      title: "Profil freischalten",
      desc: "Einmalige Gebühr — danach bist du für unsere Partnerunternehmen sichtbar und wirst automatisch vorgeschlagen.",
      done: paid,
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  return (
    <div className="card">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold">
          {allDone ? "Du bist startklar 🎉" : "Bring dein Profil zur Vermittelbarkeit"}
        </h2>
        <span className="text-sm font-semibold text-[color:var(--color-brand)]">
          {doneCount} / {steps.length} erledigt
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
