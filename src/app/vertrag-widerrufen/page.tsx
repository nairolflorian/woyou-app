import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WiderrufForm } from "@/components/WiderrufForm";
import { getT } from "@/lib/i18n";
import { rechtUi } from "@/lib/recht/ui-text";
import { KNOPF, ERSTATTUNGSFRIST_TAGE } from "@/lib/recht/vertrag";
import { vorbelegung } from "@/lib/recht/vorbelegung";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Vertrag widerrufen" };
export const dynamic = "force-dynamic";

// ANWALT PRÜFEN (26.10.2026): Online-Widerruf ohne Anmeldung, sofortige Eingangsbestätigung per E-Mail und zum Speichern.
export default async function VertragWiderrufenPage() {
  const { locale } = await getT();
  const ui = rechtUi(locale);
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-12" lang="de">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">{KNOPF.widerrufen}</h1>
          {ui.germanOnly && <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]" lang={locale}>{ui.germanOnly}</p>}
          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p>Hier kannst du deinen Vertrag über das Startpaket innerhalb der Widerrufsfrist von 14 Tagen widerrufen. Du musst dich dafür nicht anmelden und keinen Grund nennen.</p>
            <p>Nach dem Klick auf „{KNOPF.widerrufBestaetigen}“ bekommst du sofort eine Bestätigung mit Datum und Uhrzeit des Eingangs, hier auf der Seite und per E-Mail. Den Preis erstatten wir innerhalb von {ERSTATTUNGSFRIST_TAGE} Tagen, abzüglich eines anteiligen Betrags für Leistungen, die wir auf deinen Wunsch schon erbracht haben.</p>
            <p>Alles zum Widerrufsrecht steht in der <Link href="/widerruf" className="underline">Widerrufsbelehrung</Link>. Du kannst auch per E-Mail an {COMPANY.legalEmail} oder per Brief widerrufen.</p>
          </div>
          <WiderrufForm knopf={KNOPF.widerrufBestaetigen} defaults={await vorbelegung()} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
