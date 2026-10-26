// AGB von WoYou als Text (eine Quelle für die Seite /agb und die Buchungsbestätigung per E-Mail).
// Ohne Server-Importe, damit auch Tests und das Skript für docs/Buchungsbestaetigung_Text.md es nutzen können.
//
// ANWALT PRÜFEN (Weg 1, 22.10.2026): §§ 1 bis 5 und der Hinweis in § 6 wurden für das neue Angebot
// (Unterlagen plus Bewerbungswerkzeug, kein Versand durch WoYou, keine Vermittlung) umgeschrieben.
// ANWALT PRÜFEN (26.10.2026): § 3 Satz 1 bis 5 (Vertragsschluss) und § 7 Satz 2 (Kardinalpflichten) nach den
// Hinweisen der Anwältin übernommen. §§ 1, 2, 4, 5, 6, 8 und 9 unverändert. Ein Satz zur Verbraucherschlichtung
// steht bewusst nicht in § 9: KarriereKind hat weniger als 10 Beschäftigte (bestätigt am 26.10.2026).
// Preise und Laufzeiten kommen aus src/lib/angebot.ts (seit 23.10.2026: nur Startpaket, keine Verlängerung, kein Abo).
import { COMPANY } from "@/lib/company";
import { ANGEBOT, formatPrice } from "@/lib/angebot";

export const AGB_TITEL = "Allgemeine Geschäftsbedingungen";

/** § 3, neu am Anfang (wörtlich nach Vorgabe der Anwältin, 26.10.2026) */
export const AGB_S3_VERTRAGSSCHLUSS =
  "Mit dem Klick auf „Zahlungspflichtig buchen“ buchst du verbindlich. Der Vertrag kommt mit unserer Buchungsbestätigung per E-Mail zustande. Vor dem Klick kannst du deine Angaben auf der Bestellseite prüfen und ändern. Den Vertragstext speichern wir und schicken ihn dir mit AGB und Widerrufsbelehrung in der Buchungsbestätigung. Der Vertrag wird auf Deutsch geschlossen.";

/** § 7 Satz 2 (wörtlich nach Vorgabe der Anwältin, 26.10.2026) */
export const AGB_S7_SATZ2 =
  "Bei leichter Fahrlässigkeit haften wir nur bei Verletzung wesentlicher Vertragspflichten, also von Pflichten, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst, und begrenzt auf den vorhersehbaren, typischen Schaden. Die Haftung nach dem Produkthaftungsgesetz und deine gesetzlichen Gewährleistungsrechte bleiben unberührt.";

export type AgbAbschnitt = { titel: string; text: string };

export function agbAbschnitte(): AgbAbschnitt[] {
  const p = formatPrice(ANGEBOT.startpaket.priceCents), months = ANGEBOT.startpaket.toolMonths;
  return [
    {
      titel: "§ 1 Anbieter und Geltungsbereich",
      text: `Anbieter ist die ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}, vertreten durch den Geschäftsführer ${COMPANY.ceo}, eingetragen beim ${COMPANY.court} unter ${COMPANY.register}. Kontakt: ${COMPANY.email}. Diese AGB gelten für das Angebot „Bewerbungsunterlagen plus Bewerbungswerkzeug“ von WoYou, das Verbraucher:innen über woyou.de buchen.`,
    },
    {
      titel: "§ 2 Leistung",
      text: "Wir erstellen mit dir Bewerbungsunterlagen nach deutschem Standard: einen Lebenslauf und eine Anschreiben-Vorlage, die wir prüfen und bei Bedarf korrigieren. Dazu bekommst du für die gebuchte Zeit Zugang zum Bewerbungswerkzeug: eine Stellensuche über öffentliche Stellenbörsen, ein Anschreiben für jede Stelle, die du dort selbst auswählst, und eine eigene Übersicht deiner Bewerbungen. Du suchst und wählst die Stellen selbst aus, verschickst deine Bewerbungen selbst und bekommst alle Antworten direkt. Wir vermitteln keine Arbeitsstellen, haben keinen Kontakt zu Arbeitgebern und verschicken keine Bewerbungen. Wir schulden die sorgfältige Erstellung der Unterlagen und die Bereitstellung des Werkzeugs, nicht eine Einladung oder einen Arbeitsvertrag.",
    },
    {
      titel: "§ 3 Ablauf und Mitwirkung",
      text: `${AGB_S3_VERTRAGSSCHLUSS} Nach der Buchung füllst du deine Bewerbungsmappe aus oder lädst deinen eigenen Lebenslauf hoch. Wir prüfen die Mappe und geben sie frei, sobald deine Unterlagen fertig sind. Deine Angaben müssen wahr und vollständig sein. Anschreiben aus dem Werkzeug sind Vorschläge auf Grundlage deiner Angaben und der Stellenanzeige. Bitte prüfe jedes Anschreiben, bevor du es verwendest. Die Stellenanzeigen stammen von Dritten; für ihren Inhalt und ihre Aktualität sind die jeweiligen Anbieter verantwortlich.`,
    },
    {
      titel: "§ 4 Laufzeit des Werkzeugs",
      text: `Das Startpaket enthält ${months} Monate Zugang zum Bewerbungswerkzeug ab Zahlungseingang. Danach endet der Zugang automatisch, ohne dass du kündigen musst. Eine Verlängerung oder ein Abo bieten wir nicht an. Nach Ablauf sind Stellensuche und deine Übersicht „Meine Bewerbungen“ gesperrt. Deine Unterlagen (Lebenslauf, Anschreiben-Vorlage) und die Anschreiben, die du zu deinen Stellen erstellt hast, kannst du auch danach als PDF herunterladen.`,
    },
    {
      titel: "§ 5 Preis und Zahlung",
      text: `Das Startpaket kostet einmalig ${p} inklusive Umsatzsteuer. Weitere Kosten entstehen nicht, es gibt keine wiederkehrenden Zahlungen. Die Zahlung erfolgt online über Stripe.`,
    },
    {
      titel: "§ 6 Widerrufsrecht",
      text: "Als Verbraucher:in hast du ein Widerrufsrecht von 14 Tagen ab Vertragsschluss. Verlangst du ausdrücklich, dass wir vor Ablauf der Frist beginnen, musst du im Fall des Widerrufs einen anteiligen Betrag für die bis dahin erbrachten Leistungen zahlen. Das Widerrufsrecht erlischt, wenn wir die Leistung vollständig erbracht haben. Die ausführliche Widerrufsbelehrung erhältst du mit der Buchungsbestätigung.",
    },
    {
      titel: "§ 7 Haftung",
      text: `Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit sowie bei Verletzung von Leben, Körper oder Gesundheit. ${AGB_S7_SATZ2}`,
    },
    {
      // ANWALT PRÜFEN (23.10.2026): Verweis auf die Weitergabe an das CRM der EuBiA-Gruppe
      titel: "§ 8 Datenschutz",
      text: "Es gilt unsere Datenschutzerklärung. Dort steht auch, welche Angaben wir zur Kundenbetreuung und Abrechnung an das interne CRM der EuBiA-Gruppe übermitteln (Abschnitt 5).",
    },
    {
      titel: "§ 9 Schlussbestimmungen",
      text: "Es gilt deutsches Recht. Zwingende Verbraucherschutzvorschriften deines Wohnsitzstaates bleiben unberührt.",
    },
  ];
}

/** AGB als reiner Text (für die E-Mail und die Datei zur Prüfung) */
export function agbText(): string {
  return [AGB_TITEL, ...agbAbschnitte().map((a) => `${a.titel}\n${a.text}`)].join("\n\n");
}
