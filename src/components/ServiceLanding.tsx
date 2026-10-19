import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { SERVICES, formatPrice } from "@/lib/services";
import { COMPANY, siteText } from "@/lib/company";
import { landingCopy, IMAGES } from "@/lib/landing-copy";
import { SchemaOrg } from "@/components/SchemaOrg";

// Startseite = Angebot, aufgebaut nach dem Konzept „Ehrlichkeit als Verkaufsargument“:
// Hero mit Grenze, Preis neben „Bitte beachte“, Das machen wir | nicht, realistische Erwartung, Muster, Selbstcheck, Ablauf, FAQ.
const Check = () => <span aria-hidden className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-700 text-[11px] font-bold text-white">✓</span>;
const Cross = () => <span aria-hidden className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-500 text-[11px] font-bold text-white">✕</span>;
const FACT_ICONS = [
  <path key="a" d="M4 21V9l8-6 8 6v12h-5v-6H9v6z" />,
  <path key="b" d="M4 6h16v4H4zm0 8h16v4H4zm3-6h.01M7 16h.01" />,
  <path key="c" d="M5 11V8a7 7 0 0 1 14 0v3M4 11h16v10H4z" />,
  <path key="d" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 9a7 7 0 0 1 14 0" />,
];

export async function ServiceLanding() {
  const { locale } = await getT();
  const session = await getSession();
  const c = landingCopy(locale);
  const st = siteText(locale);
  const price = formatPrice(SERVICES["bewerbung-25"].priceCents, locale);
  const isCandidate = session.userId && session.role === ROLE.CANDIDATE;
  const bookHref = isCandidate ? "/bewerbungsservice/buchen" : `/registrierung?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;
  const loginHref = isCandidate ? "/bewerbungsservice/buchen" : `/anmelden?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;

  return (
    <>
      <SchemaOrg />
      <SiteHeader />
      <main id="main" className="flex-1">
        {/* 1 · Hero: Versprechen und Grenze im selben Blick */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-12 md:py-16 grid gap-10 md:grid-cols-[1.15fr_1fr] items-center">
            <div>
              <span className="inline-block rounded-md bg-[color:var(--color-brand-soft)] px-3 py-1 text-xs font-bold tracking-widest text-[color:var(--color-brand-deep)]">{c.badge}</span>
              <h1 className="mt-4 text-3xl md:text-[2.7rem] font-bold leading-tight text-[color:var(--color-ink)]">{c.h1}</h1>
              <p className="mt-5 text-lg text-[color:var(--color-ink-soft)] leading-relaxed">{c.sub}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={bookHref} className="btn-primary px-7">{c.ctaStart}</Link>
                <Link href="/selbstcheck" className="btn-outline px-7">{c.ctaCheck}</Link>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm font-semibold text-emerald-800">
                {c.trust.map((x) => <li key={x}>✓ {x}</li>)}
              </ul>
              <p className="mt-3 text-sm italic text-[color:var(--color-ink-soft)]">{c.trustNote}</p>
            </div>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-slate-100 shadow-lg fade-stack">
              {IMAGES.hero.map((src, i) => (
                <figure key={src} className="absolute inset-0" style={{ animationDelay: `${i * 5}s` }}>
                  <Image src={src} alt={c.jobs[i]} fill priority={i === 0} sizes="(min-width: 768px) 480px, 100vw" className="object-cover" />
                  <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[color:var(--color-ink)]">{c.jobs[i]}</figcaption>
                </figure>
              ))}
            </div>
          </div>
          <div className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            <ul className="mx-auto max-w-6xl px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-[color:var(--color-ink-soft)]">
              {c.facts.map((f, i) => (
                <li key={f} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0 text-[color:var(--color-brand-deep)]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{FACT_ICONS[i]}</svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2 · Preis + „Bitte beachte“ in gleicher Höhe */}
        <section id="angebot" className="bg-white scroll-mt-16">
          <div className="mx-auto max-w-6xl px-6 py-14 grid gap-6 md:grid-cols-2">
            <div className="card flex flex-col">
              <div className="text-sm font-semibold text-[color:var(--color-ink-soft)]">{c.priceTitle}</div>
              <div className="mt-3 text-6xl font-bold text-[color:var(--color-brand-deep)]">{price}</div>
              <div className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{c.priceNote}</div>
              <div className="mt-auto pt-8 space-y-3">
                <Link href={loginHref} className="btn-primary w-full justify-center">{c.ctaLogin}</Link>
                {!session.userId && <Link href={bookHref} className="btn-outline w-full justify-center">{c.register}</Link>}
              </div>
            </div>
            <div className="rounded-2xl border-2 border-[#b58a1b] bg-[#fbf3e1] p-6">
              <h2 className="text-lg font-bold text-[#8a6511]">{c.careTitle}</h2>
              {c.care.map((p) => <p key={p} className="mt-3 text-[15px] leading-relaxed text-[color:var(--color-ink)]">{p}</p>)}
              <p className="mt-4 font-bold text-[color:var(--color-ink)]">{c.careStrong}</p>
            </div>
          </div>
        </section>

        {/* 3 · Das machen wir | Das machen wir nicht */}
        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold text-center">{c.doTitle}</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
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

        {/* 4 · Was du realistisch bekommst */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14 grid gap-8 md:grid-cols-[0.8fr_1.2fr] items-stretch">
            <div className="relative min-h-72 overflow-hidden rounded-2xl">
              <Image src={IMAGES.papers} alt="" fill sizes="(min-width: 768px) 400px, 100vw" className="object-cover" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{c.realTitle}</h2>
              <div className="mt-6 space-y-3">
                {c.real.map((r) => (
                  <div key={r.t} className="flex items-center gap-5 rounded-xl bg-[color:var(--color-surface)] p-4">
                    <div className="w-14 flex-shrink-0 text-center text-3xl font-bold text-[color:var(--color-brand-deep)]">{r.n}</div>
                    <div><div className="font-semibold">{r.t}</div><div className="text-sm text-[color:var(--color-ink-soft)]">{r.d}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Muster: echte Vorlage mit erfundener Person */}
        <section className="bg-[color:var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{c.sampleTitle}</h2>
            <p className="mt-2 text-[color:var(--color-ink-soft)]">{c.sampleLead}</p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {[{ img: "/muster/muster-lebenslauf.png", pdf: "/muster/muster-lebenslauf.pdf", label: c.sampleCv }, { img: "/muster/muster-anschreiben.png", pdf: "/muster/muster-anschreiben.pdf", label: c.sampleLetter }].map((m) => (
                <a key={m.img} href={m.pdf} target="_blank" className="group block">
                  <div className="relative overflow-hidden rounded-xl border border-[color:var(--color-border)] bg-white shadow-sm transition group-hover:shadow-md">
                    <Image src={m.img} alt={m.label} width={707} height={1000} className="h-auto w-full" />
                    <span className="absolute right-3 top-3 rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-xs font-semibold text-white">{c.sampleNote}</span>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-[color:var(--color-brand-deep)]">{m.label} (PDF) ↗</div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* 5 · Selbstcheck */}
        <section className="bg-white">
          <div className="mx-auto max-w-6xl px-6 py-14 grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">{c.checkTitle}</h2>
              <p className="mt-3 text-lg text-[color:var(--color-ink-soft)]">{c.checkLead}</p>
              <Link href="/selbstcheck" className="btn-primary mt-6 inline-flex">{c.checkBtn}</Link>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={IMAGES.talk} alt="" fill sizes="(min-width: 768px) 380px, 100vw" className="object-cover" />
            </div>
          </div>
        </section>

        {/* 6 · Ablauf */}
        <section id="ablauf" className="bg-[color:var(--color-surface)] scroll-mt-16">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{c.stepsTitle}</h2>
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {c.steps.map((s, i) => (
                <li key={s.t} className={`rounded-xl p-4 ${i === 0 ? "border-2 border-[color:var(--color-brand)] bg-white" : "bg-white"}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-brand-deep)] font-bold text-white">{i}</span>
                  <div className="mt-3 font-semibold">{s.t}</div>
                  <div className="text-sm text-[color:var(--color-ink-soft)]">{s.d}</div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 7 · FAQ */}
        <section id="faq" className="bg-white scroll-mt-16">
          <div className="mx-auto max-w-3xl px-6 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">{c.faqTitle}</h2>
            <div className="mt-6 space-y-3">
              {c.faq.map((f, i) => (
                <details key={f.q} className="card" open={i === 0}>
                  <summary className="cursor-pointer font-semibold text-[color:var(--color-brand-deep)]">{f.q}</summary>
                  <p className="mt-2 text-[color:var(--color-ink-soft)]">{f.a}</p>
                </details>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href={bookHref} className="btn-primary">{c.ctaStart}</Link>
              <Link href="/selbstcheck" className="btn-outline">{c.ctaCheck}</Link>
            </div>
          </div>
        </section>

        {/* 8 · Über WoYou · Kontakt */}
        <section id="ueber-uns" className="bg-[color:var(--color-surface)] scroll-mt-16">
          <div className="mx-auto max-w-6xl px-6 py-14 grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold">{st.aboutTitle}</h2>
              {st.about.map((p) => <p key={p} className="mt-4 text-[color:var(--color-ink-soft)] leading-relaxed">{p}</p>)}
            </div>
            <div id="kontakt" className="card scroll-mt-20">
              <h2 className="text-2xl font-bold">{st.contactTitle}</h2>
              <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">{st.contactLead}</p>
              <ul className="mt-5 space-y-2 text-sm">
                <li><a className="font-semibold text-[color:var(--color-brand-deep)]" href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></li>
                <li><a className="font-semibold text-[color:var(--color-brand-deep)]" href={`tel:${COMPANY.phone.replace(/\s/g, "")}`} dir="ltr">{COMPANY.phone}</a></li>
                <li>{st.hours}</li>
                <li className="text-[color:var(--color-ink-soft)]">{COMPANY.name} · {COMPANY.street} · {COMPANY.zipCity} · {COMPANY.register}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
