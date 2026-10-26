// Verbraucherrecht (Hinweise der Anwältin, 26.10.2026): Vertragsinhalt und Buchungsbestätigung, Fristen,
// Prüfung der Formulare „Vertrag widerrufen“ und „Verträge hier kündigen“, Vorschlag für die anteilige Erstattung,
// Texte der Eingangsbestätigungen. Alles reine Funktionen ohne Server-Importe (auch für Tests und Skripte).
//
// ANWALT PRÜFEN (26.10.2026): Texte der Buchungsbestätigung und der Eingangsbestätigungen.
import { COMPANY } from "@/lib/company";
import { ANGEBOT, MAPPE_FERTIG_WERKTAGE, addMonths, formatPrice } from "@/lib/angebot";
import { agbText } from "@/lib/recht/agb-text";
import { widerrufText } from "@/lib/recht/widerruf-text";

export const TAG_MS = 864e5;
export const WIDERRUFSFRIST_TAGE = 14;
export const ERSTATTUNGSFRIST_TAGE = 14;

/** Genaue Beschriftungen (rechtlich vorgegeben, nicht übersetzen oder umformulieren) */
export const KNOPF = {
  buchen: "Zahlungspflichtig buchen",
  widerrufen: "Vertrag widerrufen",
  widerrufBestaetigen: "Widerruf bestätigen",
  kuendigen: "Verträge hier kündigen",
  jetztKuendigen: "jetzt kündigen",
} as const;

/** Vertrag, der über „Verträge hier kündigen“ gekündigt werden kann */
export const VERTRAG_KUENDBAR = "Startpaket WoYou: Bewerbungswerkzeug";

export const PAKET_NAME = `Startpaket: Bewerbungsunterlagen und ${ANGEBOT.startpaket.toolMonths} Monate Bewerbungswerkzeug`;

/** Buchungsnummer für Kund:innen (aus der Buchungs-ID, ohne Datenbank) */
export const buchungsNummer = (id: string) => `WY-${id.slice(-8).toUpperCase()}`;
/** Aus einer eingegebenen Buchungsnummer den Teil zum Suchen holen (Endung der ID, klein) oder null */
export function buchungsNummerSuche(eingabe: string): string | null {
  const m = eingabe.trim().match(/^(?:WY-?)?([a-z0-9]{8,})$/i);
  return m ? m[1].toLowerCase() : null;
}

const berlin = (d: Date, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", ...opts }).format(d);
/** 26.10.2026 */
export const datum = (d: Date) => berlin(d, { day: "2-digit", month: "2-digit", year: "numeric" });
/** 26.10.2026, 14:03 Uhr */
export const datumUhrzeit = (d: Date) => `${datum(d)}, ${berlin(d, { hour: "2-digit", minute: "2-digit", hour12: false })} Uhr`;

/** Vertragsschluss: mit der Buchungsbestätigung (nach Zahlung bzw. bei einer Anfrage ohne Stripe sofort) */
export const vertragsschluss = (b: { createdAt: Date; paidAt?: Date | null }) => b.paidAt ?? b.createdAt;
/** Ende der Widerrufsfrist (14 Tage ab Vertragsschluss, bis Tagesende) */
export function widerrufsfristEnde(schluss: Date): Date {
  const e = new Date(schluss.getTime() + WIDERRUFSFRIST_TAGE * TAG_MS);
  e.setHours(23, 59, 59, 999);
  return e;
}
export const imWiderrufszeitraum = (schluss: Date, now = new Date()) => now <= widerrufsfristEnde(schluss);
/** Erstattung spätestens 14 Tage nach Eingang des Widerrufs */
export const erstattungBis = (eingang: Date) => new Date(eingang.getTime() + ERSTATTUNGSFRIST_TAGE * TAG_MS);

// ---------- Buchungsbestätigung ----------

export type BuchungFuerBestaetigung = {
  id: string;
  name: string;
  email: string;
  amountCents: number;
  toolMonths: number;
  createdAt: Date;
  paidAt?: Date | null;
  waiverAcceptedAt?: Date | null;
  toolBis?: Date | null;
};

/** Vertragsinhalt als Absätze */
export function vertragsinhalt(b: BuchungFuerBestaetigung): string[] {
  const preis = formatPrice(b.amountCents);
  const months = b.toolMonths || ANGEBOT.startpaket.toolMonths;
  return [
    `Buchungsnummer: ${buchungsNummer(b.id)}`,
    `Vertragspartner: ${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}, vertreten durch den Geschäftsführer ${COMPANY.ceo}, ${COMPANY.court}, ${COMPANY.register}. Kontakt: ${COMPANY.email}, Telefon ${COMPANY.phone}.`,
    `Kund:in: ${b.name}${b.email ? `, ${b.email}` : ""}`,
    `Gebucht am: ${datumUhrzeit(b.createdAt)}${b.paidAt ? `. Bezahlt am: ${datumUhrzeit(b.paidAt)}` : ""}`,
    `Paket: ${PAKET_NAME}`,
    `Preis: ${preis} inkl. USt, einmalig. Keine weiteren Kosten, kein Abo, keine Verlängerung.`,
    `Enthalten: Lebenslauf und Anschreiben-Vorlage nach deutschem Standard. Unser Team prüft deine Bewerbungsmappe und gibt sie frei. Dazu ${months} Monate Zugang zum Bewerbungswerkzeug (Stellensuche, Anschreiben je Stelle, eigene Übersicht deiner Bewerbungen). Du bewirbst dich selbst; wir vermitteln keine Stellen.`,
    `Lieferzeit: Deine Unterlagen sind fertig innerhalb von ${MAPPE_FERTIG_WERKTAGE} Werktagen, nachdem du die vollständige Mappe eingereicht hast.`,
    `Laufzeit des Werkzeugs: ${months} Monate ab Zahlungseingang${b.toolBis ? `, also bis ${datum(b.toolBis)}` : ""}. Danach endet der Zugang automatisch, du musst nichts kündigen. Deine Unterlagen kannst du weiter herunterladen.`,
    "Vertragssprache: Deutsch. Den Vertragstext speichern wir. Diese E-Mail enthält den Vertragstext, unsere AGB und die Widerrufsbelehrung mit Muster-Widerrufsformular.",
  ];
}

/** Bestätigung des Häkchens „sofort beginnen“ (§ 356 Abs. 4 BGB, Art. 246a § 1 Abs. 2 Nr. 3 EGBGB) */
export function bestaetigungSofortbeginn(am: Date | null | undefined): string {
  if (!am) return "Du hast bei der Buchung nicht verlangt, dass wir vor Ablauf der Widerrufsfrist beginnen.";
  return `Du hast bei der Buchung am ${datumUhrzeit(am)} ausdrücklich verlangt, dass wir vor Ablauf der Widerrufsfrist mit der Leistung beginnen und das Bewerbungswerkzeug sofort freischalten. Du hast dabei bestätigt, dass dir bekannt ist, dass du bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahlst und dass dein Widerrufsrecht erlischt, sobald wir die Leistung vollständig erbracht haben.`;
}

export type MailAbschnitt = { titel: string; text: string };

/** Rechtlicher Teil der Buchungsbestätigung (immer Deutsch, Vertragssprache) */
export function buchungsbestaetigungRecht(b: BuchungFuerBestaetigung, art: "paid" | "requested"): MailAbschnitt[] {
  const zustande = art === "paid"
    ? "Mit dieser E-Mail bestätigen wir deine Buchung. Der Vertrag ist damit zustande gekommen."
    : "Mit dieser E-Mail bestätigen wir deine Buchung. Der Vertrag ist damit zustande gekommen. Den Link zur Zahlung schicken wir dir gesondert; das Bewerbungswerkzeug schalten wir nach Zahlungseingang frei.";
  return [
    { titel: "Deine Buchung (Vertragsinhalt)", text: [zustande, ...vertragsinhalt(b)].join("\n") },
    { titel: "Bestätigung: Beginn vor Ablauf der Widerrufsfrist", text: bestaetigungSofortbeginn(b.waiverAcceptedAt) },
    { titel: "Widerruf online", text: `Du kannst innerhalb der Widerrufsfrist auch online widerrufen, ohne Anmeldung: https://woyou.de/vertrag-widerrufen (Knopf „${KNOPF.widerrufen}“ unten auf jeder Seite).` },
    { titel: "Allgemeine Geschäftsbedingungen", text: agbText() },
    { titel: "Widerrufsbelehrung und Muster-Widerrufsformular", text: widerrufText() },
  ];
}

/** Ganze Buchungsbestätigung als Text: Anfang der Mail (Sprache der Kund:in), dann der rechtliche Teil auf Deutsch */
export function buchungsbestaetigungText(b: BuchungFuerBestaetigung, art: "paid" | "requested", kopf: string[], schluss: string[] = []): string {
  return [...kopf, ...buchungsbestaetigungRecht(b, art).map((a) => `${a.titel.toUpperCase()}\n\n${a.text}`), ...schluss].join("\n\n");
}

// ---------- Formulare ----------

export type Fehler = Record<string, string>;
type Ergebnis<T> = { ok: true; daten: T } | { ok: false; fehler: Fehler };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
export const istEmail = (s: string) => s.length <= 200 && EMAIL.test(s);

export type WiderrufEingabe = { name: string; bookingRef: string; email: string; message: string | null };

/** Formular „Vertrag widerrufen“ prüfen */
export function pruefeWiderruf(input: unknown): Ergebnis<WiderrufEingabe> {
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const name = str(i.name), bookingRef = str(i.bookingRef), email = str(i.email).toLowerCase(), message = str(i.message);
  const fehler: Fehler = {};
  if (name.length < 2 || name.length > 120) fehler.name = "Bitte gib deinen Namen an.";
  if (bookingRef.length < 4 || bookingRef.length > 200) fehler.bookingRef = "Bitte gib deine Buchungsnummer oder die E-Mail-Adresse deiner Buchung an.";
  if (!istEmail(email)) fehler.email = "Bitte gib eine gültige E-Mail-Adresse für die Bestätigung an.";
  if (message.length > 2000) fehler.message = "Die Nachricht ist zu lang (höchstens 2000 Zeichen).";
  if (Object.keys(fehler).length) return { ok: false, fehler };
  return { ok: true, daten: { name, bookingRef, email, message: message || null } };
}

export type KuendigungEingabe = {
  art: "ordentlich" | "ausserordentlich";
  grund: string | null;
  name: string;
  email: string;
  bookingRef: string | null;
  vertrag: typeof VERTRAG_KUENDBAR;
  wirksam: "naechstmoeglich" | "datum";
  wirksamZu: Date | null;
  bestaetigungEmail: string;
};

/** Formular „Verträge hier kündigen“ prüfen (heute = Vergleichstag für das Wunschdatum) */
export function pruefeKuendigung(input: unknown, heute = new Date()): Ergebnis<KuendigungEingabe> {
  const i = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const art = str(i.art), grund = str(i.grund), name = str(i.name), email = str(i.email).toLowerCase(), bookingRef = str(i.bookingRef);
  const vertrag = str(i.vertrag), wirksam = str(i.wirksam), datumStr = str(i.wirksamZu), bestaetigungEmail = str(i.bestaetigungEmail).toLowerCase();
  const fehler: Fehler = {};
  if (art !== "ordentlich" && art !== "ausserordentlich") fehler.art = "Bitte wähle, ob du ordentlich oder außerordentlich kündigst.";
  if (art === "ausserordentlich" && grund.length < 5) fehler.grund = "Bitte nenne den Grund für die außerordentliche Kündigung.";
  if (grund.length > 2000) fehler.grund = "Der Grund ist zu lang (höchstens 2000 Zeichen).";
  if (name.length < 2 || name.length > 120) fehler.name = "Bitte gib deinen Namen an.";
  if (!istEmail(email)) fehler.email = "Bitte gib die E-Mail-Adresse an, mit der du gebucht hast.";
  if (bookingRef.length > 60) fehler.bookingRef = "Die Buchungsnummer ist zu lang.";
  if (vertrag !== VERTRAG_KUENDBAR) fehler.vertrag = "Bitte wähle den Vertrag, den du kündigen möchtest.";
  let wirksamZu: Date | null = null;
  if (wirksam !== "naechstmoeglich" && wirksam !== "datum") fehler.wirksam = "Bitte wähle, wann die Kündigung wirken soll.";
  if (wirksam === "datum") {
    const m = datumStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 23, 59, 59) : null;
    const start = new Date(heute); start.setHours(0, 0, 0, 0);
    if (!d || isNaN(d.getTime()) || d.getMonth() !== Number(m![2]) - 1) fehler.wirksamZu = "Bitte gib ein gültiges Datum an.";
    else if (d < start) fehler.wirksamZu = "Das Datum darf nicht in der Vergangenheit liegen.";
    else wirksamZu = d;
  }
  if (!istEmail(bestaetigungEmail)) fehler.bestaetigungEmail = "Bitte gib eine gültige E-Mail-Adresse für die Bestätigung an.";
  if (Object.keys(fehler).length) return { ok: false, fehler };
  return {
    ok: true,
    daten: { art: art as KuendigungEingabe["art"], grund: grund || null, name, email, bookingRef: bookingRef || null, vertrag: VERTRAG_KUENDBAR, wirksam: wirksam as KuendigungEingabe["wirksam"], wirksamZu, bestaetigungEmail },
  };
}

/** Wann endet der Vertrag? Das Werkzeug hat eine feste Laufzeit und endet ohnehin von selbst. */
export function kuendigungsEnde(k: { art: KuendigungEingabe["art"]; wirksamZu: Date | null; festesEnde: Date | null; eingang: Date }): { datum: Date | null; text: string } {
  if (k.art === "ordentlich") {
    if (k.festesEnde) return { datum: k.festesEnde, text: `Dein Vertrag hat eine feste Laufzeit und endet am ${datum(k.festesEnde)}. Bis dahin kannst du das Werkzeug weiter nutzen. Danach endet er automatisch, es gibt keine Verlängerung.` };
    if (k.wirksamZu) return { datum: k.wirksamZu, text: `Deine Kündigung wirkt zum ${datum(k.wirksamZu)}. Wir haben keinen laufenden Vertrag zu deinen Angaben gefunden und prüfen das noch.` };
    return { datum: null, text: "Deine Kündigung wirkt zum nächstmöglichen Zeitpunkt. Wir haben keinen laufenden Vertrag zu deinen Angaben gefunden, prüfen das und schreiben dir das genaue Vertragsende." };
  }
  let d = k.wirksamZu ?? k.eingang;
  if (k.festesEnde && d > k.festesEnde) d = k.festesEnde;
  return { datum: d, text: `Du kündigst außerordentlich zum ${datum(d)}. Wir prüfen den Grund und melden uns bei dir. Spätestens endet dein Vertrag ohnehin ${k.festesEnde ? `am ${datum(k.festesEnde)}` : "mit dem Ende der festen Laufzeit"}.` };
}

// ---------- Eingangsbestätigungen (E-Mail und Seite zum Speichern, gleicher Text) ----------

export function widerrufBestaetigung(d: WiderrufEingabe & { eingang: Date; buchung?: string | null }): { betreff: string; zeilen: string[] } {
  return {
    betreff: "Eingangsbestätigung deines Widerrufs",
    zeilen: [
      `Hallo ${d.name},`,
      `dein Widerruf ist am ${datumUhrzeit(d.eingang)} bei uns eingegangen. Das hast du uns geschickt:`,
      `Name: ${d.name}`,
      `Buchung (Buchungsnummer oder E-Mail der Buchung): ${d.bookingRef}`,
      `E-Mail für die Bestätigung: ${d.email}`,
      `Nachricht: ${d.message || "keine"}`,
      `Eingang: ${datumUhrzeit(d.eingang)}`,
      ...(d.buchung ? [`Zugeordnete Buchung: ${d.buchung}`] : []),
      `Wir erstatten dir den Preis innerhalb von ${ERSTATTUNGSFRIST_TAGE} Tagen nach Eingang über dasselbe Zahlungsmittel, abzüglich eines anteiligen Betrags für Leistungen, die wir auf deinen Wunsch schon erbracht haben. Hast du noch nicht bezahlt, ist nichts mehr zu zahlen.`,
      `Fragen? Schreib uns an ${COMPANY.email} oder ruf an: ${COMPANY.phone}.`,
      `${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}`,
    ],
  };
}

export function kuendigungBestaetigung(d: KuendigungEingabe & { eingang: Date; ende: { datum: Date | null; text: string }; buchung?: string | null }): { betreff: string; zeilen: string[] } {
  return {
    betreff: "Eingangsbestätigung deiner Kündigung",
    zeilen: [
      `Hallo ${d.name},`,
      `deine Kündigung ist am ${datumUhrzeit(d.eingang)} bei uns eingegangen. Das hast du uns geschickt:`,
      `Art der Kündigung: ${d.art === "ordentlich" ? "ordentliche Kündigung" : "außerordentliche Kündigung"}`,
      ...(d.grund ? [`Grund: ${d.grund}`] : []),
      `Name: ${d.name}`,
      `E-Mail der Buchung: ${d.email}`,
      `Buchungsnummer: ${d.bookingRef || "keine Angabe"}`,
      `Vertrag: ${d.vertrag}`,
      `Gewünschter Zeitpunkt: ${d.wirksam === "datum" && d.wirksamZu ? `zum ${datum(d.wirksamZu)}` : "zum nächstmöglichen Zeitpunkt"}`,
      `E-Mail für die Bestätigung: ${d.bestaetigungEmail}`,
      `Eingang: ${datumUhrzeit(d.eingang)}`,
      ...(d.buchung ? [`Zugeordnete Buchung: ${d.buchung}`] : []),
      `Vertragsende: ${d.ende.datum ? datum(d.ende.datum) : "nächstmöglicher Zeitpunkt, wir schreiben dir das genaue Datum"}`,
      d.ende.text,
      `Fragen? Schreib uns an ${COMPANY.email} oder ruf an: ${COMPANY.phone}.`,
      `${COMPANY.name}, ${COMPANY.street}, ${COMPANY.zipCity}`,
    ],
  };
}

// ---------- Erstattung nach Widerruf ----------

/** Vorschlag: Anteil der Unterlagen am Preis, der Rest entfällt auf die Monate Werkzeug. Das Team kann den Betrag ändern. */
export const ANTEIL_UNTERLAGEN = 0.5;

export type ErstattungEingabe = {
  amountCents: number;
  bezahlt: boolean;
  mappeStatus: string | null; // DRAFT | SUBMITTED | APPROVED | null
  werkzeugGenutzt: boolean; // mindestens eine Stelle gemerkt
  toolStart: Date | null; // Zahlungseingang
  toolMonths: number;
  widerrufAm: Date;
};

/**
 * Vorschlag für die Erstattung (nur ein Vorschlag, das Team prüft und ändert den Betrag bei Bedarf):
 * nicht bezahlt: nichts zu erstatten. Noch nichts erbracht (Mappe nicht freigegeben, Werkzeug nicht genutzt): alles zurück.
 * Sonst: Unterlagen fertig = ANTEIL_UNTERLAGEN des Preises, Werkzeug genutzt = Rest anteilig nach Tagen bis zum Widerruf.
 */
export function erstattungsVorschlag(e: ErstattungEingabe): { erstattungCents: number; anteilCents: number; regel: string } {
  if (!e.bezahlt || e.amountCents <= 0) return { erstattungCents: 0, anteilCents: 0, regel: "Keine Zahlung eingegangen: nichts zu erstatten, Buchung stornieren." };
  const unterlagen = e.mappeStatus === "APPROVED";
  if (!unterlagen && !e.werkzeugGenutzt) return { erstattungCents: e.amountCents, anteilCents: 0, regel: "Noch nichts erbracht (Mappe nicht freigegeben, Werkzeug nicht genutzt): volle Erstattung." };
  let anteil = 0;
  const teile: string[] = [];
  if (unterlagen) { anteil += e.amountCents * ANTEIL_UNTERLAGEN; teile.push(`Unterlagen fertig: ${Math.round(ANTEIL_UNTERLAGEN * 100)} %`); }
  if (e.werkzeugGenutzt && e.toolStart) {
    const gesamt = Math.max(1, Math.round((addMonths(e.toolStart, e.toolMonths || ANGEBOT.startpaket.toolMonths).getTime() - e.toolStart.getTime()) / TAG_MS));
    const genutzt = Math.min(gesamt, Math.max(1, Math.ceil((e.widerrufAm.getTime() - e.toolStart.getTime()) / TAG_MS)));
    anteil += e.amountCents * (1 - ANTEIL_UNTERLAGEN) * (genutzt / gesamt);
    teile.push(`Werkzeug ${genutzt} von ${gesamt} Tagen genutzt`);
  }
  const anteilCents = Math.min(e.amountCents, Math.round(anteil));
  return { erstattungCents: e.amountCents - anteilCents, anteilCents, regel: `Vorschlag: ${teile.join(", ")}. Bitte prüfen und bei Bedarf ändern.` };
}

