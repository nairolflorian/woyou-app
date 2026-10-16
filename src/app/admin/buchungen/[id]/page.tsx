import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MappeEditor } from "@/components/MappeEditor";
import { JobSearch } from "@/components/JobSearch";
import { LeadCard } from "@/components/LeadCard";
import { ManualLead } from "@/components/ManualLead";
import { parseProfile, missingFields, prefillFromCandidate } from "@/lib/application";
import { BOOKING_STATUS_LABEL, type BookingStatus, formatPrice } from "@/lib/services";
import { aliasAddress, aliasDomain } from "@/lib/alias";
import { mailEnabled } from "@/lib/mail";
import { aiEnabled } from "@/lib/letters";
import { ACTIVE_LEAD } from "@/lib/leads";

export const dynamic = "force-dynamic";
const PROFILE_STATUS: Record<string, string> = { DRAFT: "Kunde füllt aus", SUBMITTED: "Eingereicht – bitte prüfen", APPROVED: "Freigegeben" };

export default async function AdminBookingDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const b = await prisma.serviceBooking.findUnique({ where: { id }, include: { profile: true, candidate: { include: { user: true } }, leads: { orderBy: { createdAt: "asc" } } } });
  if (!b) notFound();
  const data = b.profile ? parseProfile(b.profile.data) : prefillFromCandidate(b.candidate, b);
  const name = [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "(ohne Namen)";
  const active = b.leads.filter((l) => ACTIVE_LEAD.includes(l.status));
  const label = BOOKING_STATUS_LABEL[b.status as BookingStatus];
  const canSend = mailEnabled() && b.profile?.status === "APPROVED" && !!b.consentSendAt;
  const alias = aliasAddress(b.aliasLocal);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/buchungen" className="text-sm text-[color:var(--color-brand)]">← Buchungen</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold">{name}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label?.color ?? ""}`}>{label?.de ?? b.status}</span>
        </div>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          {b.candidate.user.email} · {b.contactPhone} · gebucht {b.createdAt.toLocaleDateString("de-DE")} · {formatPrice(b.amountCents)} · Berufe: {b.targetJobs || "–"} · Region: {b.targetRegions || "–"}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Mappe</div><div className="font-semibold">{b.profile ? PROFILE_STATUS[b.profile.status] : "noch nicht begonnen"}</div></div>
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Bewerbungen</div><div className="font-semibold">{b.applicationsSent} verschickt · {active.length} ausgewählt / {b.applicationsGoal}</div></div>
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Bewerbungsadresse</div><div className="font-semibold break-all">{alias ?? (aliasDomain() ? "entsteht bei Einreichung" : "noch nicht eingerichtet")}</div></div>
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Vollmacht Versand</div><div className="font-semibold">{b.consentSendAt ? `erteilt ${b.consentSendAt.toLocaleDateString("de-DE")}` : "fehlt"}</div></div>
      </div>
      <p className="text-xs text-[color:var(--color-ink-soft)]">
        Mailversand: {mailEnabled() ? "aktiv" : "noch nicht eingerichtet (Bewerbungen vorerst über Firmenseite oder manuell)"} · KI-Formulierung: {aiEnabled() ? "aktiv" : "aus – Anschreiben aus der Vorlage"} · Woyou-Adressen: {aliasDomain() ? `aktiv (@${aliasDomain()})` : "noch nicht eingerichtet (Antworten gehen direkt an den Kunden)"}
      </p>

      <details className="card" open={b.profile?.status === "SUBMITTED"}>
        <summary className="cursor-pointer font-semibold">Bewerbungsmappe prüfen und bearbeiten</summary>
        <div className="mt-4">
          {missingFields(data).length > 0 && <p className="mb-3 text-sm text-amber-800">Fehlt noch: {missingFields(data).join(", ")}</p>}
          <MappeEditor bookingId={b.id} initial={data} status={b.profile?.status ?? "DRAFT"} hasPhoto={!!b.profile?.photoFile} ownCv={{ has: !!b.profile?.ownCvFile, use: !!b.profile?.useOwnCv }} missing={missingFields(data)} />
        </div>
      </details>

      <JobSearch bookingId={b.id} defaults={{ was: (data.targetJob || b.targetJobs || "").split(",")[0].trim(), wo: (b.targetRegions || "").split(",")[0].trim() }} selectedCount={active.length} goal={b.applicationsGoal} />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Ausgewählte Stellen ({active.length} / {b.applicationsGoal})</h2>
          <ManualLead bookingId={b.id} />
        </div>
        {b.leads.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">Noch keine Stellen ausgewählt. Oben suchen und „Auswählen“ klicken – Ausschreibung, E-Mail (falls angegeben) und ein erstes Anschreiben werden automatisch übernommen.</div>}
        {b.leads.map((l, i) => (
          <LeadCard key={l.id} n={i + 1} canSend={canSend} lead={{ id: l.id, title: l.title, company: l.company, city: l.city, url: l.url, applyUrl: l.applyUrl, email: l.email, contactName: l.contactName, coverLetter: l.coverLetter, status: l.status, sentAt: l.sentAt?.toISOString() ?? null, response: l.response, source: l.source, hasDescription: !!l.description }} />
        ))}
      </section>
    </div>
  );
}
