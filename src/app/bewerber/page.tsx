import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { serviceCopy, SERVICES, formatPrice } from "@/lib/services";

export const metadata: Metadata = { title: "Für Bewerber:innen" };

// Einstieg für Bewerber:innen – nutzt die übersetzten Texte der Startseite (7 Sprachen)
export default async function CandidateLanding() {
  const { t, locale } = await getT();
  const session = await getSession();
  const sc = serviceCopy(locale);
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="bg-gradient-to-br from-[#6F9EAB] to-[#3f6f7d] text-white">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-widest">{t("home.hero_badge")}</span>
            <h1 className="mt-4 text-4xl md:text-5xl font-bold">{t("nav.bewerber")}</h1>
            <p className="mt-4 max-w-2xl text-white/90 text-lg">{t("home.hero_subtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={session.userId ? "/profil" : "/registrierung"} className="inline-flex items-center justify-center rounded-full bg-white text-[color:var(--color-brand)] font-semibold px-8 py-3">{session.userId ? t("nav.dashboard") : t("home.hero_btn_start")}</Link>
              <Link href="/sprachtest" className="inline-flex items-center justify-center rounded-full border-2 border-white/80 text-white font-semibold px-8 py-3">{t("test.title")}</Link>
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-tag">{t("home.process_badge")}</span>
              <h2 className="text-3xl font-bold">{t("home.process_title")}</h2>
              <p className="mt-3 text-[color:var(--color-ink-soft)]">{t("home.process_subtitle")}</p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="card text-center">
                  <div className="mx-auto h-12 w-12 rounded-full bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] flex items-center justify-center text-xl font-bold">{n}</div>
                  <h3 className="mt-4 text-lg font-semibold">{t(`home.process_step${n}_title`)}</h3>
                  <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{t(`home.process_step${n}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="card flex flex-wrap items-center justify-between gap-6 border-[color:var(--color-brand)]">
              <div className="max-w-2xl">
                <span className="section-tag">{sc.badge}</span>
                <h2 className="text-2xl font-bold">{sc.title}</h2>
                <p className="mt-2 text-[color:var(--color-ink-soft)]">{sc.lead}</p>
              </div>
              <Link href="/bewerbungsservice" className="btn-primary">{sc.cta} · {formatPrice(SERVICES["bewerbung-25"].priceCents, locale)}</Link>
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="text-center max-w-2xl mx-auto">
              <span className="section-tag">{t("home.benefits_badge")}</span>
              <h2 className="text-3xl font-bold">{t("home.benefits_title")}</h2>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {[["🌍", 1], ["📋", 2], ["👥", 3], ["💬", 4], ["🛬", 5], ["💰", 6]].map(([i, k]) => (
                <div key={k} className="card">
                  <div className="text-4xl">{i}</div>
                  <h3 className="mt-4 text-lg font-semibold">{t(`home.benefits_card${k}_title`)}</h3>
                  <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{t(`home.benefits_card${k}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
