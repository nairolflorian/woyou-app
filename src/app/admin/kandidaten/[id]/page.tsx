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

export default async function CandidateDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const candidate = await prisma.candidate.findUnique({
    where: { id },
    include: {
      user: true,
      matches: { include: { company: true, jobRequest: true } },
      tasks: true,
      testAnswers: true,
    },
  });
  if (!candidate) notFound();

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
            <h2 className="font-semibold">Vorschläge ({candidate.matches.length})</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {candidate.matches.length === 0 && <li className="text-[color:var(--color-ink-soft)]">Keine Vorschläge.</li>}
              {candidate.matches.map((m) => {
                const ms = MATCH_STATUS_LABEL[m.status as keyof typeof MATCH_STATUS_LABEL];
                return (
                  <li key={m.id} className="flex justify-between items-start gap-3">
                    <div>
                      <div className="font-semibold">{m.company.companyName}</div>
                      {m.jobRequest && (
                        <div className="text-xs text-[color:var(--color-ink-soft)]">
                          {m.jobRequest.customJobTitle ?? jobLabel(m.jobRequest.jobCategory)}
                        </div>
                      )}
                    </div>
                    <span className={`badge ${ms?.color ?? ""}`}>{ms?.de ?? m.status}</span>
                  </li>
                );
              })}
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
