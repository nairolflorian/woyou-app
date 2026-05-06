// Print-optimised candidate profile. Use the browser's "Save as PDF" /
// Cmd-P from this page — produces a clean A4 page without nav/footer.

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { jobLabel } from "@/lib/jobs";
import { CANDIDATE_STATUS_LABEL } from "@/lib/enums";
import { parseDocs } from "@/lib/uploads";
import { PrintActions } from "@/components/PrintActions";

export const metadata = { title: "WoYou Profil — Druck" };

export default async function PrintProfile(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) redirect("/anmelden");
  const { id } = await props.params;

  const c = await prisma.candidate.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!c) notFound();

  const altJobs = c.alternativeJobs ? (JSON.parse(c.alternativeJobs) as string[]) : [];
  const otherLangs = c.otherLanguages
    ? (JSON.parse(c.otherLanguages) as { lang: string; level: string }[])
    : [];
  const cities = c.preferredCities ? (JSON.parse(c.preferredCities) as string[]) : [];
  const docs = parseDocs(c.documents);
  const lbl = CANDIDATE_STATUS_LABEL[c.status as keyof typeof CANDIDATE_STATUS_LABEL];

  return (
    <div className="print-root">
      <style>{`
        @page { size: A4; margin: 16mm; }
        body { background: white !important; }
        .print-actions { display: flex; gap: 8px; margin-bottom: 16px; }
        @media print {
          .print-actions, .print-hide { display: none !important; }
          .print-root { padding: 0 !important; }
        }
        .print-root { max-width: 800px; margin: 0 auto; padding: 24px; font-family: "Segoe UI", system-ui, sans-serif; color: #222; }
        h1 { font-size: 24px; margin: 0; color: #6F9EAB; }
        h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #6F9EAB; border-bottom: 1px solid #e8edf0; padding-bottom: 4px; margin-top: 24px; margin-bottom: 8px; }
        .meta { color: #555; font-size: 12px; }
        .grid2 { display: grid; grid-template-columns: 140px 1fr; gap: 6px 16px; font-size: 13px; }
        .grid2 dt { color: #555; }
        .grid2 dd { margin: 0; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: #e8edf0; }
        .pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; background: #f7f9fa; margin-right: 4px; }
        p { font-size: 13px; line-height: 1.5; margin: 6px 0; }
      `}</style>

      <PrintActions backHref={`/admin/kandidaten/${c.id}`} />

      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
        <div>
          <h1>
            {c.firstName} {c.lastName}
          </h1>
          <p className="meta">
            {c.dateOfBirth?.toLocaleDateString("de-DE") ?? "—"} ·{" "}
            {c.nationality ?? "—"} · {c.city ?? "—"}, {c.countryOfResidence ?? "—"}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#6F9EAB" }}>WoYou</div>
          <div className="meta">{new Date().toLocaleDateString("de-DE")}</div>
          <span className={`badge`}>{lbl.de}</span>
        </div>
      </header>

      <h2>Wunschberuf</h2>
      <p>
        <strong>{c.desiredJobCategory ? jobLabel(c.desiredJobCategory) : "—"}</strong>
        {c.desiredJobTitle ? ` — ${c.desiredJobTitle}` : ""}
      </p>
      {altJobs.length > 0 && (
        <p className="meta">Alternativen: {altJobs.map((s) => jobLabel(s)).join(", ")}</p>
      )}

      <h2>Profil</h2>
      <dl className="grid2">
        <dt>Bildung</dt>
        <dd>{c.educationLevel ?? "—"}</dd>
        <dt>Erfahrung</dt>
        <dd>{c.yearsExperience ?? 0} Jahre</dd>
        <dt>Aktueller Beruf</dt>
        <dd>{c.currentJob ?? "—"}</dd>
        <dt>Aktueller Arbeitgeber</dt>
        <dd>{c.currentEmployer ?? "—"}</dd>
        <dt>Führerschein</dt>
        <dd>{c.drivingLicense ? "Ja" : "Nein"}</dd>
        <dt>Frühester Start</dt>
        <dd>{c.earliestStart?.toLocaleDateString("de-DE") ?? "—"}</dd>
        <dt>Gehaltsvorstellung</dt>
        <dd>
          {c.expectedSalaryMin ?? "?"} – {c.expectedSalaryMax ?? "?"} €/Monat
        </dd>
        <dt>Mobilität</dt>
        <dd>
          {c.willingnessToRelocate ? "Umzugsbereit deutschlandweit" : "Eingeschränkt"}
          {cities.length > 0 && ` · Wunsch: ${cities.join(", ")}`}
        </dd>
        <dt>Familienstand</dt>
        <dd>
          {c.familyStatus ?? "—"}
          {c.dependents ? ` · ${c.dependents} Angehörige` : ""}
        </dd>
      </dl>

      <h2>Sprachen</h2>
      <p>
        <span className="pill">Deutsch {c.germanLevel ?? "—"}</span>
        <span className="pill">Englisch {c.englishLevel ?? "—"}</span>
        {otherLangs.map((l, i) => (
          <span key={i} className="pill">
            {l.lang} {l.level}
          </span>
        ))}
      </p>
      {c.languageTestScore != null && (
        <p className="meta">
          Sprachtest Deutsch: <strong>{c.languageTestScore}/12</strong>
          {c.languageTestPassed != null && (c.languageTestPassed ? " — bestanden" : " — nicht bestanden")}
          {c.languageTestTakenAt && ` · ${c.languageTestTakenAt.toLocaleDateString("de-DE")}`}
        </p>
      )}

      <h2>Über die Person</h2>
      <p>{c.aboutMe ?? "—"}</p>

      <h2>Motivation</h2>
      <p>{c.motivation ?? "—"}</p>

      <h2>Dokumente</h2>
      {docs.length === 0 ? (
        <p className="meta">Keine hochgeladen.</p>
      ) : (
        <ul style={{ paddingLeft: 18, fontSize: 13 }}>
          {docs.map((d) => (
            <li key={d.id}>
              <strong>{d.kind}</strong> — {d.originalName} (
              {(d.size / 1024).toFixed(0)} KB,{" "}
              {new Date(d.uploadedAt).toLocaleDateString("de-DE")})
            </li>
          ))}
        </ul>
      )}

      <h2>Kontakt</h2>
      <dl className="grid2">
        <dt>Bevorzugt</dt>
        <dd>{c.preferredChannel}</dd>
        <dt>E-Mail</dt>
        <dd>{c.user.email ?? "—"}</dd>
        <dt>Telefon</dt>
        <dd>{c.user.phone ?? "—"}</dd>
        <dt>Telegram</dt>
        <dd>{c.telegramHandle ?? c.user.telegramId ?? "—"}</dd>
        <dt>WhatsApp</dt>
        <dd>{c.whatsappNumber ?? "—"}</dd>
      </dl>

      <p className="meta" style={{ marginTop: 32, textAlign: "center" }}>
        Ausgedruckt aus WoYou — vertraulich, nur für die interne
        Vermittlungsverwendung.
      </p>
    </div>
  );
}
