import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { formatPrice } from "@/lib/services";
import { SOURCE_NAME, type Source } from "@/lib/stellensuche-core";
import { pilotReport } from "@/lib/report";
import { PILOT_ZIELE, zielStatus, LAND_LABEL, GRUPPE_LABEL, type Ziel, type ZielStatus, type LandCode } from "@/lib/pilot-core";
import type { BalkanGroup } from "@/lib/selfcheck";
import { selbstcheckVorBuchungAn, selfcheckMode } from "@/lib/selbstcheck-vorbuchung-server";
import { trackingStatus } from "@/lib/tracking";

export const dynamic = "force-dynamic";

// Auswertung (Weg 1): Umsatz, Kundenweg bis „Werkzeug aktiv“ und anonyme Summen aus dem Werkzeug.
// Einzelne Tracker-Einträge sieht das Team nicht; hier stehen nur Summen über alle Kund:innen.
const PAID_PURCHASE = ["PAID", "ACTIVE", "CANCELLING", "ENDED"];
const STATUS_LABEL: Record<string, string> = { SAVED: "gemerkt", APPLIED: "beworben", REPLY: "Antwort", INTERVIEW: "Gespräch", REJECTED: "Absage", OFFER: "Zusage" };
const day = 86_400_000;

// Pilot Westbalkan: Darstellung der Kennzahlen (Regeln in src/lib/pilot-core.ts)
const STATUS_TON: Record<ZielStatus, string> = { "im Ziel": "bg-emerald-100 text-emerald-800", "unter Ziel": "bg-amber-100 text-amber-800", "über Ziel": "bg-sky-100 text-sky-800", "keine Daten": "bg-slate-200 text-slate-700" };
const zahl = (x: number) => x.toLocaleString("de-DE");
const prozent = (x: number | null) => (x === null ? "keine Daten" : `${x.toLocaleString("de-DE")} %`);
const datum = (d: Date) => d.toLocaleDateString("de-DE", { timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric" });
const zielText = (z: Ziel, einheit = "") => (z.min !== undefined && z.max !== undefined ? `${zahl(z.min)} bis ${zahl(z.max)}${einheit}` : z.min !== undefined ? `mindestens ${zahl(z.min)}${einheit}` : `unter ${zahl(z.max ?? 0)}${einheit}`);
const landName = (k: string) => LAND_LABEL[k as LandCode] ?? k;
const gruppeName = (k: string) => GRUPPE_LABEL[k as BalkanGroup] ?? "ohne Angabe";

export default async function Auswertung() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const now = new Date();
  const since30 = new Date(Date.now() - 30 * day);

  const pilot = await pilotReport(now);
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

  // Kennzahlen gegen die Ziele aus dem Konzept v4. Stückzahlen bewerten wir während des Pilots nach der Hochrechnung.
  const p = pilot;
  const kpis: { k: string; ist: string; ziel: string; status: ZielStatus; hinweis: string }[] = [
    { k: "Selbstchecks", ist: zahl(p.selbstchecks.total), ziel: zielText(PILOT_ZIELE.selbstchecks), status: zielStatus(p.selbstchecksHochrechnung, PILOT_ZIELE.selbstchecks),
      hinweis: p.laeuft && p.selbstchecksHochrechnung !== null ? `Hochrechnung bis ${datum(p.ende)}: ${zahl(p.selbstchecksHochrechnung)}` : "" },
    { k: "Anteil „sinnvoll“", ist: prozent(p.selbstchecks.greenPct), ziel: zielText(PILOT_ZIELE.anteilSinnvoll, " %"), status: zielStatus(p.selbstchecks.greenPct, PILOT_ZIELE.anteilSinnvoll),
      hinweis: `${zahl(p.selbstchecks.green)} grün, ${zahl(p.selbstchecks.yellow)} gelb, ${zahl(p.selbstchecks.red)} rot` },
    { k: "Buchungen bezahlt", ist: zahl(p.buchungenBezahlt), ziel: zielText(PILOT_ZIELE.buchungen), status: zielStatus(p.buchungenHochrechnung, PILOT_ZIELE.buchungen),
      hinweis: p.laeuft && p.buchungenHochrechnung !== null ? `ohne Stornos, Hochrechnung bis ${datum(p.ende)}: ${zahl(p.buchungenHochrechnung)}` : `ohne Stornos, bezahlt ab ${datum(p.bezahltAb)}` },
    { k: "Stornoquote", ist: prozent(p.storno.pct), ziel: zielText(PILOT_ZIELE.stornoQuote, " %"), status: zielStatus(p.storno.pct, PILOT_ZIELE.stornoQuote),
      hinweis: `${zahl(p.storno.storniert)} von ${zahl(p.storno.bezahlt)} bezahlten storniert. Der Grund wird noch nicht erfasst, daher alle Stornos.` },
    { k: `Mappen fertig bis ${datum(p.stichtag).slice(0, 6)}`, ist: prozent(p.mappen.pct), ziel: zielText(PILOT_ZIELE.mappenBis, " %"), status: zielStatus(p.mappen.pct, PILOT_ZIELE.mappenBis),
      hinweis: `${zahl(p.mappen.fertig)} von ${zahl(p.mappen.basis)} Kund:innen bis zum Stichtag freigegeben${now < p.stichtag ? ", Stichtag noch nicht erreicht" : ""}` },
  ];
  // Stornos mit Ziel „unter“: über dem Ziel ist schlecht
  const ton = (k: string, st: ZielStatus) => (k === "Stornoquote" && st === "über Ziel" ? "bg-rose-100 text-rose-800" : STATUS_TON[st]);

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
        {/* Nur Anzeige: geschaltet über SELBSTCHECK_VOR_BUCHUNG (on) und SELFCHECK_MODE (warn/block) in der Server-Umgebung */}
        <p className="mt-2 text-sm">
          Selbstcheck vor der Buchung: <strong>{selbstcheckVorBuchungAn() ? "an" : "aus"}</strong>
          {selbstcheckVorBuchungAn() && <span className="text-[color:var(--color-ink-soft)]"> (bei Rot: {selfcheckMode() === "block" ? "keine Buchung möglich" : "Hinweis mit Bestätigung"})</span>}
        </p>
        {/* Nur Anzeige: META_PIXEL_ID und GOOGLE_TAG_ID in der Server-Umgebung; Skripte laden erst nach Einwilligung im Banner */}
        <p className="mt-1 text-sm">
          Meta Pixel: <strong>{trackingStatus().meta}</strong> · Google-Tag: <strong>{trackingStatus().google}</strong>
        </p>
      </div>

      <section className="card space-y-4">
        <div>
          <h2 className="font-semibold">Pilot Westbalkan</h2>
          <p className="text-sm text-[color:var(--color-ink-soft)]">
            Soft Launch ab {datum(p.start)}, bezahlt ab {datum(p.bezahltAb)}, Auswertung bis {datum(p.ende)}. Ziele aus dem Konzept v4 für die Entscheidung Ende Januar.
            {!p.laeuft && now < p.start && " Der Pilot hat noch nicht begonnen."}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((x) => (
            <div key={x.k} className="rounded-xl border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 text-sm text-[color:var(--color-ink-soft)]">{x.k}</div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${ton(x.k, x.status)}`}>{x.status}</span>
              </div>
              <div className="mt-1 break-words text-2xl font-bold">{x.ist}</div>
              <div className="text-xs">Ziel: {x.ziel}</div>
              {x.hinweis && <div className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{x.hinweis}</div>}
            </div>
          ))}
        </div>
        <div className="grid gap-6 overflow-x-auto md:grid-cols-3">
          <table className="w-full text-sm">
            <caption className="text-left font-semibold">Selbstchecks nach Land</caption>
            <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Land</th><th className="text-right">Anzahl</th><th className="text-right">sinnvoll</th></tr></thead>
            <tbody>
              {p.nachLand.map((x) => <tr key={x.key} className="border-t"><td className="py-2">{landName(x.key)}</td><td className="text-right">{zahl(x.total)}</td><td className="text-right">{prozent(x.greenPct)}</td></tr>)}
              {!p.nachLand.length && <tr><td colSpan={3} className="py-3 text-[color:var(--color-ink-soft)]">Noch keine Selbstchecks im Pilotzeitraum.</td></tr>}
            </tbody>
          </table>
          <table className="w-full text-sm">
            <caption className="text-left font-semibold">Westbalkan nach Berufsgruppe</caption>
            <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Berufsgruppe</th><th className="text-right">Anzahl</th><th className="text-right">sinnvoll</th></tr></thead>
            <tbody>
              {p.nachGruppe.map((x) => <tr key={x.key} className="border-t"><td className="py-2">{gruppeName(x.key)}</td><td className="text-right">{zahl(x.total)}</td><td className="text-right">{prozent(x.greenPct)}</td></tr>)}
              {!p.nachGruppe.length && <tr><td colSpan={3} className="py-3 text-[color:var(--color-ink-soft)]">Noch keine Selbstchecks aus dem Westbalkan.</td></tr>}
            </tbody>
          </table>
          <table className="w-full text-sm">
            <caption className="text-left font-semibold">Bezahlte Buchungen nach Land</caption>
            <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th className="py-2">Land</th><th className="text-right">bezahlt</th><th className="text-right">storniert</th></tr></thead>
            <tbody>
              {p.bezahltNachLand.map((x) => <tr key={x.key} className="border-t"><td className="py-2">{landName(x.key)}</td><td className="text-right">{zahl(x.bezahlt)}</td><td className="text-right">{zahl(x.storniert)}</td></tr>)}
              {!p.bezahltNachLand.length && <tr><td colSpan={3} className="py-3 text-[color:var(--color-ink-soft)]">Noch keine bezahlten Buchungen im Pilotzeitraum.</td></tr>}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-[color:var(--color-ink-soft)]">
          Selbstchecks werden ohne Personenbezug gezählt (Land, Berufsgruppe, Deutschniveau, Ergebnis). Anteil Westbalkan an allen Selbstchecks: {prozent(p.balkanAnteilPct)}.
          Das Land bei Buchungen kommt aus Mappe und Profil (Staatsangehörigkeit, sonst Land der Adresse). Storno = bezahlt und danach storniert.
          Mappen fertig = Buchungen vom Pilotstart bis zum Stichtag (im Soft Launch auch unbezahlt, danach nur bezahlt, ohne Stornos), deren Mappe bis zum Stichtag freigegeben wurde.
          Monatszahlen mit CSV unter <a href="/admin/buchungen" className="underline">Buchungen</a>.
        </p>
      </section>

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
