// Bewerbungsmappe: Datenstruktur, Vorbelegung aus dem WoYou-Profil, Vollständigkeit.
import { z } from "zod";
import { DESIGN_TEMPLATES, DESIGN_COLORS, DEFAULT_DESIGN } from "@/lib/design";
import { LICENSE_CLASSES, EMPTY_QUAL } from "@/lib/qualifikation";
export { qualLines, zielgruppen, EMPTY_QUAL, LICENSE_CLASSES, type Qualifications, type Zielgruppe } from "@/lib/qualifikation";

const str = (max: number) => z.string().trim().max(max).default("");

export const Station = z.object({
  from: str(20), // "03/2019"
  to: str(20), // "heute" oder "08/2022"
  title: str(120), // Position bzw. Abschluss
  place: str(120), // Arbeitgeber bzw. Schule/Hochschule
  city: str(80),
  details: str(800), // Aufgaben, Schwerpunkte (eine pro Zeile)
});
export type Station = z.infer<typeof Station>;

// Führerschein und Qualifikationen (Pilot Westbalkan: Lkw/Bus und Logistik), alles freiwillig.
// Liegt im JSON der Mappe (ApplicationProfile.data), deshalb keine Migration nötig. Typ und Lebenslauf-Zeilen: src/lib/qualifikation.ts
const yesNo = z.enum(["", "yes", "no"]).catch("");
export const QualificationsSchema = z.object({
  licenses: z.array(z.string()).max(10).default([]).catch([]).transform((a) => LICENSE_CLASSES.filter((c) => a.includes(c))),
  licenseSince: z.string().trim().max(4).default("").catch(""), // Jahr, z. B. "2016"
  driverCard: yesNo.default(""), // Fahrerkarte
  code95: yesNo.default(""), // Grundqualifikation / Schlüsselzahl 95
  code95Until: z.string().trim().max(7).default("").catch(""), // "03/2029"
  adr: yesNo.default(""),
  adrClasses: z.string().trim().max(60).default("").catch(""),
  forklift: yesNo.default(""), // Staplerschein
  countries: z.string().trim().max(300).default("").catch(""), // internationale Erfahrung
  systems: z.string().trim().max(300).default("").catch(""), // Lager-/Logistiksysteme, z. B. SAP, Scanner
});

export const ProfileData = z.object({
  firstName: str(60),
  lastName: str(60),
  street: str(120),
  zipCity: str(120),
  country: str(60),
  phone: str(40),
  email: str(120),
  birthDate: str(20), // freiwillig
  nationality: str(60), // freiwillig
  targetJob: str(120), // Berufsbezeichnung für die Überschrift
  summary: str(700), // Kurzprofil, 2–4 Sätze
  experience: z.array(Station).max(15).default([]),
  education: z.array(Station).max(10).default([]),
  languages: z.array(z.object({ name: str(40), level: str(40) })).max(10).default([]),
  skills: str(800), // eine Kenntnis pro Zeile
  drivingLicense: str(40),
  availableFrom: str(40),
  motivation: str(1200), // warum Deutschland, warum dieser Beruf – Grundlage für Anschreiben
  strengths: str(600),
  showPhoto: z.boolean().default(true),
  qualifications: QualificationsSchema.default(EMPTY_QUAL).catch(EMPTY_QUAL),
  // Aussehen von Lebenslauf und Anschreiben; unbekannte Farben fallen auf Standard zurück
  design: z.object({
    template: z.enum(DESIGN_TEMPLATES).catch(DEFAULT_DESIGN.template),
    color: z.string().refine((c) => DESIGN_COLORS.some((x) => x.value === c)).catch(DEFAULT_DESIGN.color),
  }).default(DEFAULT_DESIGN).catch(DEFAULT_DESIGN),
});
export type ProfileData = z.infer<typeof ProfileData>;

export const EMPTY_STATION: Station = { from: "", to: "", title: "", place: "", city: "", details: "" };

type CandidateLike = {
  firstName: string | null; lastName: string | null; city: string | null; countryOfResidence: string | null;
  nationality: string | null; dateOfBirth: Date | null; whatsappNumber: string | null; desiredJobTitle: string | null;
  yearsExperience: number | null; currentJob: string | null; currentEmployer: string | null; drivingLicense: boolean | null;
  earliestStart: Date | null; germanLevel: string | null; englishLevel: string | null; aboutMe: string | null; motivation: string | null;
  user: { email: string | null; phone: string | null };
};

const mmYYYY = (d: Date | null) => (d ? `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` : "");

// Erste Fassung aus dem bestehenden WoYou-Profil – Kund:in ergänzt den Rest
export function prefillFromCandidate(c: CandidateLike, booking: { contactPhone: string | null; targetJobs: string | null }): ProfileData {
  const languages = [{ name: "Deutsch", level: c.germanLevel && c.germanLevel !== "NONE" ? c.germanLevel : "" }];
  if (c.englishLevel && c.englishLevel !== "NONE") languages.push({ name: "Englisch", level: c.englishLevel });
  return ProfileData.parse({
    firstName: c.firstName ?? "",
    lastName: c.lastName ?? "",
    zipCity: c.city ?? "",
    country: c.countryOfResidence ?? "",
    phone: booking.contactPhone || c.whatsappNumber || c.user.phone || "",
    email: c.user.email ?? "",
    birthDate: c.dateOfBirth ? c.dateOfBirth.toLocaleDateString("de-DE") : "",
    nationality: c.nationality ?? "",
    targetJob: (booking.targetJobs || c.desiredJobTitle || "").split(",")[0].trim(),
    summary: c.aboutMe ?? "",
    experience: c.currentJob ? [{ ...EMPTY_STATION, from: "", to: "heute", title: c.currentJob, place: c.currentEmployer ?? "" }] : [],
    languages,
    drivingLicense: c.drivingLicense ? "Klasse B" : "",
    availableFrom: c.earliestStart ? mmYYYY(c.earliestStart) : "sofort",
    motivation: c.motivation ?? "",
  });
}

export function parseProfile(json: string | null | undefined): ProfileData {
  try { return ProfileData.parse(JSON.parse(json || "{}")); } catch { return ProfileData.parse({}); }
}

// Was fehlt noch, damit Lebenslauf und Anschreiben gut werden?
export function missingFields(d: ProfileData): string[] {
  const m: string[] = [];
  if (!d.firstName || !d.lastName) m.push("Name");
  if (!d.phone && !d.email) m.push("Telefon oder E-Mail");
  if (!d.zipCity) m.push("Wohnort");
  if (!d.targetJob) m.push("Wunschberuf");
  if (!d.experience.some((x) => x.title)) m.push("mindestens eine Berufserfahrung");
  if (!d.education.some((x) => x.title)) m.push("mindestens eine Ausbildung bzw. Schule");
  if (!d.languages.some((x) => x.name && x.level)) m.push("Sprachkenntnisse");
  if (d.motivation.length < 60) m.push("Motivation (ein paar Sätze)");
  return m;
}
