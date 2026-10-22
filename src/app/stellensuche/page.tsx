import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StellenSuche } from "@/components/StellenSuche";
import { ToolGate } from "@/components/ToolGate";
import { getT } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { toolSession } from "@/lib/werkzeug";
import { profileForCandidate } from "@/lib/stellensuche";
import { profileTerms, profileRegion, trefferKey } from "@/lib/stellensuche-core";
import { werkzeugText } from "@/lib/werkzeug-text";

export const metadata: Metadata = { title: "Stellensuche", robots: { index: false } };
export const dynamic = "force-dynamic";

// Weg 1: Stellensuche im Kundenbereich. Vorbelegung aus dem eigenen Profil als Vorschlag; suchen, filtern
// und auswählen tut die Person selbst.
export default async function StellensuchePage() {
  const s = await toolSession();
  if (!s) redirect(`/anmelden?next=${encodeURIComponent("/stellensuche")}`);
  const { locale } = await getT();
  const t = werkzeugText(locale);

  let content: React.ReactNode;
  if (!s.access.active) content = <ToolGate t={t} expired={!!s.access.until} />;
  else {
    const p = await profileForCandidate(s.candidate.id);
    const alternatives = (() => { try { return JSON.parse(s.candidate.alternativeJobs || "[]") as string[]; } catch { return []; } })().filter((x) => typeof x === "string");
    const terms = profileTerms({ targetJob: p.data?.targetJob, bookingJobs: p.booking?.targetJobs, desiredJob: s.candidate.desiredJobTitle, alternatives, experience: p.data?.experience.map((x) => x.title) ?? [] });
    const cities = (() => { try { return (JSON.parse(s.candidate.preferredCities || "[]") as string[]).join(","); } catch { return ""; } })();
    const wo = profileRegion(p.booking?.targetRegions, cities, p.data?.zipCity, s.candidate.city);
    const saved = await prisma.savedJob.findMany({ where: { candidateId: s.candidate.id }, select: { source: true, sourceRef: true } });
    content = (
      <StellenSuche t={t} locale={locale} defaults={{ was: terms[0] ?? "", wo, umkreis: 25, deutsch: p.german ?? "" }} suggestions={terms}
        savedKeys={saved.filter((x) => x.sourceRef).map((x) => trefferKey(x.source, x.sourceRef!))} trackerCount={saved.length} />
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
          <div>
            <Link href="/profil" className="text-sm text-[color:var(--color-brand)]">{locale === "ar" ? "→" : "←"} {t.back}</Link>
            <h1 className="mt-2 text-3xl font-bold">{t.searchTitle}</h1>
            <p className="mt-2 max-w-3xl text-[color:var(--color-ink-soft)]">{t.searchLead}</p>
          </div>
          {content}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
