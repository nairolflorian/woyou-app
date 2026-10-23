import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { adzunaEnabled } from "@/lib/jobs-extra";
import { FeedManager } from "@/components/FeedManager";

export const dynamic = "force-dynamic";

const SOURCES: { name: string; how: string; state: (a: boolean) => string }[] = [
  { name: "Bundesagentur für Arbeit (Jobbörse)", how: "automatisch, offene Schnittstelle, volle Ausschreibung mit E-Mail", state: () => "aktiv" },
  { name: "Arbeitnow", how: "automatisch, offene Schnittstelle ohne Anmeldung; vor allem Büro- und IT-Stellen", state: () => "aktiv" },
  { name: "Karriereseiten (Personio, Greenhouse, Lever)", how: "automatisch über die öffentlichen Feeds der Arbeitgeber, unten hinterlegen", state: () => "aktiv, je hinterlegtem Arbeitgeber" },
  { name: "Adzuna", how: "automatisch, bündelt viele Portale; kostenloses Entwicklerkonto nötig", state: (a) => (a ? "aktiv" : "vorbereitet, Schlüssel fehlt") },
  { name: "Jooble, Careerjet", how: "Suchmaschinen mit Partner-Schnittstelle; Schlüssel auf Anfrage", state: () => "noch nicht angebunden" },
  { name: "Kleinanzeigen, StepStone, Indeed, LinkedIn", how: "keine offene Schnittstelle, automatisches Auslesen verboten: Kund:innen suchen dort selbst und tragen Stellen im Tracker ein", state: () => "manuell" },
  { name: "Google Jobs", how: "keine offizielle Suchschnittstelle; nur über kostenpflichtige Drittanbieter, die Google auslesen – nicht empfohlen", state: () => "nicht angebunden" },
];

export default async function SourcesPage() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const feeds = await prisma.careerFeed.findMany({ orderBy: { name: "asc" } });
  const a = adzunaEnabled();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stellenquellen</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Woher die Treffer in der Stellensuche der Kund:innen kommen. Stellen, für die man sich auf einem Portal anmelden muss, erscheinen mit „über Firmenseite“. Welche Stelle sie auswählen und wie sie sich bewerben, entscheiden die Kund:innen selbst.</p>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-[color:var(--color-ink-soft)]"><th className="py-1">Quelle</th><th>So kommen die Stellen rein</th><th>Stand</th></tr></thead>
          <tbody>{SOURCES.map((s) => <tr key={s.name} className="border-t align-top"><td className="py-2 font-semibold">{s.name}</td><td className="py-2">{s.how}</td><td className="py-2 whitespace-nowrap">{s.state(a)}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="card space-y-3">
        <h2 className="font-semibold">Karriereseiten von Arbeitgebern</h2>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Link der Karriereseite einfügen, z. B. <code>https://firma.jobs.personio.de</code>, <code>https://boards.greenhouse.io/firma</code> oder <code>https://jobs.lever.co/firma</code>. Woyou prüft den Feed sofort und nimmt die Stellen in die Stellensuche auf.</p>
        <FeedManager feeds={feeds.map((f) => ({ id: f.id, name: f.name, kind: f.kind, slug: f.slug, active: f.active, lastCount: f.lastCount, lastError: f.lastError, checkedAt: f.checkedAt?.toLocaleString("de-DE") ?? null }))} />
      </div>
    </div>
  );
}
