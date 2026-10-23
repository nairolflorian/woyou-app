import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import { COMPANY } from "@/lib/company";
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export const metadata = { title: "AGB" };

// ANWALT PRÜFEN (Weg 1, 22.10.2026): §§ 1 bis 5 und der Hinweis in § 6 wurden für das neue Angebot
// (Unterlagen plus Bewerbungswerkzeug, kein Versand durch WoYou, keine Vermittlung) umgeschrieben.
// Preise und Laufzeiten kommen aus src/lib/angebot.ts (seit 23.10.2026: nur Startpaket, keine Verlängerung, kein Abo).
export default function AGB() {
  const p = formatPrice(ANGEBOT.startpaket.priceCents), months = ANGEBOT.startpaket.toolMonths;
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen</h1>

          {/* ANWALT PRÜFEN: Texte vor dem Start anwaltlich prüfen lassen (Hinweis nur im Code, nicht sichtbar) */}

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            {/* ANWALT PRÜFEN (Weg 1): Geltungsbereich auf das neue Angebot umgestellt */}
            <Section title="§ 1 Anbieter und Geltungsbereich">
              Anbieter ist die {COMPANY.name}, {COMPANY.street}, {COMPANY.zipCity}, vertreten durch den Geschäftsführer {COMPANY.ceo}, eingetragen beim {COMPANY.court} unter {COMPANY.register}. Kontakt: {COMPANY.email}. Diese AGB gelten für das Angebot
              „Bewerbungsunterlagen plus Bewerbungswerkzeug“ von WoYou, das Verbraucher:innen über woyou.de buchen.
            </Section>
            {/* ANWALT PRÜFEN (Weg 1): Leistung ohne Stellenauswahl, ohne Versand, ohne Vermittlung */}
            <Section title="§ 2 Leistung">
              Wir erstellen mit dir Bewerbungsunterlagen nach deutschem Standard: einen Lebenslauf und eine
              Anschreiben-Vorlage, die wir prüfen und bei Bedarf korrigieren. Dazu bekommst du für die gebuchte
              Zeit Zugang zum Bewerbungswerkzeug: eine Stellensuche über öffentliche Stellenbörsen, ein Anschreiben
              für jede Stelle, die du dort selbst auswählst, und eine eigene Übersicht deiner Bewerbungen.
              Du suchst und wählst die Stellen selbst aus, verschickst deine Bewerbungen selbst und bekommst alle
              Antworten direkt. Wir vermitteln keine Arbeitsstellen, haben keinen Kontakt zu Arbeitgebern und
              verschicken keine Bewerbungen. Wir schulden die sorgfältige Erstellung der Unterlagen und die
              Bereitstellung des Werkzeugs, nicht eine Einladung oder einen Arbeitsvertrag.
            </Section>
            {/* ANWALT PRÜFEN (Weg 1): Mitwirkung; keine Erstattung je nicht versendeter Bewerbung mehr */}
            <Section title="§ 3 Ablauf und Mitwirkung">
              Nach der Buchung füllst du deine Bewerbungsmappe aus oder lädst deinen eigenen Lebenslauf hoch.
              Wir prüfen die Mappe und geben sie frei, sobald deine Unterlagen fertig sind. Deine Angaben müssen
              wahr und vollständig sein. Anschreiben aus dem Werkzeug sind Vorschläge auf Grundlage deiner Angaben
              und der Stellenanzeige. Bitte prüfe jedes Anschreiben, bevor du es verwendest. Die Stellenanzeigen
              stammen von Dritten; für ihren Inhalt und ihre Aktualität sind die jeweiligen Anbieter verantwortlich.
            </Section>
            {/* ANWALT PRÜFEN (Weg 1): frühere Vollmacht zum Versand entfällt ersatzlos */}
            <Section title="§ 4 Laufzeit des Werkzeugs">
              Das Startpaket enthält {months} Monate Zugang zum Bewerbungswerkzeug ab Zahlungseingang. Danach
              endet der Zugang automatisch, ohne dass du kündigen musst. Eine Verlängerung oder ein Abo bieten wir
              nicht an. Nach Ablauf sind Stellensuche und deine Übersicht „Meine Bewerbungen“ gesperrt. Deine
              Unterlagen (Lebenslauf, Anschreiben-Vorlage) und die Anschreiben, die du zu deinen Stellen erstellt hast,
              kannst du auch danach als PDF herunterladen.
            </Section>
            {/* ANWALT PRÜFEN (23.10.2026): nur noch Einmalzahlung, keine Verlängerung, kein Abo (Werte aus src/lib/angebot.ts) */}
            <Section title="§ 5 Preis und Zahlung">
              Das Startpaket kostet einmalig {p} inklusive Umsatzsteuer. Weitere Kosten entstehen nicht, es gibt
              keine wiederkehrenden Zahlungen. Die Zahlung erfolgt online über Stripe.
            </Section>
            {/* ANWALT PRÜFEN (Weg 1): Widerruf bei sofortiger Freischaltung des Werkzeugs (digitale Leistung) */}
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
              {/* ANWALT PRÜFEN (23.10.2026): Verweis auf die Weitergabe an das CRM der EuBiA-Gruppe */}
              Es gilt unsere Datenschutzerklärung. Dort steht auch, welche Angaben wir zur Kundenbetreuung und
              Abrechnung an das interne CRM der EuBiA-Gruppe übermitteln (Abschnitt 5).
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
