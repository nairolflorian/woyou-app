import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import { COMPANY } from "@/lib/company";

export const metadata = { title: "AGB" };

export default function AGB() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            Entwurf. Wird vor dem Start anwaltlich geprüft.
          </div>

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <Section title="§ 1 Anbieter und Geltungsbereich">
              Anbieter ist die {COMPANY.name}, {COMPANY.street}, {COMPANY.zipCity}. Diese AGB gelten für den
              Bewerbungs-Service von WoYou, den Verbraucher:innen über woyou.de buchen.
            </Section>
            <Section title="§ 2 Leistung">
              Wir erstellen einen Lebenslauf nach deutschem Standard und für jede ausgewählte Stelle ein
              Anschreiben, suchen passende Stellen und verschicken bis zu 25 Bewerbungen in deinem Namen per
              E-Mail an die in der Stellenanzeige genannte Adresse. Du erhältst von jeder Bewerbung eine Kopie.
              Wir schulden die sorgfältige Erstellung und den Versand der Bewerbungen, nicht eine Einladung
              oder einen Arbeitsvertrag. Die Entscheidung trifft immer der Arbeitgeber.
            </Section>
            <Section title="§ 3 Ablauf und Mitwirkung">
              Nach der Buchung füllst du deine Bewerbungsmappe aus oder lädst deinen eigenen Lebenslauf hoch.
              Vor dem ersten Versand prüfen wir die Mappe und geben sie gemeinsam mit dir frei. Deine Angaben
              müssen wahr und vollständig sein. Sind keine 25 passenden Stellen zu finden, besprechen wir mit
              dir, wie wir die Suche erweitern.
            </Section>
            <Section title="§ 4 Vollmacht">
              Mit der Buchung bevollmächtigst du uns, Bewerbungen in deinem Namen an die ausgewählten Stellen zu
              senden. Du kannst die Vollmacht jederzeit widerrufen. Bereits verschickte Bewerbungen bleiben
              davon unberührt.
            </Section>
            <Section title="§ 5 Preis und Zahlung">
              Der Preis beträgt einmalig 199 € inklusive Umsatzsteuer. Es gibt kein Abo und keine weiteren
              Kosten. Die Zahlung erfolgt bei der Buchung online über Stripe.
            </Section>
            <Section title="§ 6 Widerrufsrecht">
              Als Verbraucher:in hast du ein Widerrufsrecht von 14 Tagen ab Vertragsschluss. Verlangst du
              ausdrücklich, dass wir vor Ablauf der Frist beginnen, musst du im Fall des Widerrufs einen
              anteiligen Betrag für die bis dahin erbrachten Leistungen zahlen. Das Widerrufsrecht erlischt,
              wenn wir die Leistung vollständig erbracht haben. Die ausführliche Widerrufsbelehrung erhältst du
              mit der Buchungsbestätigung.
            </Section>
            <Section title="§ 7 Haftung">
              Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben,
              Körper oder Gesundheit. Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher
              Vertragspflichten und begrenzt auf den vorhersehbaren, typischen Schaden.
            </Section>
            <Section title="§ 8 Datenschutz">
              Es gilt unsere Datenschutzerklärung.
            </Section>
            <Section title="§ 9 Schlussbestimmungen">
              Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates bleiben
              unberührt.
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
