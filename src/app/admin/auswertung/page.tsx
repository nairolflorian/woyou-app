import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { formatPrice } from "@/lib/services";

export const dynamic = "force-dynamic";

// Auswertung des Bewerbungs-Service: Umsatz, Kundenweg, Bewerbungen, Antworten und welche Stellenquelle trägt.
const SENT = ["SENT", "APPLIED_MANUALLY"];
const TAKEN = ["SELECTED", "READY", "SENT", "APPLIED_MANUALLY"];
const PAID_PURCHASE = ["PAID", "ACTIVE", "CANCELLING", "ENDED"];
const SOURCE_LABEL: Record<string, string> = { BA: "Bundesagentur für Arbeit", ARBEITNOW: "Arbeitnow", ADZUNA: "Adzuna", KARRIERESEITE: "Karriereseiten (Feeds)", MANUAL: "Von Hand / Portale" };
const day = 86_400_000;

export default async function Auswertung() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const since30 = new Date(Date.now() - 30 * day);
  const since8w = new Date(Date.now() - 56 * day);

  const [registered, bookings, purchases, profiles, leads, sentLeads] = await Promise.all([
    prisma.user.count({ where: { role: ROLE.CANDIDATE, deletedAt: null } }),
    prisma.serviceBooking.findMany({ where: { status: { not: "CANCELLED" } }, select: { amountCents: true, paidAt: true } }),
    prisma.creditPurchase.findMany({ where: { status: { in: PAID_PURCHASE } }, select: { kind: true, amountCents: true, paidAt: true } }),
    prisma.applicationProfile.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.jobLead.groupBy({ by: ["source", "status"], _count: { _all: true } }),
    prisma.jobLead.findMany({ where: { status: { in: SENT } }, select: { source: true, sentAt: true, updatedAt: true, response: true, bookingId: true } }),
  ]);

  const paid = bookings.filter((b) => b.paidAt);
  const sum = (xs: { amountCents: number }[]) => xs.reduce((s, x) => s + x.amountCents, 0);
  const in30 = <T extends { paidAt: Date | null }>(xs: T[]) => xs.filter((x) => x.paidAt && x.paidAt >= since30);
  const revenue = sum(paid) + sum(purchases);
  const revenue30 = sum(in30(paid)) + sum(in30(purchases));
  const prof = Object.fromEntries(profiles.map((p) => [p.status, p._count._all]));
  const withSent = new Set(sentLeads.map((l) => l.bookingId)).size;
  const answered = sentLeads.filter((l) => l.response?.trim()).length;
  const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)} %` : "–");

  const funnel: [string, number][] = [
    ["Registriert", registered],
    ["Gebucht", bookings.length],
    ["Bezahlt", paid.length],
    ["Mappe eingereicht", (prof.SUBMITTED ?? 0) + (prof.APPROVED ?? 0)],
    ["Mappe freigegeben", prof.APPROVED ?? 0],
    ["Erste Bewerbung raus", withSent],
  ];

  const src = new Map<string, { found: number; taken: number; sent: number; answers: number }>();
  for (const l of leads) {
    const r = src.get(l.source) ?? { found: 0, taken: 0, sent: 0, answers: 0 };
    r.found += l._count._all;
    if (TAKEN.includes(l.status)) r.taken += l._count._all;
    if (SENT.includes(l.status)) r.sent += l._count._all;
    src.set(l.source, r);
  }
  for (const l of sentLeads) if (l.response?.trim()) src.get(l.source)!.answers++;
  const sources = [...src.entries()].sort((a, b) => b[1].sent - a[1].sent || b[1].found - a[1].found);

  // Verschickte Bewerbungen je Woche (letzte 8 Wochen)
  const weeks = Array.from({ length: 8 }, (_, i) => ({ start: new Date(since8w.getTime() + i * 7 * day), n: 0 }));
  for (const l of sentLeads) {
    const t = (l.sentAt ?? l.updatedAt).getTime() - since8w.getTime();
    if (t >= 0) weeks[Math.min(7, Math.floor(t / (7 * day)))].n++;
  }
  const maxW = Math.max(1, ...weeks.map((w) => w.n));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Auswertung</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Bewerbungs-Service auf einen Blick: Umsatz, Kundenweg, verschickte Bewerbungen und welche Stellenquelle am meisten bringt.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Umsatz gesamt", formatPrice(revenue), `${paid.length} Startpakete, ${purchases.length} Nachkäufe/Abos`],
          ["Umsatz 30 Tage", formatPrice(revenue30), ""],
          ["Bewerbungen verschickt", String(sentLeads.length), `${sentLeads.filter((l) => l.sentAt && l.sentAt >= since30).length} in den letzten 30 Tagen`],
          ["Antworten von Firmen", String(answered), `Antwortquote ${pct(answered, sentLeads.length)}`],
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
              <div className="w-14 text-right text-[color:var(--color-ink-soft)]">{i ? pct(n, funnel[i - 1][1]) : ""}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-x-auto">
        <h2 className="font-semibold">Stellenquellen</h2>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Gefunden = als Vorschlag angelegt. Übernommen = vom Team ausgewählt. Antworten zählen, sobald bei der Bewerbung eine Rückmeldung eingetragen ist.</p>
        <table className="mt-3 w-full text-sm">
          <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Quelle</th><th className="text-right">Gefunden</th><th className="text-right">Übernommen</th><th className="text-right">Verschickt</th><th className="text-right">Antworten</th><th className="text-right">Quote</th></tr></thead>
          <tbody>
            {sources.map(([k, r]) => (
              <tr key={k} className="border-t">
                <td className="py-2">{SOURCE_LABEL[k] ?? k}</td>
                <td className="text-right">{r.found}</td>
                <td className="text-right">{r.taken} <span className="text-[color:var(--color-ink-soft)]">({pct(r.taken, r.found)})</span></td>
                <td className="text-right">{r.sent}</td>
                <td className="text-right">{r.answers}</td>
                <td className="text-right">{pct(r.answers, r.sent)}</td>
              </tr>
            ))}
            {!sources.length && <tr><td colSpan={6} className="py-3 text-[color:var(--color-ink-soft)]">Noch keine Stellen.</td></tr>}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="font-semibold">Verschickte Bewerbungen je Woche</h2>
        <div className="mt-4 flex h-40 items-end gap-2">
          {weeks.map((w) => (
            <div key={w.start.toISOString()} className="flex flex-1 flex-col items-center gap-1">
              <div className="text-xs font-semibold">{w.n || ""}</div>
              <div className="w-full rounded-t bg-[color:var(--color-brand-deep)]" style={{ height: `${(w.n / maxW) * 110}px` }} />
              <div className="text-[10px] text-[color:var(--color-ink-soft)]">{w.start.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}</div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-xs text-[color:var(--color-ink-soft)]">Ältere Kennzahlen aus der Vermittlung: <Link href="/admin/analytics" className="underline">Analytics</Link></p>
    </div>
  );
}
