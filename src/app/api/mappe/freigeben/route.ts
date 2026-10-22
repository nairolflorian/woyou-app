import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mappeForRequest } from "@/lib/mappe";
import { missingFields } from "@/lib/application";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { ensureTask } from "@/lib/bookings";
import { crmMelden } from "@/lib/crm-sync";
import { mappeMail } from "@/lib/werkzeug-text";

// Kund:in schickt die Mappe ab (SUBMITTED); das Team prüft und gibt sie frei (APPROVED).
// Weg 1: Mit der Freigabe sind die Unterlagen fertig. Es werden keine Alias-Adressen angelegt und
// keine Stellen für die Kund:in gesucht; Stellen sucht die Person selbst im Bewerbungswerkzeug.
export async function POST(req: Request) {
  const m = await mappeForRequest(new URL(req.url).searchParams.get("bookingId"));
  if (!m) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const missing = missingFields(m.data);
  if (missing.length && !m.admin) return NextResponse.json({ error: `Bitte noch ergänzen: ${missing.join(", ")}.`, missing }, { status: 400 });
  const base = process.env.NEXT_PUBLIC_BASE_URL || "";
  if (m.admin) {
    const first = !m.profile.approvedAt;
    await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { status: "APPROVED", approvedAt: new Date() } });
    if (first) {
      crmMelden("werkzeug_aktiv", m.booking.candidateId, { paket: m.booking.packageKey });
      const to = m.data.email || m.booking.candidate.user.email;
      if (to) {
        const t = mappeMail(m.booking.candidate.user.locale);
        const paras = [t.hello(m.data.firstName), ...t.paras];
        await sendMail({ to, subject: `WoYou: ${t.subject}`, template: "mappe_approved", bookingId: m.booking.id, text: [...paras, `${t.button}: ${base}/stellensuche`].join("\n\n"), html: layout(t.subject, paras, { label: t.button, href: `${base}/stellensuche` }, undefined, t.dir) });
      }
    }
    return NextResponse.json({ ok: true, status: "APPROVED" });
  }
  const firstSubmit = !m.profile.submittedAt;
  await prisma.applicationProfile.update({ where: { id: m.profile.id }, data: { status: "SUBMITTED", submittedAt: new Date() } });
  if (firstSubmit) crmMelden("mappe_eingereicht", m.booking.candidateId, { paket: m.booking.packageKey });
  await ensureTask(m.booking.candidateId, "DOCUMENT_CHECK", `Bewerbungsmappe prüfen: ${`${m.data.firstName} ${m.data.lastName}`.trim()}`, `Mappe eingereicht. Prüfen, korrigieren und freigeben: /admin/buchungen/${m.booking.id}`, 2);
  const team = teamAddress();
  if (team) {
    const n = `${m.data.firstName} ${m.data.lastName}`.trim();
    await sendMail({ to: team, subject: `Bewerbungsmappe eingereicht: ${n}`, template: "team_mappe_submitted", bookingId: m.booking.id, text: `${n} hat die Bewerbungsmappe eingereicht.`, html: layout("Bewerbungsmappe eingereicht", [`${n} hat die Bewerbungsmappe eingereicht und wartet auf die Prüfung.`], { label: "Im Admin öffnen", href: `${base}/admin/buchungen/${m.booking.id}` }) });
  }
  return NextResponse.json({ ok: true, status: "SUBMITTED" });
}
