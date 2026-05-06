import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "AGB — WoYou" };

export default function AGB() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            ⚠ <strong>Demo-Platzhalter.</strong> Vor Produktivstart
            individuell ausarbeiten lassen — diese Skizze ersetzt keine
            Rechtsberatung.
          </div>

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <Section title="§ 1 Geltungsbereich">
              Diese AGB gelten für die Nutzung der WoYou-Vermittlungsplattform
              durch Bewerber:innen und Unternehmen.
            </Section>
            <Section title="§ 2 Leistung">
              WoYou vermittelt internationale Fachkräfte an deutsche
              Unternehmen, unterstützt bei Sprachtest, Profil-Erstellung,
              Visa- und Anerkennungs­prozessen sowie der Ankunft in Deutschland.
            </Section>
            <Section title="§ 3 Kosten">
              Für Bewerber:innen ist die Profil-Freischaltung kostenpflichtig
              (Höhe wie auf der Plattform angegeben). Für Unternehmen gelten
              die individuell vereinbarten Vermittlungsgebühren.
            </Section>
            <Section title="§ 4 Pflichten der Nutzer">
              Wahrheitsgemäße Angaben; keine Weitergabe von Login-Daten;
              respektvoller Umgang in der Kommunikation.
            </Section>
            <Section title="§ 5 Datenschutz">
              Es gilt die separate Datenschutzerklärung.
            </Section>
            <Section title="§ 6 Haftung">
              Wir übernehmen keine Garantie für ein erfolgreiches Vermittlungs­ergebnis.
              Haftung nur bei Vorsatz und grober Fahrlässigkeit.
            </Section>
            <Section title="§ 7 Schlussbestimmungen">
              Es gilt deutsches Recht. Gerichtsstand soweit zulässig der Sitz
              der WoYou GmbH.
            </Section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-semibold text-base">{title}</h2>
      <p>{children}</p>
    </section>
  );
}
