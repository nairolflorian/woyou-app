import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { KuendigungForm } from "@/components/KuendigungForm";
import { getT } from "@/lib/i18n";
import { rechtUi } from "@/lib/recht/ui-text";
import { KNOPF, VERTRAG_KUENDBAR } from "@/lib/recht/vertrag";
import { vorbelegung } from "@/lib/recht/vorbelegung";
import { ANGEBOT } from "@/lib/angebot";

export const metadata = { title: "Verträge hier kündigen" };
export const dynamic = "force-dynamic";

// ANWALT PRÜFEN (26.10.2026): Kündigungsbutton nach § 312k BGB. Die Fußzeile („Verträge hier kündigen“) ist die
// Kündigungsschaltfläche, diese Seite die Bestätigungsseite mit den Angaben und dem Knopf „jetzt kündigen“.
// Ohne Anmeldung. Nach dem Absenden: Eingangsbestätigung mit Datum, Uhrzeit und Vertragsende (Seite und E-Mail).
export default async function VertragKuendigenPage() {
  const { locale } = await getT();
  const ui = rechtUi(locale);
  const heute = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-12" lang="de">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">{KNOPF.kuendigen}</h1>
          {ui.germanOnly && <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]" lang={locale}>{ui.germanOnly}</p>}
          <div className="mt-4 space-y-2 text-sm leading-relaxed">
            <p>Hier kündigst du deinen Vertrag über das Bewerbungswerkzeug. Du musst dich dafür nicht anmelden.</p>
            <p>Gut zu wissen: Das Werkzeug ist im Startpaket für {ANGEBOT.startpaket.toolMonths} Monate enthalten und endet danach automatisch, ohne Kündigung und ohne Verlängerung. In der Bestätigung steht das genaue Vertragsende.</p>
            <p>Trag unten deine Angaben ein und klick auf „{KNOPF.jetztKuendigen}“. Du bekommst sofort eine Bestätigung mit Datum und Uhrzeit, hier auf der Seite und per E-Mail.</p>
          </div>
          <KuendigungForm knopf={KNOPF.jetztKuendigen} vertrag={VERTRAG_KUENDBAR} heute={heute} defaults={await vorbelegung()} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
