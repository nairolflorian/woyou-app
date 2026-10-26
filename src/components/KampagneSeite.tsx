import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { landingCopy } from "@/lib/landing-copy";
import { rechtUi } from "@/lib/recht/ui-text";
import { BOTSCHAFT_STANDARD, LAENDER, QUELLE_BA, landSlug, selbstcheckHref } from "@/lib/laender";
import { fillKampagne, kampagneLang, kampagneText } from "@/lib/kampagne-text";

// Kampagne „Spremi se za januar“ unter /januar und /spremi-se-za-januar (gleiche Seite, kanonisch /januar).
// Sprache: Middleware stellt beim ersten Besuch mit ?land=RS oder utm_source=fb_rs Serbisch ein, sonst die aktuelle Sprache.
// Texte und Regeln (kein Countdown, kein Rabatt, kein Versprechen): src/lib/kampagne-text.ts

const Check = () => <span aria-hidden className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">✓</span>;
const Cross = () => <span aria-hidden className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-500 text-[11px] font-bold text-white">✕</span>;

export async function kampagneMetadata(): Promise<Metadata> {
  const { locale } = await getT();
  const lang = kampagneLang(locale), k = kampagneText(locale);
  return { title: { absolute: `${fillKampagne(k.metaTitle, lang)} · WoYou` }, description: fillKampagne(k.metaDesc, lang), alternates: { canonical: "/januar" } };
}

export async function KampagneSeite({ searchParams }: { searchParams: Promise<{ land?: string | string[] }> }) {
  const { locale } = await getT();
  const session = await getSession();
  const sp = await searchParams;
  const slug = landSlug(Array.isArray(sp.land) ? sp.land[0] : sp.land);
  const land = slug ? LAENDER[slug] : null;
  const lang = kampagneLang(locale), k = kampagneText(locale), c = landingCopy(locale);
  const f = (s: string) => fillKampagne(s, lang);
  const botschaft = land && land.westbalkan ? land : BOTSCHAFT_STANDARD;
  const quellen = [
    { href: QUELLE_BA, label: k.srcBa },
    { href: botschaft.botschaft, label: fillKampagne(k.srcEmbassy, lang, { ort: botschaft.botschaftOrt }) },
  ];
  const price = formatPrice(ANGEBOT.startpaket.priceCents, locale);
  const bookHref = session.userId && session.role === ROLE.CANDIDATE ? "/bewerbungsservice/buchen" : `/registrierung?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;
  const checkHref = selbstcheckHref(slug);
  const ctaStart = `${c.ctaStart} ${rechtUi(locale).vat}`;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* Kopf */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
            <span className="inline-block rounded-md bg-[color:var(--color-brand-soft)] px-3 py-1 text-xs font-bold tracking-widest text-[color:var(--color-brand-deep)]">{k.badge}</span>
            <h1 className="mt-4 text-3xl md:text-[2.7rem] font-bold leading-tight">{k.h1}</h1>
            <p className="mt-5 text-lg leading-relaxed text-[color:var(--color-ink-soft)]">{f(k.lead)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={checkHref} className="btn-primary px-7">{k.ctaCheck}</Link>
              <Link href={bookHref} className="btn-outline px-7">{ctaStart}</Link>
            </div>
          </div>
        </section>

        {/* Kalender als Zeitleiste */}
        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{k.calTitle}</h2>
            <ol className="mt-8 grid gap-4 md:grid-cols-4">
              {k.cal.map((s, i) => (
                <li key={s.t} className={`relative rounded-xl bg-white p-5 ${i === k.cal.length - 1 ? "border-2 border-[color:var(--color-brand)]" : "border border-[color:var(--color-border)]"}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand-deep)] font-bold text-white">{i + 1}</span>
                    <span className="text-lg font-bold text-[color:var(--color-brand-deep)]">{f(s.when)}</span>
                  </div>
                  <div className="mt-3 font-semibold">{s.t}</div>
                  <div className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{s.d}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Warum Januar: jede Aussage mit offizieller Quelle */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{k.whyTitle}</h2>
            <ul className="mt-6 space-y-3">
              {k.why.map((w) => (
                <li key={w} className="rounded-xl bg-[color:var(--color-surface)] p-4">
                  <p className="leading-relaxed">{w}</p>
                  <p className="mt-1 text-xs"><a className="font-semibold text-[color:var(--color-brand-deep)] underline" href={QUELLE_BA} target="_blank" rel="noopener noreferrer">{k.srcBa} ↗</a></p>
                </li>
              ))}
            </ul>
            <p className="mt-6 font-bold">{k.limit}</p>
            <div className="card mt-6">
              <h3 className="font-bold">{k.sourcesLabel}</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {quellen.map((q) => <li key={q.href}><a className="font-semibold text-[color:var(--color-brand-deep)] underline" href={q.href} target="_blank" rel="noopener noreferrer">{q.label} ↗</a></li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* Ehrlich: Vorrangprüfung, Arbeitgeber entscheidet, keine Garantie; dazu Das machen wir | nicht von der Startseite */}
        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="rounded-2xl border-2 border-[#b58a1b] bg-[#fbf3e1] p-6">
              <h2 className="text-lg font-bold text-[#8a6511]">{k.honestTitle}</h2>
              <ul className="mt-3 space-y-2">{k.honest.map((x) => <li key={x} className="text-[15px] leading-relaxed">{x}</li>)}</ul>
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-6">
                <h3 className="text-lg font-bold text-emerald-800">{c.doYes}</h3>
                <ul className="mt-4 space-y-3">{c.yes.map((x) => <li key={x} className="flex gap-3"><Check /><span>{x}</span></li>)}</ul>
              </div>
              <div className="rounded-2xl bg-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-700">{c.doNo}</h3>
                <ul className="mt-4 space-y-3">{c.no.map((x) => <li key={x} className="flex gap-3"><Cross /><span>{x}</span></li>)}</ul>
              </div>
            </div>
          </div>
        </section>

        {/* Abschluss */}
        <section className="bg-white">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{k.ctaTitle}</h2>
            <p className="mt-3 text-lg text-[color:var(--color-ink-soft)]">{k.ctaLead}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={checkHref} className="btn-primary px-7">{k.ctaCheck}</Link>
              <Link href={bookHref} className="btn-outline px-7">{ctaStart}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
