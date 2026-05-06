import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS, MATCH_STATUS_LABEL } from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";
import { scoreCandidate } from "@/lib/matching";
import { ProposeButton } from "@/components/ProposeButton";

export default async function MatchingPage(props: {
  searchParams: Promise<{ jr?: string }>;
}) {
  const sp = await props.searchParams;

  const openRequests = await prisma.jobRequest.findMany({
    where: { status: "OPEN" },
    include: { company: true, matches: true },
    orderBy: { createdAt: "desc" },
  });

  const selected = sp.jr
    ? await prisma.jobRequest.findUnique({
        where: { id: sp.jr },
        include: { company: true, matches: true },
      })
    : null;

  let scoredCandidates: {
    id: string;
    name: string;
    score: number;
    reasons: string[];
    germanLevel: string | null;
    yearsExperience: number | null;
    desiredJobCategory: string | null;
    languageTestScore: number | null;
    alreadyProposed: boolean;
  }[] = [];

  if (selected) {
    const candidates = await prisma.candidate.findMany({
      where: { status: { in: [CANDIDATE_STATUS.PAID_PLACEABLE, CANDIDATE_STATUS.PROPOSED] } },
      take: 200,
    });
    const proposed = new Set(selected.matches.map((m) => m.candidateId));
    scoredCandidates = candidates
      .map((c) => {
        const { score, reasons } = scoreCandidate(c, selected);
        return {
          id: c.id,
          name: `${c.firstName ?? "—"} ${c.lastName ?? ""}`.trim(),
          score,
          reasons,
          germanLevel: c.germanLevel,
          yearsExperience: c.yearsExperience,
          desiredJobCategory: c.desiredJobCategory,
          languageTestScore: c.languageTestScore,
          alreadyProposed: proposed.has(c.id),
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Matching</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Matching läuft <strong>automatisch</strong> sobald ein Kandidat
        vermittelbar wird oder eine neue Stellenanfrage angelegt wird
        (Schwelle 60/100, Top 5). Diese Seite ist ein <strong>manueller Override</strong>
        — z.B. um auch unter der Schwelle gezielt vorzuschlagen oder ältere
        Kandidaten erneut zu matchen.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <div className="card">
          <h2 className="font-semibold mb-3">Offene Anfragen</h2>
          <ul className="space-y-2 text-sm">
            {openRequests.map((jr) => (
              <li key={jr.id}>
                <a
                  href={`/admin/matching?jr=${jr.id}`}
                  className={`block rounded-lg border p-3 hover:border-[color:var(--color-brand)] ${
                    selected?.id === jr.id
                      ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]"
                      : "border-[color:var(--color-border)]"
                  }`}
                >
                  <div className="font-semibold">{jr.company.companyName}</div>
                  <div className="text-xs text-[color:var(--color-ink-soft)]">
                    {jr.customJobTitle ?? jobLabel(jr.jobCategory)}
                    {jr.location && ` · ${jr.location}`}
                  </div>
                  {jr.isCustomRequest && (
                    <span className="mt-1 inline-block badge bg-amber-100 text-amber-800">
                      Sonderanfrage
                    </span>
                  )}
                </a>
              </li>
            ))}
            {openRequests.length === 0 && (
              <li className="text-[color:var(--color-ink-soft)]">Keine offenen Anfragen.</li>
            )}
          </ul>
        </div>

        <div>
          {!selected && (
            <div className="card text-[color:var(--color-ink-soft)]">
              ← Bitte Stellenanfrage wählen.
            </div>
          )}
          {selected && (
            <div>
              <div className="card mb-4">
                <div className="text-xs uppercase font-bold text-[color:var(--color-ink-soft)] tracking-widest">
                  Anfrage
                </div>
                <h2 className="text-lg font-bold mt-1">
                  {selected.customJobTitle ?? jobLabel(selected.jobCategory)}
                </h2>
                <div className="text-sm text-[color:var(--color-ink-soft)]">
                  {selected.company.companyName} · {selected.location ?? "—"} · DE {selected.requiredGermanLevel ?? "—"} · {selected.minYearsExperience ?? 0} J.
                </div>
                <p className="mt-2 text-sm">{selected.description}</p>
              </div>

              <h3 className="font-semibold mb-3">Top-Kandidaten</h3>
              <div className="space-y-3">
                {scoredCandidates.map((c) => (
                  <div key={c.id} className="card">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <a href={`/admin/kandidaten/${c.id}`} className="font-semibold hover:text-[color:var(--color-brand)]">
                          {c.name}
                        </a>
                        <div className="text-xs text-[color:var(--color-ink-soft)]">
                          {c.desiredJobCategory ? jobLabel(c.desiredJobCategory) : "—"} · DE {c.germanLevel ?? "—"} · {c.yearsExperience ?? 0} J.
                          {c.languageTestScore != null && ` · Test ${c.languageTestScore}/12`}
                        </div>
                        <details className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
                          <summary className="cursor-pointer">Score-Begründung</summary>
                          <ul className="list-disc ml-5 mt-1">
                            {c.reasons.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </details>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[color:var(--color-brand)]">{c.score}</div>
                        <div className="text-xs text-[color:var(--color-ink-soft)]">/ 100</div>
                        {c.alreadyProposed ? (
                          <span className="badge bg-slate-100 text-slate-700 mt-2">bereits vorgeschlagen</span>
                        ) : (
                          <ProposeButton candidateId={c.id} jobRequestId={selected.id} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {scoredCandidates.length === 0 && (
                  <div className="card text-[color:var(--color-ink-soft)]">
                    Keine vermittelbaren Kandidaten gefunden. Hinweis: nur
                    Kandidaten mit Status „Vermittelbar" werden hier gezeigt.
                  </div>
                )}
              </div>

              <h3 className="font-semibold mt-8 mb-3">Bisherige Vorschläge</h3>
              <div className="space-y-2 text-sm">
                {selected.matches.length === 0 && <div className="text-[color:var(--color-ink-soft)]">Noch keine.</div>}
                {selected.matches.map((m) => {
                  const ms = MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL];
                  return (
                    <div key={m.id} className="card flex items-center justify-between gap-2">
                      <a href={`/admin/kandidaten/${m.candidateId}`} className="font-semibold hover:text-[color:var(--color-brand)]">
                        Kandidat {m.candidateId.slice(0, 6)}…
                      </a>
                      <span className={`badge ${ms?.color ?? ""}`}>{ms?.de ?? m.status}</span>
                    </div>
                  );
                })}
              </div>

              {/* Hidden export to ensure status enum tree-shake is preserved */}
              <input type="hidden" value={MATCH_STATUS.AWAITING_CANDIDATE_CONSENT} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
