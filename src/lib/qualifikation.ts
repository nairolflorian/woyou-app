// Führerschein und Qualifikationen in der Bewerbungsmappe (Pilot Westbalkan: Lkw/Bus und Logistik).
// Ohne zod, damit der Editor im Browser es ohne Zusatzgewicht nutzen kann. Prüfung beim Speichern: src/lib/application.ts
export const LICENSE_CLASSES = ["B", "C1", "C", "CE", "D1", "D", "DE"] as const;
export type LicenseClass = (typeof LICENSE_CLASSES)[number];
export type YesNo = "" | "yes" | "no";
export type Qualifications = {
  licenses: LicenseClass[];
  licenseSince: string; // Jahr, z. B. "2016"
  driverCard: YesNo; // Fahrerkarte
  code95: YesNo; // Grundqualifikation / Schlüsselzahl 95
  code95Until: string; // "03/2029"
  adr: YesNo;
  adrClasses: string;
  forklift: YesNo; // Staplerschein
  countries: string; // internationale Erfahrung
  systems: string; // Lager-/Logistiksysteme, z. B. SAP, Scanner
};
export const EMPTY_QUAL: Qualifications = { licenses: [], licenseSince: "", driverCard: "", code95: "", code95Until: "", adr: "", adrClasses: "", forklift: "", countries: "", systems: "" };

// Zeilen für den Lebenslauf (PDF und Word), z. B.
// "Führerscheinklassen: B, C, CE (seit 2016) · Fahrerkarte · Grundqualifikation (Code 95) bis 03/2029 · ADR · Staplerschein".
// Nur was zutrifft, nichts Negatives. Leeres Ergebnis = Abschnitt entfällt.
export function qualLines(q: Qualifications | undefined, lang: "de" | "en" = "de"): { label: string; text: string }[] {
  if (!q) return [];
  const en = lang === "en";
  const since = /^\d{4}$/.test(q.licenseSince) ? q.licenseSince : "";
  const parts: string[] = [];
  if (q.licenses.length) parts.push(`${en ? "Licence categories" : "Führerscheinklassen"}: ${q.licenses.join(", ")}${since ? (en ? ` (since ${since})` : ` (seit ${since})`) : ""}`);
  if (q.driverCard === "yes") parts.push(en ? "Driver card (tachograph)" : "Fahrerkarte");
  if (q.code95 === "yes") parts.push(`${en ? "Driver CPC (Code 95)" : "Grundqualifikation (Code 95)"}${q.code95Until ? (en ? ` valid until ${q.code95Until}` : ` bis ${q.code95Until}`) : ""}`);
  if (q.adr === "yes") parts.push(`ADR${q.adrClasses ? (en ? ` (classes ${q.adrClasses})` : ` (Klassen ${q.adrClasses})`) : ""}`);
  if (q.forklift === "yes") parts.push(en ? "Forklift licence" : "Staplerschein");
  const out: { label: string; text: string }[] = [];
  if (parts.length) out.push({ label: en ? "Licences" : "Nachweise", text: parts.join(" · ") });
  if (q.countries) out.push({ label: en ? "Countries" : "Einsatzländer", text: q.countries });
  if (q.systems) out.push({ label: en ? "Systems" : "Systeme", text: q.systems });
  return out;
}

// Zielgruppe aus Wunschberuf und Angaben ableiten (für die Dokumenten-Checkliste)
export type Zielgruppe = "fahrer" | "logistik" | "dispo";
export function zielgruppen(d: { targetJob: string; qualifications?: Qualifications }): Zielgruppe[] {
  const job = d.targetJob.toLowerCase(), q = d.qualifications ?? EMPTY_QUAL;
  const g: Zielgruppe[] = [];
  if (/fahrer|lkw|bus|kraftfahr|berufskraft|driver|truck|vozač|vozac|kamion|chauffeur|camion/.test(job) || q.licenses.some((c) => c !== "B")) g.push("fahrer");
  if (/lager|logistik|kommission|stapler|warehouse|logistic|forklift|picker|magacin|viljuškar|viljuskar|entrepôt|cariste/.test(job) || q.forklift === "yes") g.push("logistik");
  if (/dispo|dispatch|disponent|otprem|répartiteur/.test(job)) g.push("dispo");
  return g;
}
