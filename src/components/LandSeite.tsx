import type { Metadata } from "next";
import Link from "next/link";
import { ServiceLanding } from "@/components/ServiceLanding";
import { SprachKnoepfe } from "@/components/SprachKnoepfe";
import { getT } from "@/lib/i18n";
import { BALKAN_TEXT } from "@/lib/selfcheck";
import { LAENDER, QUELLE_BA, landName, selbstcheckHref, type LandSlug } from "@/lib/laender";
import { fillKampagne, kampagneLang, kampagneText } from "@/lib/kampagne-text";

// Länderseite: Startseite mit kurzem Block zum Land oben. Die Sprache stellt die Middleware beim ersten Besuch ein (src/lib/laender.ts).
// Vorbereitete Länder (pilot: false) sind erreichbar, aber nicht in der Sitemap und für Suchmaschinen auf noindex.

export async function landMetadata(slug: LandSlug): Promise<Metadata> {
  const { locale } = await getT();
  const lang = kampagneLang(locale), k = kampagneText(locale), land = LAENDER[slug];
  const vars = { land: landName(land.code, lang) };
  return {
    title: { absolute: fillKampagne(k.landMetaTitle, lang, vars) },
    description: fillKampagne(k.landMetaDesc, lang, vars),
    alternates: { canonical: `/${slug}` },
    ...(land.pilot ? {} : { robots: { index: false, follow: true } }),
  };
}

export async function LandSeite({ slug }: { slug: LandSlug }) {
  const { locale } = await getT();
  const lang = kampagneLang(locale), k = kampagneText(locale), land = LAENDER[slug];
  const name = landName(land.code, lang);
  const checkHref = selbstcheckHref(slug);
  const zeilen = land.westbalkan ? [k.landWb, ...(land.code === "RS" ? [BALKAN_TEXT[lang].serbienFs] : [])] : [k.landIn];
  const quellen = [...(land.westbalkan ? [{ href: QUELLE_BA, label: k.srcBa }] : []), { href: land.botschaft, label: fillKampagne(k.srcEmbassy, lang, { ort: land.botschaftOrt }) }];

  const intro = (
    <section className="border-b border-[color:var(--color-border)] bg-[color:var(--color-brand-soft)]">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-brand-deep)]">{name}</div>
        <ul className="mt-2 space-y-1.5 text-[15px] leading-relaxed text-[color:var(--color-ink)]">
          {zeilen.map((z) => <li key={z}>{z}</li>)}
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href={checkHref} className="btn-primary">{k.landCheck}</Link>
          {land.westbalkan && <Link href={`/januar?land=${land.code}`} className="btn-outline">{k.landJanuar}</Link>}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <span className="text-[color:var(--color-ink-soft)]">{k.sourcesLabel}:</span>
          {quellen.map((q) => <a key={q.href} className="font-semibold text-[color:var(--color-brand-deep)] underline" href={q.href} target="_blank" rel="noopener noreferrer">{q.label} ↗</a>)}
        </p>
        {land.sprachen && <SprachKnoepfe sprachen={land.sprachen} current={locale} label={k.landSprachen} />}
      </div>
    </section>
  );
  return <ServiceLanding intro={intro} checkHref={checkHref} />;
}
