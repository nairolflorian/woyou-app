import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MappeEditor } from "@/components/MappeEditor";
import { MyDocuments } from "@/components/MyDocuments";
import { PurchaseList } from "@/components/PurchaseList";
import { parseProfile, missingFields, prefillFromCandidate } from "@/lib/application";
import { BOOKING_STATUS_LABEL, CREDIT_PRODUCTS, type BookingStatus, type CreditKind } from "@/lib/services";
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { aiEnabled } from "@/lib/letters";
import { toolAccess } from "@/lib/werkzeug";
import { creditState } from "@/lib/credits";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const PROFILE_STATUS: Record<string, string> = { DRAFT: "Kund:in füllt aus", SUBMITTED: "Eingereicht, bitte prüfen", APPROVED: "Freigegeben" };
const PURCHASE_STATUS: Record<string, string> = { REQUESTED: "bestellt, Zahlung offen", PENDING_PAYMENT: "Zahlung offen", PAID: "bezahlt", ACTIVE: "aktiv", CANCELLING: "gekündigt", ENDED: "beendet" };
const purchaseLabel = (kind: string) =>
  kind === ANGEBOT.verlaengerung.kind ? "Werkzeug 1 Monat" : kind === ANGEBOT.abo.kind ? "Werkzeug Monatsabo" : CREDIT_PRODUCTS[kind as CreditKind]?.name ?? kind;

// Buchung im Admin (Weg 1): Unterlagen-Service. Das Team prüft und korrigiert die Mappe und gibt sie frei.
// Stellen sucht und wählt nur die Kundin bzw. der Kunde selbst; hier gibt es keine Stellenauswahl und keinen Versand.
export default async function AdminBookingDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const b = await prisma.serviceBooking.findUnique({ where: { id }, include: { profile: true, candidate: { include: { user: true } }, _count: { select: { leads: true } } } });
  if (!b) notFound();
  const data = b.profile ? parseProfile(b.profile.data) : prefillFromCandidate(b.candidate, b);
  const name = [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "(ohne Namen)";
  const label = BOOKING_STATUS_LABEL[b.status as BookingStatus];
  const access = await toolAccess(b.candidateId);
  const purchases = await prisma.creditPurchase.findMany({ where: { candidateId: b.candidateId, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, take: 10 });
  const admin = isAdmin((await getSession()).role);
  // Altdaten (vor Weg 1): Restguthaben aus dem früheren Paket nur anzeigen, nichts damit auslösen
  const legacy = b.packageKey === "bewerbung-25" ? await creditState(b.candidateId) : null;
  const tool = access.active ? `bis ${access.until!.toLocaleDateString("de-DE")}${access.subscription ? ` · Abo ${access.subscription.status === "CANCELLING" ? "gekündigt" : "aktiv"}` : ""}` : access.until ? `abgelaufen am ${access.until.toLocaleDateString("de-DE")}` : "nicht freigeschaltet";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/buchungen" className="text-sm text-[color:var(--color-brand)]">← Buchungen</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{name}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label?.color ?? ""}`}>{label?.de ?? b.status}</span>
        </div>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          {b.candidate.user.email} · {b.contactPhone} · gebucht {b.createdAt.toLocaleDateString("de-DE")} · {b.packageKey === "bewerbung-25" ? "früheres Paket (vor Weg 1)" : "Startpaket"} · {formatPrice(b.amountCents)} · Berufe: {b.targetJobs || "keine Angabe"} · Region: {b.targetRegions || "keine Angabe"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Mappe</div><div className="font-semibold">{b.profile ? PROFILE_STATUS[b.profile.status] : "noch nicht begonnen"}</div></div>
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Bewerbungswerkzeug</div><div className="font-semibold">{tool}</div></div>
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Anschreiben je Stelle</div><div className="font-semibold">{aiEnabled() ? "mit KI-Formulierung" : "aus der Vorlage"}</div></div>
      </div>
      <p className="text-xs text-[color:var(--color-ink-soft)]">
        Weg 1: Das Team prüft und korrigiert die Unterlagen. Stellen sucht die Kundin bzw. der Kunde selbst im Werkzeug und bewirbt sich selbst; wir wählen keine Stellen aus, verschicken nichts und sehen den Tracker nicht.
        {legacy && ` Früheres Paket: Restguthaben laut Altdaten ${legacy.balance}${legacy.unlimited ? `, altes Abo bis ${legacy.until!.toLocaleDateString("de-DE")}` : ""} (wird nicht mehr verbraucht).`}
        {b._count.leads > 0 && ` Aus der Zeit vor Weg 1 liegen ${b._count.leads} alte Stelleneinträge in der Datenbank (nicht mehr angezeigt).`}
      </p>

      <details className="card" open={b.profile?.status === "SUBMITTED"}>
        <summary className="cursor-pointer font-semibold">Bewerbungsmappe prüfen und korrigieren</summary>
        <div className="mt-4">
          {missingFields(data).length > 0 && <p className="mb-3 text-sm text-amber-800">Fehlt noch: {missingFields(data).join(", ")}</p>}
          <MappeEditor bookingId={b.id} initial={data} status={b.profile?.status ?? "DRAFT"} hasPhoto={!!b.profile?.photoFile} ownCv={{ has: !!b.profile?.ownCvFile, use: !!b.profile?.useOwnCv }} missing={missingFields(data)} />
        </div>
      </details>

      <details className="card">
        <summary className="cursor-pointer font-semibold">Englische Fassung (nur bei Bedarf)</summary>
        <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">Für englischsprachige Stellen. Beim ersten Öffnen ist die deutsche Mappe vorausgefüllt; bitte die Texte übersetzen und speichern. Die Kundin bzw. der Kunde kann dann je Stelle ein englisches Anschreiben erstellen.</p>
        <div className="mt-4">
          <MappeEditor bookingId={b.id} lang="en" initial={b.profile?.dataEn ? parseProfile(b.profile.dataEn) : data} status={b.profile?.status ?? "DRAFT"} hasPhoto={!!b.profile?.photoFile} ownCv={{ has: !!b.profile?.ownCvFile, use: !!b.profile?.useOwnCv }} missing={[]} />
        </div>
      </details>

      <MyDocuments locale="de" bookingId={b.id} hasEnglish={!!b.profile?.dataEn} />

      <section className="card space-y-2">
        <h2 className="font-semibold">Verlängerungen und Abo</h2>
        <PurchaseList isAdmin={admin} purchases={purchases.map((x) => ({ id: x.id, label: purchaseLabel(x.kind), status: PURCHASE_STATUS[x.status] ?? x.status, open: x.status === "REQUESTED" || x.status === "PENDING_PAYMENT", createdAt: x.createdAt.toLocaleDateString("de-DE") }))} />
      </section>
    </div>
  );
}
