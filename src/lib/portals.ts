// Stellenportale ohne offene Schnittstelle: nur Suchlinks (öffnen im Browser des Bearbeiters) und manuelle Übernahme.
// Automatisches Auslesen ist dort verboten (z. B. Kleinanzeigen § 5 Nr. 1 Nutzungsbedingungen).
export const PORTALS = {
  KLEINANZEIGEN: "Kleinanzeigen",
  STEPSTONE: "StepStone",
  INDEED: "Indeed",
  LINKEDIN: "LinkedIn",
  FIRMA: "Firmenseite",
  MANUAL: "Sonstige",
} as const;
export type Portal = keyof typeof PORTALS;
export const SOURCE_LABEL: Record<string, string> = { BA: "Bundesagentur", ADZUNA: "Adzuna", ARBEITNOW: "Arbeitnow", ...PORTALS };

const slug = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function portalSearchLinks(was: string, wo: string) {
  const q = encodeURIComponent(was), l = encodeURIComponent(wo);
  return [
    { key: "KLEINANZEIGEN", label: "Kleinanzeigen", href: `https://www.kleinanzeigen.de/s-jobs/${slug([was, wo].filter(Boolean).join(" ")) || "jobs"}/k0c102` },
    { key: "STEPSTONE", label: "StepStone", href: wo ? `https://www.stepstone.de/jobs/${slug(was)}/in-${slug(wo)}` : `https://www.stepstone.de/jobs/${slug(was)}` },
    { key: "INDEED", label: "Indeed", href: `https://de.indeed.com/jobs?q=${q}${wo ? `&l=${l}` : ""}` },
    { key: "LINKEDIN", label: "LinkedIn", href: `https://www.linkedin.com/jobs/search/?keywords=${q}${wo ? `&location=${l}` : "&location=Deutschland"}` },
  ];
}
