import "server-only";

// Weitere Stellenquellen mit offizieller Schnittstelle (neben der Bundesagentur):
// - Adzuna: bündelt viele Portale; kostenloses Entwicklerkonto nötig (ADZUNA_APP_ID, ADZUNA_APP_KEY)
// - Arbeitnow: öffentliche Job-Board-API ohne Anmeldung; keine Suche, daher neueste Anzeigen laden und selbst filtern
// Portale ohne Schnittstelle (Kleinanzeigen, StepStone, Indeed, LinkedIn) verbieten automatisches Auslesen –
// dort nur Suchlinks und manuelle Übernahme (src/lib/portals.ts).
import type { BaJob } from "@/lib/jobs-ba";
import { extractEmails } from "@/lib/jobs-ba";

export type ExtraJob = BaJob & { source: "ADZUNA" | "ARBEITNOW"; description: string; email: string | null };

const text = (html: string) => html.replace(/<\/(p|li|h\d|div|br)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

export const adzunaEnabled = () => !!(process.env.ADZUNA_APP_ID && process.env.ADZUNA_APP_KEY);

export async function searchAdzuna(was: string, wo?: string): Promise<ExtraJob[]> {
  if (!adzunaEnabled()) return [];
  const q = new URLSearchParams({ app_id: process.env.ADZUNA_APP_ID!, app_key: process.env.ADZUNA_APP_KEY!, what: was, results_per_page: "50", max_days_old: "30", "content-type": "application/json" });
  if (wo) { q.set("where", wo); q.set("distance", "50"); }
  const r = await fetch(`https://api.adzuna.com/v1/api/jobs/de/search/1?${q}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`Adzuna nicht erreichbar (${r.status})`);
  const j = (await r.json()) as { results?: { id: string; title: string; company?: { display_name?: string }; location?: { display_name?: string }; description?: string; redirect_url: string; created?: string; salary_min?: number; contract_time?: string }[] };
  return (j.results ?? []).map((x) => {
    const description = text(x.description ?? "");
    return {
      source: "ADZUNA" as const, ref: `adzuna-${x.id}`, title: text(x.title), company: x.company?.display_name ?? "", city: (x.location?.display_name ?? "").split(",")[0],
      publishedAt: x.created, fulltime: x.contract_time === "full_time", parttime: x.contract_time === "part_time", salary: x.salary_min ?? null,
      externalUrl: x.redirect_url, url: x.redirect_url, description, email: extractEmails(description)[0] ?? null,
    };
  });
}

// Arbeitnow: neueste Anzeigen (bis zu 3 Seiten à 300), 1 Stunde zwischengespeichert, um den Dienst zu schonen
let cache: { at: number; jobs: { slug: string; company_name: string; title: string; description: string; url: string; tags: string[]; job_types: string[]; location: string; created_at: number }[] } | null = null;
async function arbeitnowFeed() {
  if (cache && Date.now() - cache.at < 3600e3) return cache.jobs;
  const all: NonNullable<typeof cache>["jobs"] = [];
  for (let p = 1; p <= 3; p++) {
    const r = await fetch(`https://www.arbeitnow.com/api/job-board-api?page=${p}`, { cache: "no-store", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "WoYou-Bewerbungsservice/1.0" } }).catch(() => null);
    if (!r?.ok) break;
    const j = (await r.json()) as { data?: typeof all; links?: { next?: string | null } };
    all.push(...(j.data ?? []));
    if (!j.links?.next) break;
  }
  cache = { at: Date.now(), jobs: all };
  return all;
}

export async function searchArbeitnow(terms: string[], regions: string[]): Promise<ExtraJob[]> {
  const feed = await arbeitnowFeed();
  const words = terms.flatMap((t) => norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const regs = regions.map(norm);
  return feed
    .filter((x) => {
      const hay = norm(`${x.title} ${x.tags.join(" ")}`);
      if (!words.some((w) => hay.includes(w.slice(0, Math.max(5, w.length - 2))))) return false;
      const loc = norm(x.location || "");
      // mit Wunschregion: Ort muss passen; ohne: nur deutschsprachige Anzeigen (m/w/d)
      return regs.length ? regs.some((r) => loc.includes(r)) : /\((m|w|d)\/(m|w|d)\/(d|x|m|w)\)/i.test(x.title);
    })
    .slice(0, 60)
    .map((x) => {
      const description = text(x.description);
      return {
        source: "ARBEITNOW" as const, ref: `arbeitnow-${x.slug}`.slice(0, 60), title: x.title, company: x.company_name, city: x.location,
        publishedAt: new Date(x.created_at * 1000).toISOString(), fulltime: x.job_types.some((t) => /full|vollzeit|unbefristet/i.test(t)), parttime: x.job_types.some((t) => /part|teilzeit/i.test(t)),
        salary: null, externalUrl: x.url, url: x.url, description, email: extractEmails(description)[0] ?? null,
      };
    });
}
