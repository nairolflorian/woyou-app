import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { formatPrice } from "@/lib/services";
import { SOURCE_NAME, type Source } from "@/lib/stellensuche-core";

export const dynamic = "force-dynamic";

// Auswertung (Weg 1): Umsatz, Kundenweg bis „Werkzeug aktiv“ und anonyme Summen aus dem Werkzeug.
// Einzelne Tracker-Einträge sieht das Team nicht; hier stehen nur Summen über alle Kund:innen.
const PAID_PURCHASE = ["PAID", "ACTIVE", "CANCELLING", "ENDED"];
const STATUS_LABEL: Record<string, string> = { SAVED: "gemerkt", APPLIED: "beworben", REPLY: "Antwort", INTERVIEW: "Gespräch", REJECTED: "Absage", OFFER: "Zusage" };
const day = 86_400_000;

export default async function Auswertung() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const now = new Date();
  const since30 = new Date(Date.now() - 30 * day);

  const [registered, bookings, purchases, profiles, toolActive, bySource, byStatus, users] = await Promise.all([
    prisma.user.count({ where: { role: ROLE.CANDIDATE, deletedAt: null } }),
    prisma.serviceBooking.findMany({ where: { status: { not: "CANCELLED" } }, select: { amountCents: true, paidAt: true } }),
    prisma.creditPurchase.findMany({ where: { status: { in: PAID_PURCHASE }, paidAt: { not: null } }, select: { kind: true, amountCents: true, paidAt: true } }),
    prisma.applicationProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.candidate.count({ where: { toolAccessUntil: { gt: now } } }),
    prisma.savedJob.groupBy({ by: ["source"], _count: { _all: true } }),
    prisma.savedJob.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.savedJob.groupBy({ by: ["candidateId"], _count: { _all: true } }),
  ]);

  const paid = bookings.filter((b) => b.paidAt);
  const sum = (xs: { amountCents: number }[]) => xs.reduce((s, x) => s + x.amountCents, 0);
  const in30 = <T extends { paidAt: Date | null }>(xs: T[]) => xs.filter((x) => x.paidAt && x.paidAt >= since30);
  const revenue = sum(paid) + sum(purchases);
  const revenue30 = sum(in30(paid)) + sum(in30(purchases));
  const prof = Object.fromEntries(profiles.map((p) => [p.status, p._count._all]));
  const saved = bySource.reduce((s, x) => s + x._count._all, 0);
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "keine Daten");

  const funnel: [string, number][] = [
    ["Registriert", registered],
    ["Gebucht", bookings.length],
    ["Bezahlt", paid.length],
    ["Mappe eingereicht", (prof.SUBMITTED ?? 0) + (prof.APPROVED ?? 0)],
    ["Unterlagen fertig", prof.APPROVED ?? 0],
    ["Werkzeug genutzt", users.length],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auswertung</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Unterlagen und Bewerbungswerkzeug auf einen Blick: Umsatz, Kundenweg und anonyme Summen aus der Stellensuche.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Umsatz gesamt", formatPrice(revenue), purchases.length ? `${paid.length} Startpakete, ${purchases.length} frühere Käufe` : `${paid.length} Startpakete`],
          ["Umsatz 30 Tage", formatPrice(revenue30), ""],
          ["Werkzeug aktiv", String(toolActive), "Kund:innen mit laufendem Zugang"],
          ["Gemerkte Stellen", String(saved), `bei ${users.length} Kund:innen`],
        ].map(([k, v, h]) => (
          <div key={k} className="card">
            <div className="text-sm text-[color:var(--color-ink-soft)]">{k}</div>
            <div className="mt-1 text-2xl font-bold">{v}</div>
            {h && <div className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{h}</div>}
          </div>
        ))}
      </div>

      <section className="card">
        <h2 className="font-semibold">Kundenweg</h2>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Wie viele kommen von Schritt zu Schritt weiter. Die Prozentzahl bezieht sich auf den Schritt davor.</p>
        <div className="mt-4 space-y-2">
          {funnel.map(([k, n], i) => (
            <div key={k} className="flex items-center gap-3 text-sm">
              <div className="w-44 shrink-0">{k}</div>
              <div className="h-6 flex-1 rounded bg-slate-100">
                <div className="h-6 rounded bg-[color:var(--color-brand)]" style={{ width: `${funnel[0][1] ? Math.max(2, (n / funnel[0][1]) * 100) : 0}%` }} />
              </div>
              <div className="w-12 text-right font-semibold">{n}</div>
              <div className="w-20 text-right text-[color:var(--color-ink-soft)]">{i ? pct(n, funnel[i - 1][1]) : ""}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="font-semibold">Stellenquellen und Stand (Summen über alle Kund:innen)</h2>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Woher die gemerkten Stellen kommen und welchen Stand die Kund:innen selbst eingetragen haben. Keine Einzelpersonen.</p>
        <div className="mt-3 grid gap-6 md:grid-cols-2">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Quelle</th><th className="text-right">gemerkt</th></tr></thead>
            <tbody>
              {bySource.sort((a, b) => b._count._all - a._count._all).map((x) => <tr key={x.source} className="border-t"><td className="py-2">{SOURCE_NAME[x.source as Source] ?? x.source}</td><td className="text-right">{x._count._all}</td></tr>)}
              {!bySource.length && <tr><td colSpan={2} className="py-3 text-[color:var(--color-ink-soft)]">Noch keine gemerkten Stellen.</td></tr>}
            </tbody>
          </table>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Stand</th><th className="text-right">Anzahl</th></tr></thead>
            <tbody>
              {Object.keys(STATUS_LABEL).map((k) => <tr key={k} className="border-t"><td className="py-2">{STATUS_LABEL[k]}</td><td className="text-right">{byStatus.find((x) => x.status === k)?._count._all ?? 0}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
