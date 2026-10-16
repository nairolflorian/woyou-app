import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { SERVICES, serviceCopy, formatPrice } from "@/lib/services";

export const metadata: Metadata = {
  title: "Bewerbungs-Service: 25 Bewerbungen für 199 €",
  description: "Wir erstellen deinen Lebenslauf nach deutschem Standard und verschicken 25 passende Bewerbungen in deinem Namen. Einmalig 199 €.",
};

export default async function ApplicationServicePage() {
  const { locale } = await getT();
  const session = await getSession();
  const c = serviceCopy(locale);
  const svc = SERVICES["bewerbung-25"];
  const isCandidate = session.userId && session.role === ROLE.CANDIDATE;
  const bookHref = isCandidate ? "/bewerbungsservice/buchen" : `/anmelden?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;
  const registerHref = `/registrierung?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1">
        <section className="bg-gradient-to-br from-[#6F9EAB] to-[#3f6f7d] text-white">
          <div className="mx-auto max-w-6xl px-6 py-20 grid gap-10 md:grid-cols-[1.4fr_1fr] items-center">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold tracking-widest">{c.badge}</span>
              <h1 className="mt-4 text-3xl md:text-5xl font-bold leading-tight">{c.title}</h1>
              <p className="mt-4 max-w-2xl text-white/90 text-lg">{c.lead}</p>
            </div>
            <div className="rounded-2xl bg-white text-[color:var(--color-ink)] p-7 shadow-xl">
              <div className="text-sm font-semibold text-[color:var(--color-ink-soft)]">{c.summary}</div>
              <div className="mt-2 text-5xl font-bold text-[color:var(--color-brand)]">{formatPrice(svc.priceCents, locale)}</div>
              <div className="text-sm text-[color:var(--color-ink-soft)]">{c.priceNote}</div>
              <Link href={bookHref} className="btn-primary mt-6 w-full justify-center">{isCandidate ? c.cta : c.ctaLogin}</Link>
              {!session.userId && (
                <Link href={registerHref} className="btn-outline mt-3 w-full justify-center">{locale === "de" ? "Noch kein Konto? Kostenlos registrieren" : locale === "fr" ? "Pas encore de compte ? Inscription gratuite" : locale === "ar" ? "ليس لديك حساب؟ سجّل مجانًا" : "No account yet? Register for free"}</Link>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{c.includedTitle}</h2>
              <ul className="mt-6 space-y-3">
                {c.included.map((x) => (
                  <li key={x} className="flex gap-3"><span className="mt-0.5 text-[color:var(--color-brand)] font-bold">✓</span><span>{x}</span></li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{c.stepsTitle}</h2>
              <ol className="mt-6 space-y-4">
                {c.steps.map((s, i) => (
                  <li key={s.t} className="card flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[color:var(--color-brand)] text-white font-bold">{i + 1}</span>
                    <div><div className="font-semibold">{s.t}</div><p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{s.d}</p></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-16 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{c.goodTitle}</h2>
              <ul className="mt-6 space-y-3 text-[color:var(--color-ink-soft)]">
                {c.good.map((x) => <li key={x} className="flex gap-3"><span>ℹ️</span><span>{x}</span></li>)}
              </ul>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{c.faqTitle}</h2>
              <div className="mt-6 space-y-3">
                {c.faq.map((f) => (
                  <details key={f.q} className="card">
                    <summary className="cursor-pointer font-semibold">{f.q}</summary>
                    <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-6xl px-6 pb-16 text-center">
            <Link href={bookHref} className="btn-primary">{isCandidate ? c.cta : c.ctaLogin} · {formatPrice(svc.priceCents, locale)}</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
