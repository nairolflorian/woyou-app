// Weg 1 (Entscheidung nach Rücksprache mit den Anwälten, 22.10.2026):
// WoYou ist keine Arbeitsvermittlung. Verkauft werden Bewerbungsunterlagen und ein Werkzeug, mit dem
// Kund:innen selbst Stellen finden und sich selbst aus dem eigenen Postfach bewerben.
//
// Alles, was nach Vermittlung aussieht, ist hier zentral abgeschaltet. Der alte Code bleibt im Repo
// (für die Datenübernahme und zum Nachlesen), ist aber nicht erreichbar:
//   - die Middleware sperrt die Pfade unten (API: 410, Seiten: Weiterleitung),
//   - die Funktionen selbst prüfen den Schalter zusätzlich (z. B. Versand in src/lib/leads.ts).
//
// Bitte NICHT einfach auf true stellen: dafür braucht es eine neue rechtliche Bewertung.
// Diese Datei hat keine Importe, damit sie auch in der Middleware läuft.

export const WEG1 = {
  /** Team verschickt Bewerbungen im Namen der Kund:innen (SMTP, „Jetzt bewerben“) */
  teamVersand: false,
  /** persönliche Bewerbungsadressen (Alias) und Weiterleiten/Lesen von Firmenantworten */
  aliasUndAntworten: false,
  /** Guthaben je verschickter Bewerbung, Nachkauf „25 weitere“ */
  guthabenJeBewerbung: false,
  /** Team sucht und wählt Stellen je Kund:in aus (Vorschläge, Stellenliste im Admin) */
  teamStellenauswahl: false,
  /** Arbeitgeberbereich, Unternehmens-Registrierung, Matching, Chats mit Firmen */
  arbeitgeberUndMatching: false,
} as const;

// Pfade der abgeschalteten Bereiche
const GESPERRT: { re: RegExp; grund: string }[] = [
  // Versand, Stellenauswahl und Guthaben durch das Team
  { re: /^\/api\/admin\/bookings\/[^/]+\/(apply|credits|jobs|leads|suggest)(\/|$)/, grund: "Stellenauswahl und Versand durch das Team sind abgeschaltet (Weg 1)." },
  { re: /^\/api\/admin\/leads(\/|$)/, grund: "Stellenauswahl und Versand durch das Team sind abgeschaltet (Weg 1)." },
  // Alias-Adressen: Eingang für Firmenantworten
  { re: /^\/api\/mail\/inbound(\/|$)/, grund: "Weiterleiten von Firmenantworten ist abgeschaltet (Weg 1)." },
  // altes Guthaben (25 weitere Bewerbungen, Abo „unbegrenzt bewerben“)
  { re: /^\/api\/credits(\/|$)/, grund: "Guthaben je Bewerbung gibt es nicht mehr (Weg 1)." },
  // Arbeitgeber, Matching, Chats
  { re: /^\/api\/company(\/|$)/, grund: "Der Arbeitgeberbereich ist abgeschaltet (Weg 1)." },
  { re: /^\/api\/admin\/matches(\/|$)/, grund: "Matching ist abgeschaltet (Weg 1)." },
  { re: /^\/api\/candidate\/matches(\/|$)/, grund: "Matching ist abgeschaltet (Weg 1)." },
  { re: /^\/api\/chat(\/|$)/, grund: "Chats mit Firmen sind abgeschaltet (Weg 1)." },
  { re: /^\/api\/cron\/re-match(\/|$)/, grund: "Matching ist abgeschaltet (Weg 1)." },
  // Seiten
  { re: /^\/admin\/(matching|firmen|anfragen|chats)(\/|$)/, grund: "admin" },
  { re: /^\/(arbeitgeber|firmen|chat)(\/|$)/, grund: "seite" },
];

/** null = erlaubt, sonst Grund (bei Seiten: "admin" oder "seite") */
export function weg1Gesperrt(pathname: string): string | null {
  for (const g of GESPERRT) if (g.re.test(pathname)) return g.grund;
  return null;
}

export class Weg1Gesperrt extends Error {
  constructor(was: string) {
    super(`${was} ist abgeschaltet (Weg 1: keine Vermittlung, Kund:innen bewerben sich selbst).`);
    this.name = "Weg1Gesperrt";
  }
}
