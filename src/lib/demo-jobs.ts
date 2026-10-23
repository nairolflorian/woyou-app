// Demo-Daten für die Vorführung (ohne Importe, damit auch scripts/seed.ts sie nutzen kann).
// Alles klar erfunden: Firmen mit „Beispiel“ im Namen, Adressen nur @example.com bzw. example.com.
// Verwendet von src/lib/demo-setup.ts (Demo-Login, nur DEMO_MODE) und scripts/seed.ts (lokal).

export const DEMO_TOOL_EMAILS = ["fatima@example.com", "youssef@example.com"] as const;
// Erfundene Stellen: Firmen mit „Beispiel“ im Namen, Adressen nur @example.com bzw. example.com
export const DEMO_JOBS = [
  {
    sourceRef: "demo-1", status: "SAVED",
    title: "Pflegefachkraft (m/w/d) Innere Medizin", company: "Beispiel-Klinikum Rheinaue GmbH", city: "Düsseldorf",
    email: "bewerbung.klinikum@example.com", contactName: "Frau Beispiel", url: "https://example.com/stellen/pflegefachkraft-innere",
    applyUrl: null,
    description: "Erfundene Beispielanzeige für die Vorführung. Wir suchen eine Pflegefachkraft für unsere Station Innere Medizin in Voll- oder Teilzeit. Deutschkenntnisse auf B1-Niveau, Anerkennung als Pflegefachkraft oder laufendes Anerkennungsverfahren. Bewerbung bitte per E-Mail.",
    germanRequired: "B1",
  },
  {
    sourceRef: "demo-2", status: "SAVED",
    title: "Pflegeassistenz (m/w/d) in Teilzeit", company: "Beispiel Seniorenresidenz am Park", city: "Köln",
    email: null, contactName: null, url: "https://example.com/stellen/pflegeassistenz",
    applyUrl: "https://example.com/karriere/bewerben",
    description: "Erfundene Beispielanzeige für die Vorführung. Unterstützung im Pflegeteam, 25 bis 30 Stunden pro Woche. Deutschkenntnisse A2 bis B1. Bewerbung nur über unser Online-Formular.",
    germanRequired: "A2",
  },
  {
    sourceRef: "demo-3", status: "APPLIED",
    title: "Gesundheits- und Krankenpflegerin (m/w/d)", company: "Beispiel Pflegedienst Nord GmbH", city: "Essen",
    email: "jobs.pflegedienst@example.com", contactName: null, url: "https://example.com/stellen/krankenpflege-ambulant",
    applyUrl: null,
    description: "Erfundene Beispielanzeige für die Vorführung. Ambulante Pflege im Essener Norden, Führerschein Klasse B, Deutsch B1.",
    germanRequired: "B1",
  },
] as const;


const DAY = 864e5;

/** Datenbank-Zeile (SavedJob, ohne candidateId und Anschreiben) zu einer Beispielstelle */
export function demoJobRow(j: (typeof DEMO_JOBS)[number], now = Date.now()) {
  const applied = j.status === "APPLIED";
  return {
    source: "MANUAL", sourceRef: j.sourceRef, title: j.title, company: j.company, city: j.city,
    url: j.url, applyUrl: j.applyUrl, email: j.email, contactName: j.contactName, description: j.description,
    meta: JSON.stringify({ germanRequired: j.germanRequired, demo: true }), status: j.status as string,
    notes: applied ? "Beispiel: per E-Mail aus dem eigenen Postfach beworben. In einer Woche nachfragen." : null,
    appliedAt: applied ? new Date(now - 5 * DAY) : null,
    followUpAt: applied ? new Date(now + 2 * DAY) : null,
    letterLang: "de",
  };
}
