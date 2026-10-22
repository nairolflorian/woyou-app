import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import { COMPANY } from "@/lib/company";
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export const metadata = { title: "AGB" };

// ANWALT PRÜFEN (Weg 1, 22.10.2026): §§ 1 bis 5 und der Hinweis in § 6 wurden für das neue Angebot
// (Unterlagen plus Bewerbungswerkzeug, kein Versand durch WoYou, keine Vermittlung) umgeschrieben.
// Preise und Laufzeiten kommen aus src/lib/angebot.ts (Platzhalter, Rachid legt sie fest).
export default function AGB() {
  const p = formatPrice(ANGEBOT.startpaket.priceCents), months = ANGEBOT.startpaket.toolMonths;
  const month = formatPrice(ANGEBOT.verlaengerung.priceCents), abo = formatPrice(ANGEBOT.abo.priceCents);
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
            {/* ANWALT PRÜFEN (Weg 1): Geltungsbereich auf das neue Angebot umgestellt */}
            <Section title="§ 1 Anbieter und Geltungsbereich">
              Anbieter ist die {COMPANY.name}, {COMPANY.street}, {COMPANY.zipCity}. Diese AGB gelten für das Angebot
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
              endet der Zugang automatisch, ohne dass du kündigen musst. Deine Unterlagen und die Anschreiben, die du
              erstellt hast, kannst du auch danach herunterladen; deine Übersicht bleibt lesbar.
            </Section>
            {/* ANWALT PRÜFEN (Weg 1): Preise, Verlängerung und Abo (Werte aus src/lib/angebot.ts) */}
            <Section title="§ 5 Preis und Zahlung">
              Das Startpaket kostet einmalig {p} inklusive Umsatzsteuer. Danach kannst du das Werkzeug für {month} um
              einen Monat verlängern (endet automatisch) oder ein Abo zu {abo} im Monat abschließen. Das Abo beginnt,
              wenn dein bezahlter Zeitraum endet, verlängert sich monatlich und ist jederzeit zum Ende des bezahlten
              Monats kündbar, direkt in deinem Bereich auf woyou.de. Die Zahlung erfolgt online über Stripe.
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
