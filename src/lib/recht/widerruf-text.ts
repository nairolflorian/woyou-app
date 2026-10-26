// Widerrufsbelehrung und Muster-Widerrufsformular (eine Quelle für /widerruf und die Buchungsbestätigung).
// Ohne Server-Importe, damit Tests und das Skript für docs/Buchungsbestaetigung_Text.md es nutzen können.
//
// ANWALT PRÜFEN (26.10.2026): Muster-Widerrufsbelehrung nach Anlage 1 zu Art. 246a § 1 Abs. 2 Satz 2 EGBGB in der
// Fassung für Dienstleistungsverträge, mit dem Absatz zum angemessenen Betrag bei Beginn der Dienstleistung während
// der Widerrufsfrist auf Verlangen, und Muster-Widerrufsformular nach Anlage 2 zu Art. 246a § 1 Abs. 2 Satz 1 Nr. 1 EGBGB.
// Der Mustertext bleibt bewusst in der gesetzlichen Sie-Form (Musterschutz). Nur die kurze Einleitung darüber ist in du-Form.
// Gestaltungshinweis 2 (Frist ab Vertragsschluss) und der optionale Satz zum Online-Widerruf sind eingesetzt.
// Die Gedankenstriche des Musterformulars werden als Aufzählung dargestellt (Textregel: keine langen Striche).
import { COMPANY } from "@/lib/company";

export const WIDERRUF_TITEL = "Widerrufsbelehrung";

/** Adresse der Online-Widerrufsfunktion (Seite ohne Anmeldung) */
export const WIDERRUF_ONLINE_PFAD = "/vertrag-widerrufen";
export const WIDERRUF_ONLINE_URL = "https://woyou.de/vertrag-widerrufen";

/** Einleitung in du-Form (kein Teil des gesetzlichen Musters) */
export const WIDERRUF_EINLEITUNG = [
  "Du kannst deinen Vertrag über das Startpaket innerhalb von 14 Tagen widerrufen. Unten steht die gesetzliche Widerrufsbelehrung. Sie ist bewusst in der amtlichen Sie-Form geschrieben, so wie es das Gesetz vorgibt.",
  "Am einfachsten widerrufst du online über den Knopf „Vertrag widerrufen“ unten auf jeder Seite. Du bekommst sofort eine Bestätigung per E-Mail. Du kannst uns aber auch einen Brief oder eine E-Mail schicken, gern mit dem Formular unten.",
];

const anbieter = () => `${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}, Telefon: ${COMPANY.phone}, E-Mail: ${COMPANY.legalEmail}`;

export type Abschnitt = { titel: string; absaetze: string[] };

export function widerrufsbelehrung(): Abschnitt[] {
  return [
    {
      titel: "Widerrufsrecht",
      absaetze: [
        "Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.",
        "Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.",
        `Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (${anbieter()}) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren. Sie können dafür das beigefügte Muster-Widerrufsformular verwenden, das jedoch nicht vorgeschrieben ist.`,
        `Sie können das Muster-Widerrufsformular oder eine andere eindeutige Erklärung auch auf unserer Webseite (${WIDERRUF_ONLINE_URL}) elektronisch ausfüllen und übermitteln. Machen Sie von dieser Möglichkeit Gebrauch, so werden wir Ihnen unverzüglich (z. B. per E-Mail) eine Bestätigung über den Eingang eines solchen Widerrufs übermitteln.`,
        "Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.",
      ],
    },
    {
      titel: "Folgen des Widerrufs",
      absaetze: [
        "Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist. Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.",
        "Haben Sie verlangt, dass die Dienstleistungen während der Widerrufsfrist beginnen sollen, so haben Sie uns einen angemessenen Betrag zu zahlen, der dem Anteil der bis zu dem Zeitpunkt, zu dem Sie uns von der Ausübung des Widerrufsrechts hinsichtlich dieses Vertrags unterrichten, bereits erbrachten Dienstleistungen im Vergleich zum Gesamtumfang der im Vertrag vorgesehenen Dienstleistungen entspricht.",
      ],
    },
  ];
}

export const FORMULAR_TITEL = "Muster-Widerrufsformular";
export const FORMULAR_HINWEIS = "(Wenn Sie den Vertrag widerrufen wollen, dann füllen Sie bitte dieses Formular aus und senden Sie es zurück.)";
export const FORMULAR_FUSSNOTE = "(*) Unzutreffendes streichen.";

/** Zeilen des Muster-Widerrufsformulars (Anlage 2 EGBGB), ohne die Gedankenstriche des Gesetzestextes */
export function widerrufsformular(): string[] {
  return [
    `An ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}, E-Mail: ${COMPANY.legalEmail}:`,
    "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)/die Erbringung der folgenden Dienstleistung (*)",
    "Bestellt am (*)/erhalten am (*)",
    "Name des/der Verbraucher(s)",
    "Anschrift des/der Verbraucher(s)",
    "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)",
    "Datum",
  ];
}

/** Belehrung plus Formular als reiner Text (E-Mail, Datei zur Prüfung) */
export function widerrufText(): string {
  return [
    WIDERRUF_TITEL,
    ...widerrufsbelehrung().map((a) => `${a.titel}\n${a.absaetze.join("\n")}`),
    "Ende der Widerrufsbelehrung",
    [FORMULAR_TITEL, FORMULAR_HINWEIS, ...widerrufsformular().map((z) => `- ${z}`), FORMULAR_FUSSNOTE].join("\n"),
  ].join("\n\n");
}
