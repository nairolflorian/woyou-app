import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { getStripe, stripeKeyMode, stripeBlocked, stripeExpectedMode } from "@/lib/stripe";
import { formatPrice } from "@/lib/services";
import { buchungsNummer, datum, datumUhrzeit, erstattungBis, erstattungsVorschlag } from "@/lib/recht/vertrag";
import { WiderrufAdminRow, KuendigungAdminRow } from "@/components/WiderrufAdmin";

export const dynamic = "force-dynamic";

// Widerrufe und Kündigungen (Verbraucherrecht, 26.10.2026). Erstattung innerhalb von 14 Tagen nach Eingang über Stripe,
// abzüglich eines anteiligen Betrags für schon erbrachte Leistungen. Der Betrag ist ein Vorschlag, das Team prüft ihn.
export default async function AdminWiderrufePage() {
  if (!isAdmin((await getSession()).role)) redirect("/admin/buchungen");
  const [widerrufe, kuendigungen] = await Promise.all([
    prisma.widerruf.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.kuendigung.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const ids = [...new Set([...widerrufe, ...kuendigungen].map((x) => x.bookingId).filter((x): x is string => !!x))];
  const bookings = await prisma.serviceBooking.findMany({ where: { id: { in: ids } }, include: { candidate: { include: { user: { select: { email: true } } } }, profile: { select: { status: true } } } });
  const saved = await prisma.savedJob.groupBy({ by: ["candidateId"], where: { candidateId: { in: bookings.map((b) => b.candidateId) } }, _count: { _all: true } });
  const byId = new Map(bookings.map((b) => [b.id, b]));
  const savedBy = new Map(saved.map((s) => [s.candidateId, s._count._all]));
  const now = new Date();
  const stripe = getStripe();
  const stripeInfo = stripe ? `Stripe aktiv (${stripeKeyMode() === "test" ? "Testmodus, kein echtes Geld" : "live"})` : stripeBlocked() ? `${stripeExpectedMode() === "test" ? "Staging nimmt nur Test-Schlüssel" : "Produktion nimmt nur Live-Schlüssel"}: Erstattung über Stripe nicht möglich` : "Kein Stripe eingerichtet: Erstattung bitte im Stripe-Dashboard bzw. per Überweisung, hier dann „erledigt“ setzen";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Widerrufe und Kündigungen</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)]">Erstattung spätestens 14 Tage nach Eingang des Widerrufs, über dasselbe Zahlungsmittel. Zahlung: <strong>{stripeInfo}</strong>.</p>
      </div>

      <h2 className="text-lg font-semibold">Widerrufe ({widerrufe.length})</h2>
      {widerrufe.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">Noch keine Widerrufe.</div>}
      {widerrufe.map((w) => {
        const b = w.bookingId ? byId.get(w.bookingId) : undefined;
        const v = b ? erstattungsVorschlag({ amountCents: b.amountCents, bezahlt: !!b.paidAt, mappeStatus: b.profile?.status ?? null, werkzeugGenutzt: (savedBy.get(b.candidateId) ?? 0) > 0, toolStart: b.paidAt, toolMonths: b.toolMonths, widerrufAm: w.createdAt }) : null;
        const frist = erstattungBis(w.createdAt);
        return (
          <WiderrufAdminRow key={w.id} id={w.id} status={w.status} adminNote={w.adminNote}
            eingang={datumUhrzeit(w.createdAt)} name={w.name} email={w.email} bookingRef={w.bookingRef} message={w.message}
            frist={datum(frist)} fristUeberschritten={!w.refundedAt && w.status === "OFFEN" && frist < now} tageBisFrist={Math.ceil((frist.getTime() - now.getTime()) / 864e5)}
            buchung={b ? { id: b.id, nummer: buchungsNummer(b.id), kunde: [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "(ohne Namen)", email: b.candidate.user.email, preis: formatPrice(b.amountCents), amountCents: b.amountCents, gebucht: datum(b.createdAt), bezahlt: b.paidAt ? datum(b.paidAt) : null, status: b.status, mappe: b.profile?.status ?? "keine", stripe: !!b.stripeSessionId } : null}
            vorschlag={v} stripeBereit={!!stripe}
            erstattet={w.refundedAt ? { cents: w.refundCents ?? 0, betrag: formatPrice(w.refundCents ?? 0), am: datumUhrzeit(w.refundedAt), refundId: w.stripeRefundId } : null}
          />
        );
      })}

      <h2 className="text-lg font-semibold">Kündigungen ({kuendigungen.length})</h2>
      {kuendigungen.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">Noch keine Kündigungen.</div>}
      {kuendigungen.map((k) => {
        const b = k.bookingId ? byId.get(k.bookingId) : undefined;
        return (
          <KuendigungAdminRow key={k.id} id={k.id} status={k.status} adminNote={k.adminNote}
            eingang={datumUhrzeit(k.createdAt)} art={k.art} grund={k.grund} name={k.name} email={k.email} bookingRef={k.bookingRef}
            wunsch={k.wirksam === "datum" && k.wirksamZu ? datum(k.wirksamZu) : "nächstmöglich"} vertragsende={k.vertragsende ? datum(k.vertragsende) : null} bestaetigungEmail={k.bestaetigungEmail}
            buchung={b ? `${buchungsNummer(b.id)} · ${[b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ")} · ${b.status}` : null} buchungId={b?.id ?? null}
          />
        );
      })}
      <p className="text-xs text-[color:var(--color-ink-soft)]">Zur Buchung: <Link href="/admin/buchungen" className="underline">Buchungen</Link>. Widerrufe per Brief oder E-Mail bitte über das öffentliche Formular „Vertrag widerrufen“ erfassen, damit Eingangsbestätigung und Frist stimmen.</p>
    </div>
  );
}
