import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { rechtUi } from "@/lib/recht/ui-text";
import { KNOPF } from "@/lib/recht/vertrag";
import {
  WIDERRUF_TITEL, WIDERRUF_EINLEITUNG, WIDERRUF_ONLINE_PFAD, widerrufsbelehrung, widerrufsformular, FORMULAR_TITEL, FORMULAR_HINWEIS, FORMULAR_FUSSNOTE,
} from "@/lib/recht/widerruf-text";

export const metadata = { title: "Widerrufsbelehrung" };

// ANWALT PRÜFEN (26.10.2026): Muster-Widerrufsbelehrung für Dienstleistungen (Anlage 1 zu Art. 246a § 1 Abs. 2 S. 2 EGBGB)
// und Muster-Widerrufsformular (Anlage 2 EGBGB), Text in src/lib/recht/widerruf-text.ts (auch für die Buchungsbestätigung).
// Vor der Buchung erreichbar (Fußzeile, Bestellseite), ohne Anmeldung.
export default async function WiderrufPage() {
  const { locale } = await getT();
  const ui = rechtUi(locale);
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12" lang="de">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">{WIDERRUF_TITEL}</h1>
          {ui.germanOnly && <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]" lang={locale}>{ui.germanOnly}</p>}

          <div className="mt-6 space-y-3 text-sm leading-relaxed">
            {WIDERRUF_EINLEITUNG.map((p, i) => <p key={i}>{p}</p>)}
            <p><Link href={WIDERRUF_ONLINE_PFAD} className="btn-primary inline-flex">{KNOPF.widerrufen}</Link></p>
          </div>

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <h2 className="text-xl font-bold">{WIDERRUF_TITEL}</h2>
            {widerrufsbelehrung().map((a) => (
              <section key={a.titel} className="space-y-2">
                <h3 className="font-semibold text-base">{a.titel}</h3>
                {a.absaetze.map((p, i) => <p key={i}>{p}</p>)}
              </section>
            ))}
            <p className="font-semibold">Ende der Widerrufsbelehrung</p>
          </div>

          <div className="mt-8 card space-y-3 text-sm leading-relaxed">
            <h2 className="text-xl font-bold">{FORMULAR_TITEL}</h2>
            <p>{FORMULAR_HINWEIS}</p>
            <ul className="list-disc ps-5 space-y-2">
              {widerrufsformular().map((z, i) => <li key={i}>{z}</li>)}
            </ul>
            <p>{FORMULAR_FUSSNOTE}</p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
