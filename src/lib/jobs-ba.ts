import "server-only";

// Stellensuche über die Jobbörse der Bundesagentur für Arbeit (offene Schnittstelle, keine Anmeldung).
// Andere Portale (Indeed, StepStone, LinkedIn) verbieten automatisches Auslesen – daher bewusst nicht angebunden.
const BASE = "https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc";
const HEADERS = { "X-API-Key": "jobboerse-jobsuche", "User-Agent": "WoYou-Bewerbungsservice/1.0" };

export type BaJob = {
  ref: string; title: string; company: string; city: string; plz?: string; distanceKm?: number;
  publishedAt?: string; startAt?: string; fulltime: boolean; parttime: boolean; salary?: number | null;
  externalUrl?: string | null; url: string; profession?: string;
};

type Raw = Record<string, unknown> & {
  referenznummer: string; stellenangebotsTitel?: string; firma?: string; hauptberuf?: string; externeURL?: string;
  stellenlokationen?: { adresse?: { ort?: string; plz?: string } }[]; entfernung?: number | string;
  datumErsteVeroeffentlichung?: string; eintrittszeitraum?: { von?: string }; arbeitszeitVollzeit?: boolean;
  arbeitszeitTeilzeitVormittag?: boolean; arbeitszeitTeilzeitNachmittag?: boolean; arbeitszeitTeilzeitFlexibel?: boolean; festgehalt?: number;
};

export const jobUrl = (ref: string) => `https://www.arbeitsagentur.de/jobsuche/jobdetail/${encodeURIComponent(ref)}`;

export async function searchJobs(opts: { was: string; wo?: string; umkreis?: number; page?: number; size?: number; angebotsart?: 1 | 4 }) {
  const q = new URLSearchParams({ was: opts.was, size: String(opts.size ?? 50), page: String(opts.page ?? 1), angebotsart: String(opts.angebotsart ?? 1) });
  if (opts.wo) { q.set("wo", opts.wo); q.set("umkreis", String(opts.umkreis ?? 50)); }
  const r = await fetch(`${BASE}/v6/jobs?${q}`, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Stellensuche nicht erreichbar (${r.status})`);
  const j = (await r.json()) as { ergebnisliste?: Raw[]; maxErgebnisse?: number };
  const jobs: BaJob[] = (j.ergebnisliste ?? []).map((x) => ({
    ref: x.referenznummer,
    title: x.stellenangebotsTitel ?? x.hauptberuf ?? "Stelle",
    company: x.firma ?? "",
    city: x.stellenlokationen?.[0]?.adresse?.ort ?? "",
    plz: x.stellenlokationen?.[0]?.adresse?.plz,
    distanceKm: x.entfernung != null ? Number(x.entfernung) : undefined,
    publishedAt: x.datumErsteVeroeffentlichung,
    startAt: x.eintrittszeitraum?.von,
    fulltime: !!x.arbeitszeitVollzeit,
    parttime: !!(x.arbeitszeitTeilzeitVormittag || x.arbeitszeitTeilzeitNachmittag || x.arbeitszeitTeilzeitFlexibel),
    salary: x.festgehalt ?? null,
    externalUrl: x.externeURL ?? null,
    url: jobUrl(x.referenznummer),
    profession: x.hauptberuf,
  }));
  return { total: j.maxErgebnisse ?? jobs.length, jobs };
}

// Details (Ausschreibungstext). E-Mail-Adressen stehen – wenn überhaupt – im Freitext.
export async function jobDetails(ref: string): Promise<{ description: string; emails: string[] } | null> {
  const b64 = Buffer.from(ref).toString("base64");
  const r = await fetch(`${BASE}/v4/jobdetails/${b64}`, { headers: HEADERS, cache: "no-store", signal: AbortSignal.timeout(20000) }).catch(() => null);
  if (!r || !r.ok) return null;
  const j = (await r.json()) as { stellenangebotsBeschreibung?: string };
  const description = (j.stellenangebotsBeschreibung ?? "").replace(/\r/g, "").trim();
  return { description, emails: extractEmails(description) };
}

export function extractEmails(text: string): string[] {
  const found = text.replace(/\s*\[at\]\s*|\s*\(at\)\s*/gi, "@").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? [];
  return [...new Set(found.map((e) => e.toLowerCase().replace(/\.$/, "")))].filter((e) => !/arbeitsagentur\.de$/.test(e)).slice(0, 5);
}
