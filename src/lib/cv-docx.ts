// Lebenslauf als Word-Datei (schlichtes Layout nach deutschem Standard), Absätze für src/lib/docx.ts.
// Gleiche Inhalte wie das PDF (src/lib/pdf.tsx), inkl. Abschnitt „Führerschein und Qualifikationen“.
import type { DocPara } from "@/lib/docx";
import { qualLines, type ProfileData, type Station } from "@/lib/application";

const L = {
  de: { cv: "Lebenslauf", summary: "Kurzprofil", experience: "Berufserfahrung", education: "Ausbildung", qual: "Führerschein und Qualifikationen", skills: "Kenntnisse", languages: "Sprachen", professional: "Fachlich", driving: "Führerschein", available: "Verfügbar", now: "sofort", from: "ab", birth: "Geburtsdatum", nationality: "Staatsangehörigkeit", to: " bis " },
  en: { cv: "CV", summary: "Profile", experience: "Work experience", education: "Education", qual: "Driving licences and qualifications", skills: "Skills", languages: "Languages", professional: "Professional", driving: "Driving licence", available: "Available", now: "immediately", from: "from", birth: "Date of birth", nationality: "Nationality", to: " to " },
};

const lines = (t: string) => t.split("\n").map((x) => x.trim()).filter(Boolean);

export function cvParas(d: ProfileData, lang: "de" | "en" = "de"): DocPara[] {
  const l = L[lang];
  const name = `${d.firstName} ${d.lastName}`.trim();
  const h = (text: string): DocPara => ({ text: text.toUpperCase(), bold: true, size: 10, spaceAfter: 100, color: "1F1F1F" });
  const row = (label: string, text: string): DocPara => ({ text: `${label}: ${text}`, spaceAfter: 80 });
  const station = (x: Station): DocPara[] => [
    { text: `${[x.from, x.to].filter(Boolean).join(l.to)}`, size: 9, color: "5C5C5C", spaceAfter: 0 },
    { text: x.title, bold: true, spaceAfter: 0 },
    ...((x.place || x.city) ? [{ text: [x.place, x.city].filter(Boolean).join(", "), color: "5C5C5C", spaceAfter: 0 }] : []),
    { text: lines(x.details).map((t) => `· ${t}`).join("\n"), spaceAfter: 160 },
  ]; // leerer Aufgaben-Absatz bleibt als Abstand

  const out: DocPara[] = [
    { text: name, bold: true, size: 20, spaceAfter: 60 },
    ...(d.targetJob ? [{ text: d.targetJob, size: 12, color: "5C5C5C", spaceAfter: 60 }] : []),
    { text: [[d.street, d.zipCity].filter(Boolean).join(", "), d.phone, d.email].filter(Boolean).join("  ·  "), size: 9, color: "5C5C5C", spaceAfter: 60 },
    { text: [d.birthDate && `${l.birth}: ${d.birthDate}`, d.nationality && `${l.nationality}: ${d.nationality}`].filter(Boolean).join("  ·  "), size: 9, color: "5C5C5C", spaceAfter: 320 },
  ];
  if (d.summary) out.push(h(l.summary), { text: d.summary, spaceAfter: 240 });
  const exp = d.experience.filter((x) => x.title), edu = d.education.filter((x) => x.title);
  if (exp.length) out.push(h(l.experience), ...exp.flatMap(station));
  if (edu.length) out.push(h(l.education), ...edu.flatMap(station));
  const qual = qualLines(d.qualifications, lang);
  if (qual.length) out.push(h(l.qual), ...qual.map((x) => row(x.label, x.text)), { text: "", spaceAfter: 160 });
  const langs = d.languages.filter((x) => x.name).map((x) => (x.level ? `${x.name} (${x.level})` : x.name));
  const skills = lines(d.skills);
  const driving = d.qualifications?.licenses.length ? "" : d.drivingLicense;
  const available = d.availableFrom ? (/sofort|immediately|now/i.test(d.availableFrom) ? l.now : `${l.from} ${d.availableFrom}`) : "";
  if (langs.length || skills.length || driving || available) {
    out.push(h(l.skills));
    if (langs.length) out.push(row(l.languages, langs.join(", ")));
    if (skills.length) out.push(row(l.professional, skills.join(", ")));
    if (driving) out.push(row(l.driving, driving));
    if (available) out.push(row(l.available, available));
  }
  return out;
}
