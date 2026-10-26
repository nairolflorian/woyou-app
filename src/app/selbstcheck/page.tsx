import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SelfCheck } from "@/components/SelfCheck";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { landingCopy } from "@/lib/landing-copy";
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { rechtUi } from "@/lib/recht/ui-text";
import { selbstcheckVorbelegung } from "@/lib/laender";
import { kampagneLang } from "@/lib/kampagne-text";
import { erlaubtesNext } from "@/lib/selbstcheck-vorbuchung";
import { selbstcheckVorBuchungAn } from "@/lib/selbstcheck-vorbuchung-server";
import { vorBuchungText } from "@/lib/selbstcheck-vorbuchung-text";

export const metadata: Metadata = { title: "Selbstcheck", description: "60 Sekunden, kostenlos: Lohnen sich Unterlagen und Bewerbungswerkzeug für dein Profil?" };

type Params = { land?: string | string[]; gruppe?: string | string[]; next?: string | string[] };
const eins = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);

// ?land=RS (BA, ME, XK, AL, MK, IN) belegt das Land mit dem Namen in der aktuellen Sprache vor, ?gruppe=ce die Berufsgruppe
export default async function SelbstcheckPage({ searchParams }: { searchParams: Promise<Params> }) {
  const { locale } = await getT();
  const s = await getSession();
  const c = landingCopy(locale);
  const sp = await searchParams;
  const vor = selbstcheckVorbelegung({ land: eins(sp.land), gruppe: eins(sp.gruppe) }, kampagneLang(locale));
  // Schalter „Selbstcheck vor der Buchung“: Ergebnis merken; mit ?next=/bewerbungsservice/buchen heißt der Knopf „Weiter zur Buchung“
  const vorBuchung = selbstcheckVorBuchungAn();
  const nextLabel = vorBuchung && erlaubtesNext(eins(sp.next)) ? vorBuchungText(locale).nextBook : undefined;
  const bookHref = s.userId && s.role === ROLE.CANDIDATE ? "/bewerbungsservice/buchen" : `/registrierung?next=${encodeURIComponent("/bewerbungsservice/buchen")}`;
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <h1 className="text-3xl font-bold">{c.checkTitle}</h1>
          <p className="mt-2 mb-8 text-[color:var(--color-ink-soft)]">{c.checkLead}</p>
          <SelfCheck locale={locale} bookHref={bookHref} block={process.env.SELFCHECK_MODE === "block"} price={`${formatPrice(ANGEBOT.startpaket.priceCents, locale)} ${rechtUi(locale).vat}`} initialCountry={vor.country} initialGroup={vor.group} merken={vorBuchung} nextLabel={nextLabel} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
