import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MappeEditor } from "@/components/MappeEditor";
import { JobSearch } from "@/components/JobSearch";
import { LeadCard } from "@/components/LeadCard";
import { ManualLead } from "@/components/ManualLead";
import { SuggestionList, type Suggestion } from "@/components/SuggestionList";
import { parseProfile, missingFields, prefillFromCandidate } from "@/lib/application";
import { BOOKING_STATUS_LABEL, type BookingStatus, formatPrice } from "@/lib/services";
import { aliasAddress, aliasDomain } from "@/lib/alias";
import { mailEnabled } from "@/lib/mail";
import { aiEnabled } from "@/lib/letters";
import { ACTIVE_LEAD } from "@/lib/leads";
import { ApplyPanel } from "@/components/ApplyPanel";
import { creditState } from "@/lib/credits";
import { CREDIT_PRODUCTS, type CreditKind } from "@/lib/services";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";
const PROFILE_STATUS: Record<string, string> = { DRAFT: "Kunde füllt aus", SUBMITTED: "Eingereicht – bitte prüfen", APPROVED: "Freigegeben" };

export default async function AdminBookingDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const b = await prisma.serviceBooking.findUnique({ where: { id }, include: { profile: true, candidate: { include: { user: true } }, leads: { orderBy: { createdAt: "asc" } } } });
  if (!b) notFound();
  const data = b.profile ? parseProfile(b.profile.data) : prefillFromCandidate(b.candidate, b);
  const name = [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "(ohne Namen)";
  const active = b.leads.filter((l) => ACTIVE_LEAD.includes(l.status));
  const listed = b.leads.filter((l) => l.status !== "SUGGESTED" && l.status !== "HIDDEN");
  const json = <T,>(s: string | null, d: T): T => { try { return s ? JSON.parse(s) : d; } catch { return d; } };
  const suggestions: Suggestion[] = b.leads.filter((l) => l.status === "SUGGESTED").sort((x, y) => (y.score ?? 0) - (x.score ?? 0)).map((l) => ({
    id: l.id, source: l.source, title: l.title, company: l.company, city: l.city, url: l.url, email: l.email, score: l.score, notes: json<string[]>(l.matchNotes, []), aiNote: l.aiNote, createdAt: l.createdAt.toISOString(), meta: json(l.meta, {}),
  }));
  const label = BOOKING_STATUS_LABEL[b.status as BookingStatus];
  const canSend = mailEnabled() && b.profile?.status === "APPROVED" && !!b.consentSendAt;
  const alias = aliasAddress(b.aliasLocal);
  const credits = await creditState(b.candidateId);
  const purchases = await prisma.creditPurchase.findMany({ where: { candidateId: b.candidateId, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, take: 10 });
  const ready = b.leads.filter((l) => l.status === "READY");
  const openSelected = b.leads.filter((l) => l.status === "SELECTED" || l.status === "READY").length;
  const free = credits.unlimited ? 25 : Math.max(0, credits.balance - openSelected);
  const admin = isAdmin((await getSession()).role);
  const sendBlock = !mailEnabled() ? "Mailversand ist noch nicht eingerichtet." : b.profile?.status !== "APPROVED" ? "Erst die Bewerbungsmappe freigeben." : !b.consentSendAt ? "Vollmacht für den Versand fehlt." : null;

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
        <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">Bewerbungen</div><div className="font-semibold">{b.applicationsSent} verschickt · {openSelected} in Vorbereitung</div></div>
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

      <details className="card">
        <summary className="cursor-pointer font-semibold">Englische Fassung (nur bei Bedarf)</summary>
        <p className="mt-2 text-sm text-[color:var(--color-ink-soft)]">Für englischsprachige Firmen oder Stellen. Beim ersten Öffnen ist die deutsche Mappe vorausgefüllt; bitte die Texte übersetzen und speichern. Welche Stellen auf Englisch gehen, legst du unten je Stelle fest.</p>
        <div className="mt-4">
          <MappeEditor bookingId={b.id} lang="en" initial={b.profile?.dataEn ? parseProfile(b.profile.dataEn) : data} status={b.profile?.status ?? "DRAFT"} hasPhoto={!!b.profile?.photoFile} ownCv={{ has: !!b.profile?.ownCvFile, use: !!b.profile?.useOwnCv }} missing={[]} />
        </div>
      </details>

      <ApplyPanel bookingId={b.id} balance={credits.balance} unlimited={credits.unlimited} until={credits.until?.toLocaleDateString("de-DE") ?? null} ready={ready.filter((l) => l.email).length} readyNoEmail={ready.filter((l) => !l.email).length} canSend={!sendBlock} reason={sendBlock} isAdmin={admin}
        purchases={purchases.map((x) => ({ id: x.id, kind: x.kind, label: CREDIT_PRODUCTS[x.kind as CreditKind]?.name ?? x.kind, status: { REQUESTED: "bestellt, Zahlung offen", PENDING_PAYMENT: "Zahlung offen", PAID: "bezahlt", ACTIVE: "aktiv", CANCELLING: "gekündigt", ENDED: "beendet" }[x.status] ?? x.status, createdAt: x.createdAt.toLocaleDateString("de-DE") }))} />

      <SuggestionList bookingId={b.id} items={suggestions} free={free} approved={b.profile?.status === "APPROVED"} ai={aiEnabled()} />

      <details className="card">
        <summary className="cursor-pointer font-semibold">Selbst suchen (Jobbörse der Bundesagentur)</summary>
        <div className="mt-4">
      <JobSearch bookingId={b.id} defaults={{ was: (data.targetJob || b.targetJobs || "").split(",")[0].trim(), wo: (b.targetRegions || "").split(",")[0].trim() }} selectedCount={active.length} goal={b.applicationsGoal} />
        </div>
      </details>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold">Ausgewählte Stellen ({active.length} / {b.applicationsGoal})</h2>
          <ManualLead bookingId={b.id} was={(data.targetJob || b.targetJobs || "").split(",")[0].trim()} wo={(b.targetRegions || "").split(",")[0].trim()} />
        </div>
        {listed.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">Noch keine Stellen ausgewählt. Oben einen Vorschlag übernehmen oder selbst suchen und „Auswählen“ klicken – Ausschreibung, E-Mail (falls angegeben) und ein erstes Anschreiben werden automatisch übernommen.</div>}
        {listed.map((l, i) => (
          <LeadCard key={l.id} n={i + 1} canSend={canSend} lead={{ id: l.id, title: l.title, company: l.company, city: l.city, url: l.url, applyUrl: l.applyUrl, email: l.email, contactName: l.contactName, coverLetter: l.coverLetter, status: l.status, sentAt: l.sentAt?.toISOString() ?? null, response: l.response, source: l.source, hasDescription: !!l.description, lang: l.lang }} />
        ))}
      </section>
    </div>
  );
}
