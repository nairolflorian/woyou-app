import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  CANDIDATE_STATUS,
  CANDIDATE_STATUS_LABEL,
  MATCH_STATUS_LABEL,
} from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";
import { CandidateAdminActions } from "@/components/CandidateAdminActions";
import { parseDocs, findAvatar } from "@/lib/uploads";
import { AvatarBubble } from "@/components/AvatarUpload";
import { scoreCandidate } from "@/lib/matching";
import { AUDIT_ACTION_LABEL } from "@/lib/audit";

export default async function CandidateDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      user: true,
      matches: {
        include: { company: true, jobRequest: true },
        orderBy: { createdAt: "desc" },
      },
      tasks: true,
      testAnswers: true,
    },
  });
  if (!candidate) notFound();

  // Audit history scoped to this candidate, newest first.
  const candidateAudit = await prisma.auditLog.findMany({
    where: { candidateId: id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const lbl = CANDIDATE_STATUS_LABEL[candidate.status as keyof typeof CANDIDATE_STATUS_LABEL];
  const altJobs = candidate.alternativeJobs ? JSON.parse(candidate.alternativeJobs) as string[] : [];
  const otherLangs = candidate.otherLanguages
    ? (JSON.parse(candidate.otherLanguages) as { lang: string; level: string }[])
    : [];
  const cities = candidate.preferredCities ? JSON.parse(candidate.preferredCities) as string[] : [];
  const docs = parseDocs(candidate.documents);

  return (
    <div>
      <Link href="/admin/kandidaten" className="text-sm text-[color:var(--color-ink-soft)]">
        ← zurück zur Liste
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <AvatarBubble
            candidateId={candidate.id}
            filename={findAvatar(docs)?.filename ?? null}
            initials={`${candidate.firstName?.[0] ?? ""}${candidate.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
            size={56}
          />
          <div>
            <h1 className="text-2xl font-bold">
              {candidate.firstName} {candidate.lastName}
            </h1>
            <p className="text-sm text-[color:var(--color-ink-soft)]">
              {candidate.user.email ?? candidate.user.phone ?? candidate.user.telegramId}
              {" · "}
              {candidate.city ?? "—"}, {candidate.countryOfResidence ?? "—"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/druck/kandidat/${candidate.id}`}
            target="_blank"
            className="btn-outline text-xs"
          >
            🖨 Profil als PDF
          </Link>
          <span className={`badge ${lbl.color}`}>{lbl.de}</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 space-y-3">
          <h2 className="font-semibold">Steckbrief</h2>
          <Field label="Geburtsdatum">{candidate.dateOfBirth?.toLocaleDateString("de-DE") ?? "—"}</Field>
          <Field label="Nationalität">{candidate.nationality ?? "—"}</Field>
          <Field label="Wunschberuf">
            {candidate.desiredJobCategory ? jobLabel(candidate.desiredJobCategory) : "—"}
            {candidate.desiredJobTitle && ` — ${candidate.desiredJobTitle}`}
          </Field>
          <Field label="Alternative Berufe">{altJobs.join(", ") || "—"}</Field>
          <Field label="Bildung / Erfahrung">
            {candidate.educationLevel ?? "—"} · {candidate.yearsExperience ?? 0} J. Erfahrung
          </Field>
          <Field label="Sprachen">
            DE {candidate.germanLevel ?? "—"} · EN {candidate.englishLevel ?? "—"}
            {otherLangs.length > 0 && " · " + otherLangs.map((l) => `${l.lang} ${l.level}`).join(", ")}
            {candidate.languageTestScore != null && (
              <> · Sprachtest <strong>{candidate.languageTestScore}/12</strong></>
            )}
          </Field>
          <Field label="Mobilität">
            {candidate.willingnessToRelocate ? "Umzugsbereit" : "Eingeschränkt"}
            {cities.length > 0 && " · Wunsch: " + cities.join(", ")}
          </Field>
          <Field label="Gehaltsvorstellung">
            {candidate.expectedSalaryMin ?? "?"} – {candidate.expectedSalaryMax ?? "?"} €/Mon.
          </Field>
          <Field label="Über">{candidate.aboutMe ?? "—"}</Field>
          <Field label="Motivation">{candidate.motivation ?? "—"}</Field>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold">Verwaltung</h2>
            <CandidateAdminActions
              candidateId={candidate.id}
              currentStatus={candidate.status}
            />
          </div>

          <div className="card">
            <h2 className="font-semibold">Match-Geschichte ({candidate.matches.length})</h2>
            <ul className="mt-3 space-y-3 text-sm">
              {candidate.matches.length === 0 && (
                <li className="text-[color:var(--color-ink-soft)]">Keine Vorschläge.</li>
              )}
              {candidate.matches.map((m) => {
                const ms = MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL];
                const reasons =
                  m.jobRequest ? scoreCandidate(candidate, m.jobRequest).reasons : [];
                return (
                  <li
                    key={m.id}
                    className="rounded-lg border border-[color:var(--color-border)] p-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold">{m.company.companyName}</div>
                        {m.jobRequest && (
                          <div className="text-xs text-[color:var(--color-ink-soft)]">
                            {m.jobRequest.customJobTitle ?? jobLabel(m.jobRequest.jobCategory)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {m.matchScore != null && (
                          <span className="badge bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] font-semibold">
                            {m.matchScore}/100
                          </span>
                        )}
                        <span className={`badge ${ms?.color ?? ""}`}>{ms?.de ?? m.status}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-[color:var(--color-ink-soft)]">
                      <span>
                        Erstellt {m.createdAt.toLocaleString("de-DE")}
                      </span>
                      {m.candidateRespondedAt && (
                        <span>
                          Kandidat reagierte {m.candidateRespondedAt.toLocaleString("de-DE")}
                        </span>
                      )}
                      {m.companyRespondedAt && (
                        <span>
                          Firma reagierte {m.companyRespondedAt.toLocaleString("de-DE")}
                        </span>
                      )}
                    </div>
                    {reasons.length > 0 && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-[color:var(--color-brand)]">
                          Score-Begründung
                        </summary>
                        <ul className="mt-1 list-disc ml-5 text-[color:var(--color-ink-soft)]">
                          {reasons.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                    {m.companyFeedback && (
                      <div className="mt-2 text-xs bg-amber-50 border border-amber-200 rounded p-2">
                        <strong>Firmen-Feedback:</strong> {m.companyFeedback}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-semibold">Verlauf ({candidateAudit.length})</h2>
            <ul className="mt-3 space-y-1.5 text-xs">
              {candidateAudit.length === 0 && (
                <li className="text-[color:var(--color-ink-soft)]">Noch keine Einträge.</li>
              )}
              {candidateAudit.map((a) => (
                <li key={a.id} className="flex flex-wrap items-baseline gap-2">
                  <span className="text-[10px] text-[color:var(--color-ink-soft)] tabular-nums">
                    {a.createdAt.toLocaleString("de-DE")}
                  </span>
                  <span className="font-semibold">
                    {AUDIT_ACTION_LABEL[a.action as keyof typeof AUDIT_ACTION_LABEL] ?? a.action}
                  </span>
                  {a.actorEmail && (
                    <span className="text-[color:var(--color-ink-soft)]">· {a.actorEmail}</span>
                  )}
                  {a.meta && (
                    <span className="text-[color:var(--color-ink-soft)] truncate max-w-[260px]">
                      · {a.meta}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-semibold">Dokumente ({docs.length})</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {docs.length === 0 && (
                <li className="text-[color:var(--color-ink-soft)]">Keine Dokumente hochgeladen.</li>
              )}
              {docs.map((d) => (
                <li key={d.id} className="flex justify-between items-center gap-3">
                  <div>
                    <div className="font-semibold capitalize">{d.kind}</div>
                    <div className="text-xs text-[color:var(--color-ink-soft)]">{d.originalName}</div>
                  </div>
                  <a
                    href={`/api/documents/${candidate.id}/${d.filename}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[color:var(--color-brand)] font-semibold text-xs"
                  >
                    Öffnen →
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h2 className="font-semibold">Aufgaben ({candidate.tasks.length})</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {candidate.tasks.length === 0 && <li className="text-[color:var(--color-ink-soft)]">Keine Aufgaben.</li>}
              {candidate.tasks.map((t) => (
                <li key={t.id} className="flex justify-between gap-3">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-xs text-[color:var(--color-ink-soft)]">{t.kind}</div>
                  </div>
                  <span className="badge bg-slate-100 text-slate-700">{t.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 text-sm">
      <div className="text-[color:var(--color-ink-soft)]">{label}</div>
      <div>{children}</div>
    </div>
  );
}

// keep CANDIDATE_STATUS imported for type narrowing
void CANDIDATE_STATUS;
