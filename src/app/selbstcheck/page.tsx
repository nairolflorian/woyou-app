import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SelfCheck } from "@/components/SelfCheck";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { landingCopy } from "@/lib/landing-copy";
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export const metadata: Metadata = { title: "Selbstcheck", description: "60 Sekunden, kostenlos: Lohnen sich Unterlagen und Bewerbungswerkzeug für dein Profil?" };

export default async function SelbstcheckPage() {
  const { locale } = await getT();
  const s = await getSession();
  const c = landingCopy(locale);
  const bookHref = s.userId && s.role === ROLE.CANDIDATE ? "/bewerbungsservice/buchen" : `/registrierung?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h1 className="text-3xl font-bold">{c.checkTitle}</h1>
          <p className="mt-2 mb-8 text-[color:var(--color-ink-soft)]">{c.checkLead}</p>
          <SelfCheck locale={locale} bookHref={bookHref} block={process.env.SELFCHECK_MODE === "block"} price={formatPrice(ANGEBOT.startpaket.priceCents, locale)} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
