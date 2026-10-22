import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { ROLE } from "@/lib/enums";
import { STEPS, dueMails, marketingActive } from "@/lib/marketing";
import { mailEnabled } from "@/lib/mail";
import { MarketingRun } from "@/components/MarketingRun";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const [due, sends, optOut, users] = await Promise.all([
    dueMails(1000),
    prisma.marketingSend.groupBy({ by: ["step"], _count: { _all: true } }),
    prisma.user.count({ where: { role: ROLE.CANDIDATE, marketingOptOut: true } }),
    prisma.user.findMany({ where: { role: ROLE.CANDIDATE, deletedAt: null }, select: { signupSource: true, candidate: { select: { bookings: { where: { paidAt: { not: null } }, select: { amountCents: true } } } } } }),
  ]);
  const sent = Object.fromEntries(sends.map((s) => [s.step, s._count._all]));
  const dueBy: Record<string, number> = {};
  for (const d of due) dueBy[d.step.key] = (dueBy[d.step.key] ?? 0) + 1;
  const bySource = new Map<string, { reg: number; paid: number; revenue: number }>();
  for (const u of users) {
    const k = u.signupSource || "direkt / unbekannt";
    const r = bySource.get(k) ?? { reg: 0, paid: 0, revenue: 0 };
    r.reg++;
    const b = u.candidate?.bookings ?? [];
    if (b.length) { r.paid++; r.revenue += b.reduce((s, x) => s + x.amountCents, 0); }
    bySource.set(k, r);
  }
  const active = marketingActive();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Marketingstrecke</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Automatische Hinweis-Mails entlang des Kundenwegs, täglich einmal. Jede Person bekommt jeden Schritt höchstens einmal, jede Mail hat einen Abmeldelink.</p>
      </div>
      <div className={`card text-sm ${active ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
        {active ? "Aktiv: Mails gehen beim nächsten Lauf raus." : mailEnabled() ? "Ausgeschaltet (MARKETING_MAILS=off)." : "Vorbereitet, aber noch aus: Es fehlt das Postfach (SMTP). Sobald es eingetragen ist, läuft die Strecke automatisch los. Die Vorschau unten zeigt, wer heute welche Mail bekäme."}
        <span className="block mt-1 text-xs text-[color:var(--color-ink-soft)]">Abgemeldet: {optOut}</span>
      </div>
      {active && <MarketingRun />}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-[color:var(--color-ink-soft)]"><th className="py-1">Schritt</th><th>Wann</th><th>heute fällig</th><th>bisher verschickt</th><th>Vorschau</th></tr></thead>
          <tbody>{STEPS.map((s) => (
            <tr key={s.key} className="border-t align-top">
              <td className="py-2 font-semibold">{s.name}</td>
              <td className="py-2 text-[color:var(--color-ink-soft)]">{s.when}</td>
              <td className="py-2">{dueBy[s.key] ?? 0}</td>
              <td className="py-2">{sent[s.key] ?? 0}</td>
              <td className="py-2 whitespace-nowrap">{(["de", "en", "fr", "ar", "hi"] as const).map((l) => <a key={l} className="mr-2 text-[color:var(--color-brand)] underline" href={`/api/admin/marketing/preview?step=${s.key}&lang=${l}`} target="_blank">{l.toUpperCase()}</a>)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <div className="card overflow-x-auto">
        <h2 className="font-semibold">Herkunft der Kund:innen</h2>
        <p className="text-xs text-[color:var(--color-ink-soft)]">Aus den Werbelinks (utm_source/utm_campaign), Links siehe MARKETING.md im Repo. Ohne Cookies.</p>
        <table className="mt-3 w-full text-sm">
          <thead><tr className="text-left text-xs text-[color:var(--color-ink-soft)]"><th className="py-1">Quelle</th><th>Registrierungen</th><th>gebucht</th><th>Quote</th><th>Umsatz Startpaket</th></tr></thead>
          <tbody>{[...bySource.entries()].sort((a, b) => b[1].reg - a[1].reg).map(([k, r]) => (
            <tr key={k} className="border-t"><td className="py-1 font-semibold">{k}</td><td>{r.reg}</td><td>{r.paid}</td><td>{r.reg ? Math.round((r.paid / r.reg) * 100) : 0} %</td><td>{(r.revenue / 100).toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
