import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mappeForRequest } from "@/lib/mappe";
import { missingFields } from "@/lib/application";
import { ensureAlias } from "@/lib/alias";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { ensureTask } from "@/lib/bookings";
import { suggestJobs } from "@/lib/suggest";
import { crmMelden } from "@/lib/crm-sync";

// Kund:in schickt die Mappe ab (SUBMITTED); Admin gibt sie frei (APPROVED)
export async function POST(req: Request) {
  const m = await mappeForRequest(new URL(req.url).searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const missing = missingFields(m.data);
  if (missing.length && !m.admin) return NextResponse.json({ error: `Bitte noch ergänzen: ${missing.join(", ")}.`, missing }, { status: 400 });
  await ensureAlias(m.booking.id, m.data.firstName, m.data.lastName);
  if (m.admin) {
    await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { status: "APPROVED", approvedAt: new Date() } });
    // Erste Stellenvorschläge im Hintergrund suchen (dauert je nach Anzahl 20–60 Sekunden)
    if (!(await prisma.jobLead.count({ where: { bookingId: m.booking.id, status: "SUGGESTED" } })))
      suggestJobs(m.booking.id).catch((e) => console.error("[suggest]", e instanceof Error ? e.message : e));
    return NextResponse.json({ ok: true, status: "APPROVED" });
  }
  const firstSubmit = !m.profile.submittedAt;
  await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { status: "SUBMITTED", submittedAt: new Date() } });
  if (firstSubmit) crmMelden("mappe_eingereicht", m.booking.candidateId, { paket: m.booking.packageKey });
  await ensureTask(m.booking.candidateId, "DOCUMENT_CHECK", `Bewerbungsmappe prüfen: ${`${m.data.firstName} ${m.data.lastName}`.trim()}`, `Mappe eingereicht. Prüfen, freigeben, Stellen auswählen: /admin/buchungen/${m.booking.id}`, 2);
  const team = teamAddress();
  if (team) {
    const n = `${m.data.firstName} ${m.data.lastName}`.trim();
    const base = process.env.NEXT_PUBLIC_BASE_URL || "";
    await sendMail({ to: team, subject: `Bewerbungsmappe eingereicht: ${n}`, template: "team_mappe_submitted", bookingId: m.booking.id, text: `${n} hat die Bewerbungsmappe eingereicht.`, html: layout("Bewerbungsmappe eingereicht", [`${n} hat die Bewerbungsmappe eingereicht und wartet auf die Bearbeitung.`], { label: "Im Admin öffnen", href: `${base}/admin/buchungen/${m.booking.id}` }) });
  }
  return NextResponse.json({ ok: true, status: "SUBMITTED" });
}
