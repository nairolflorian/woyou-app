import "server-only";

// Öffentliche Stellen-Feeds von Arbeitgeber-Karriereseiten (offiziell von den Anbietern bereitgestellt):
//   Personio:   https://<slug>.jobs.personio.de/xml   (alternativ .com)
//   Greenhouse: https://boards-api.greenhouse.io/v1/boards/<slug>/jobs?content=true
//   Lever:      https://api.lever.co/v0/postings/<slug>?mode=json
// Eintrag per Karriereseiten-Link im Admin (Stellenquellen); die Kennung wird daraus erkannt.
import { prisma } from "@/lib/prisma";
import { extractEmails, type BaJob } from "@/lib/jobs-ba";

export type FeedKind = "PERSONIO" | "GREENHOUSE" | "LEVER";
export type FeedJob = BaJob & { source: "KARRIERESEITE"; description: string; email: string | null };

const text = (html: string) => html.replace(/<\/(p|li|h\d|div|br)>|<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
const unescapeXml = (s: string) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
const tag = (xml: string, t: string) => unescapeXml(xml.match(new RegExp(`<${t}>([\\s\\S]*?)</${t}>`))?.[1] ?? "").trim();

// Link der Karriereseite → Anbieter und Kennung
export function detectFeed(input: string): { kind: FeedKind; slug: string } | null {
  const s = input.trim();
  let m = s.match(/^https?:\/\/([a-z0-9-]+)\.jobs\.personio\.(de|com)/i);
  if (m) return { kind: "PERSONIO", slug: m[1].toLowerCase() };
  m = s.match(/(?:boards|job-boards)(?:\.eu)?\.greenhouse\.io\/(?:embed\/job_board\?for=)?([a-z0-9_-]+)/i) || s.match(/boards-api\.greenhouse\.io\/v1\/boards\/([a-z0-9_-]+)/i);
  if (m) return { kind: "GREENHOUSE", slug: m[1].toLowerCase() };
  m = s.match(/jobs\.lever\.co\/([a-z0-9_-]+)/i) || s.match(/api\.lever\.co\/v0\/postings\/([a-z0-9_-]+)/i);
  if (m) return { kind: "LEVER", slug: m[1].toLowerCase() };
  return null;
}

async function get(url: string) {
  const r = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(20000), headers: { "User-Agent": "WoYou-Bewerbungsservice/1.0" } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r;
}

export async function loadFeed(kind: FeedKind, slug: string, company: string): Promise<FeedJob[]> {
  const mk = (x: Omit<FeedJob, "source" | "email" | "fulltime" | "parttime"> & { fulltime?: boolean; parttime?: boolean }): FeedJob => ({ source: "KARRIERESEITE", fulltime: false, parttime: false, ...x, email: extractEmails(x.description)[0] ?? null });
  if (kind === "PERSONIO") {
    let xml = "";
    for (const tld of ["de", "com"]) { try { xml = await (await get(`https://${slug}.jobs.personio.${tld}/xml`)).text(); if (xml.includes("<position>")) break; } catch { /* nächste Domain */ } }
    if (!xml) throw new Error("Personio-Feed nicht erreichbar (Feed in Personio aktiviert?)");
    return [...xml.matchAll(/<position>([\s\S]*?)<\/position>/g)].map(([, p]) => {
      const id = tag(p, "id");
      const desc = [...p.matchAll(/<jobDescription>([\s\S]*?)<\/jobDescription>/g)].map(([, d]) => `${tag(d, "name")}\n${text(tag(d, "value"))}`).join("\n");
      const schedule = tag(p, "schedule");
      return mk({ ref: `personio-${slug}-${id}`, title: tag(p, "name"), company: tag(p, "subcompany") || company, city: tag(p, "office"), publishedAt: tag(p, "createdAt") || undefined,
        fulltime: /full/i.test(schedule), parttime: /part/i.test(schedule), salary: null, url: `https://${slug}.jobs.personio.de/job/${id}`, externalUrl: `https://${slug}.jobs.personio.de/job/${id}`, description: desc });
    });
  }
  if (kind === "GREENHOUSE") {
    const j = (await (await get(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`)).json()) as { jobs?: { id: number; title: string; absolute_url: string; location?: { name?: string }; content?: string; updated_at?: string; company_name?: string }[] };
    return (j.jobs ?? []).map((x) => mk({ ref: `greenhouse-${slug}-${x.id}`, title: x.title, company: x.company_name || company, city: x.location?.name ?? "", publishedAt: x.updated_at, salary: null, url: x.absolute_url, externalUrl: x.absolute_url, description: text(unescapeXml(x.content ?? "")) }));
  }
  const j = (await (await get(`https://api.lever.co/v0/postings/${slug}?mode=json`)).json()) as { id: string; text: string; hostedUrl: string; applyUrl?: string; categories?: { location?: string; commitment?: string }; descriptionPlain?: string; lists?: { text: string; content: string }[]; createdAt?: number }[];
  return (Array.isArray(j) ? j : []).map((x) => mk({ ref: `lever-${slug}-${x.id}`.slice(0, 60), title: x.text, company, city: x.categories?.location ?? "", publishedAt: x.createdAt ? new Date(x.createdAt).toISOString() : undefined,
    fulltime: /full/i.test(x.categories?.commitment ?? ""), parttime: /part/i.test(x.categories?.commitment ?? ""), salary: null, url: x.hostedUrl, externalUrl: x.applyUrl || x.hostedUrl,
    description: [x.descriptionPlain ?? "", ...(x.lists ?? []).map((l) => `${l.text}\n${text(l.content)}`)].join("\n") }));
}

// Alle aktiven Feeds laden (1 Stunde zwischengespeichert), Ergebnis je Feed protokollieren
let cache: { at: number; jobs: FeedJob[] } | null = null;
export async function allFeedJobs(): Promise<FeedJob[]> {
  if (cache && Date.now() - cache.at < 3600e3) return cache.jobs;
  const feeds = await prisma.careerFeed.findMany({ where: { active: true } });
  const jobs: FeedJob[] = [];
  for (const f of feeds) {
    try {
      const list = await loadFeed(f.kind as FeedKind, f.slug, f.name);
      jobs.push(...list);
      await prisma.careerFeed.update({ where: { id: f.id }, data: { lastCount: list.length, lastError: null, checkedAt: new Date() } });
    } catch (e) {
      await prisma.careerFeed.update({ where: { id: f.id }, data: { lastError: e instanceof Error ? e.message : String(e), checkedAt: new Date() } });
    }
  }
  cache = { at: Date.now(), jobs };
  return jobs;
}
export const clearFeedCache = () => { cache = null; };

const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
export async function searchFeeds(terms: string[], regions: string[]): Promise<FeedJob[]> {
  const words = terms.flatMap((t) => norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
  const regs = regions.map(norm);
  return (await allFeedJobs()).filter((x) => {
    const hay = norm(`${x.title} ${x.description.slice(0, 400)}`);
    if (!words.some((w) => hay.includes(w.slice(0, Math.max(5, w.length - 2))))) return false;
    return !regs.length || regs.some((r) => norm(x.city).includes(r));
  }).slice(0, 80);
}
