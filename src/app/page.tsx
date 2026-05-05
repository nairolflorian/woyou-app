import Link from "next/link";
import Image from "next/image";
import { getT } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JOB_GROUPS } from "@/lib/jobs";

export default async function HomePage() {
  const { t, locale } = await getT();
  const localizedGroup = (slug: string) => {
    const g = JOB_GROUPS[slug];
    return (g as Record<string, string>)[locale] ?? g.de;
  };

  return (
    <>
      <SiteHeader />

      {/* DEMO BANNER */}
      <div className="bg-amber-100 border-b border-amber-300 text-amber-900 text-sm">
        <div className="mx-auto max-w-6xl px-6 py-2 flex flex-wrap items-center justify-between gap-2">
          <span>
            🎬 Das ist eine <strong>klickbare Demo</strong>. Auf der Test-Seite
            kannst du mit einem Klick zwischen allen Rollen wechseln.
          </span>
          <Link href="/demo" className="font-semibold underline hover:no-underline">
            Zur Test-Übersicht →
          </Link>
        </div>
      </div>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#6F9EAB] via-[#5a8a97] to-[#3f6f7d]" />
        <div className="absolute inset-0 -z-10 opacity-30 mix-blend-overlay">
          <Image
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1600&q=80"
            alt=""
            fill
            priority
            className="object-cover"
          />
        </div>
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32 text-white">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-widest backdrop-blur">
            {t("home.hero_badge")}
          </span>
          <h1 className="mt-6 text-4xl md:text-6xl font-bold leading-tight max-w-3xl">
            {t("home.hero_title")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/90 leading-relaxed">
            {t("home.hero_subtitle")}
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/registrierung"
              className="inline-flex items-center justify-center rounded-full bg-white text-[color:var(--color-brand)] font-semibold px-8 py-3 hover:bg-white/90 transition"
            >
              {t("home.hero_btn_start")}
            </Link>
            <Link
              href="#prozess"
              className="inline-flex items-center justify-center rounded-full border-2 border-white/80 text-white font-semibold px-8 py-3 hover:bg-white/10 transition"
            >
              {t("home.hero_btn_more")}
            </Link>
            <Link
              href="/registrierung/telegram"
              className="inline-flex items-center gap-2 rounded-full bg-[#229ED9] text-white font-semibold px-6 py-3 hover:bg-[#1d8cc1] transition"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
              </svg>
              {t("home.hero_btn_telegram")}
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-white border-b border-[color:var(--color-border)]">
        <div className="mx-auto max-w-6xl px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: "500+", k: "home.stats_partners" },
            { n: "50+", k: "home.stats_countries" },
            { n: "1.000+", k: "home.stats_placements" },
          ].map((s) => (
            <div key={s.k}>
              <div className="text-3xl md:text-4xl font-bold text-[color:var(--color-brand)]">
                {s.n}
              </div>
              <div className="mt-1 text-sm text-[color:var(--color-ink-soft)]">
                {t(s.k)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PROZESS */}
      <section id="prozess" className="bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-tag">{t("home.process_badge")}</span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("home.process_title")}
            </h2>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              {t("home.process_subtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="card text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] flex items-center justify-center text-xl font-bold">
                  {n}
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {t(`home.process_step${n}_title`)}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  {t(`home.process_step${n}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VORTEILE */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-tag">{t("home.benefits_badge")}</span>
            <h2 className="text-3xl md:text-4xl font-bold">
              {t("home.benefits_title")}
            </h2>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              {t("home.benefits_subtitle")}
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { i: "🌍", k: 1 },
              { i: "📋", k: 2 },
              { i: "👥", k: 3 },
              { i: "💬", k: 4 },
              { i: "🛬", k: 5 },
              { i: "💰", k: 6 },
            ].map((b) => (
              <div key={b.k} className="card">
                <div className="text-4xl">{b.i}</div>
                <h3 className="mt-4 text-lg font-semibold">
                  {t(`home.benefits_card${b.k}_title`)}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">
                  {t(`home.benefits_card${b.k}_desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BERUFE */}
      <section className="bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="section-tag">{t("nav.berufe")}</span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Welche Berufe vermitteln wir?
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {Object.entries(JOB_GROUPS).map(([slug, g]) => (
              <div key={slug} className="card flex items-center gap-4">
                <div className="text-3xl">{g.icon}</div>
                <div className="font-semibold">{localizedGroup(slug)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FÜR UNTERNEHMEN */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="rounded-2xl overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=900&q=80"
              alt=""
              width={900}
              height={600}
              className="w-full h-auto"
            />
          </div>
          <div>
            <span className="section-tag">{t("nav.arbeitgeber")}</span>
            <h2 className="text-3xl md:text-4xl font-bold">
              Fachkräftemangel lösen
            </h2>
            <p className="mt-3 text-[color:var(--color-ink-soft)]">
              Zugang zu einem Pool internationaler Talente — voll begleitet
              von der Auswahl bis zur Integration.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Vorgefilterte Kandidaten mit Sprachtest-Niveau",
                "Direktkontakt nach gegenseitiger Zustimmung",
                "Visa- & Onboarding-Support inklusive",
                "Faires Pay-per-Hire-Modell",
              ].map((line) => (
                <li key={line} className="flex gap-3">
                  <span className="mt-0.5 text-[color:var(--color-brand)]">✓</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/arbeitgeber/registrierung"
              className="btn-primary mt-8"
            >
              Als Unternehmen starten
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[color:var(--color-brand)] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            {t("home.cta_title")}
          </h2>
          <p className="mt-3 text-white/90">{t("home.cta_subtitle")}</p>
          <Link
            href="/registrierung"
            className="inline-flex items-center justify-center mt-8 rounded-full bg-white text-[color:var(--color-brand)] font-semibold px-8 py-3 hover:bg-white/90 transition"
          >
            {t("home.cta_btn")}
          </Link>
        </div>
      </section>

      <SiteFooter />
    </>
  );
}
