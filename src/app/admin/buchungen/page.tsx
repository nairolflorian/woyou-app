import { prisma } from "@/lib/prisma";
import { BookingRow } from "@/components/BookingRow";
import { BOOKING_STATUS, BOOKING_STATUS_LABEL, formatPrice } from "@/lib/services";
import { mailEnabled } from "@/lib/mail";
import { getStripe } from "@/lib/stripe";
import { monthlyReport } from "@/lib/report";

export const dynamic = "force-dynamic";
const d = (x: Date | null) => (x ? x.toLocaleDateString("de-DE") : "");

export default async function AdminBookingsPage() {
  const bookings = await prisma.serviceBooking.findMany({ orderBy: { createdAt: "desc" }, include: { candidate: { include: { user: true } } }, take: 200 });
  const mails = await prisma.emailLog.findMany({ orderBy: { createdAt: "desc" }, take: 20 });
  const count = (s: string) => bookings.filter((b) => b.status === s).length;
  const revenue = bookings.filter((b) => b.paidAt).reduce((s, b) => s + b.amountCents, 0);
  const report = await monthlyReport(6);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Buchungen · Bewerbungs-Service</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          Zahlung: {getStripe() ? <span className="text-emerald-700 font-semibold">Stripe aktiv</span> : <span className="text-amber-700 font-semibold">noch kein Stripe-Konto – Buchungen kommen als „Angefragt“</span>}
          {" · "}Mailversand: {mailEnabled() ? <span className="text-emerald-700 font-semibold">aktiv</span> : <span className="text-amber-700 font-semibold">noch kein SMTP – Mails werden nur protokolliert</span>}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        {[BOOKING_STATUS.REQUESTED, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.DONE].map((s) => (
          <div key={s} className="card"><div className="text-2xl font-bold">{count(s)}</div><div className="text-xs text-[color:var(--color-ink-soft)]">{BOOKING_STATUS_LABEL[s].de}</div></div>
        ))}
      </div>
      <div className="text-sm">Umsatz bezahlt: <strong>{formatPrice(revenue)}</strong></div>
      <div className="card overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Monatsreport</h2>
          <a href="/api/admin/report" className="btn-outline py-1">CSV (12 Monate)</a>
        </div>
        <table className="mt-3 w-full text-sm">
          <thead><tr className="text-left text-xs text-[color:var(--color-ink-soft)]"><th className="py-1">Monat</th><th>Registrierungen</th><th>Buchungen</th><th>bezahlt</th><th>Umsatz Service</th><th>Mappen</th><th>Bewerbungen</th><th>Antworten</th><th>Buchungsquote</th></tr></thead>
          <tbody>{report.map((r) => (
            <tr key={r.month} className="border-t"><td className="py-1 font-semibold">{r.month}</td><td>{r.registrations}</td><td>{r.bookings}</td><td>{r.bookingsPaid}</td><td>{formatPrice(r.serviceRevenueCents)}</td><td>{r.mappenSubmitted}</td><td>{r.applicationsSent}</td><td>{r.replies}</td><td>{r.conversionPct === null ? "–" : `${r.conversionPct.toLocaleString("de-DE")} %`}</td></tr>
          ))}</tbody>
        </table>
        <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">Buchungsquote = Buchungen des Bewerbungs-Service je neue Registrierung im Monat. Demo-Zahlungen zählen nicht als Umsatz.</p>
      </div>
      {bookings.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">Noch keine Buchungen.</div>}
      <div className="space-y-4">
        {bookings.map((b) => (
          <BookingRow key={b.id} id={b.id} status={b.status} applicationsSent={b.applicationsSent} applicationsGoal={b.applicationsGoal} adminNote={b.adminNote}
            candidateId={b.candidateId} candidateName={[b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "(ohne Namen)"}
            email={b.candidate.user.email} phone={b.contactPhone} jobs={b.targetJobs} regions={b.targetRegions} notes={b.notes}
            price={formatPrice(b.amountCents)} createdAt={d(b.createdAt)} paidAt={b.paidAt ? d(b.paidAt) : null} />
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold">Letzte Mails</h2>
        <table className="mt-3 w-full text-xs">
          <thead><tr className="text-left text-[color:var(--color-ink-soft)]"><th>Zeit</th><th>An</th><th>Betreff</th><th>Status</th></tr></thead>
          <tbody>{mails.map((m) => <tr key={m.id} className="border-t"><td className="py-1">{m.createdAt.toLocaleString("de-DE")}</td><td>{m.to}</td><td>{m.subject}</td><td>{m.status === "SENT" ? "verschickt" : m.status === "SKIPPED" ? "nur protokolliert" : `Fehler: ${m.error ?? ""}`}</td></tr>)}</tbody>
        </table>
        {mails.length === 0 && <p className="text-xs text-[color:var(--color-ink-soft)] mt-2">Noch keine Mails.</p>}
      </div>
    </div>
  );
}
