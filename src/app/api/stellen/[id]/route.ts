import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toolSession } from "@/lib/werkzeug";
import { ownJob, trackerItems, toItem } from "@/lib/tracker";
import { isTrackerStatus, nextTrackerState, isEmail } from "@/lib/stellensuche-core";

type Ctx = { params: Promise<{ id: string }> };
const day = (v: unknown) => { if (typeof v !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return undefined; const d = new Date(`${v}T12:00:00`); return isNaN(+d) ? undefined : d; };

// Eigenen Eintrag ändern: Stand, Datum „beworben am“, Notizen, Anschreiben-Text,
// E-Mail-Entwurf (Empfänger, Betreff, Text; resetDraft = wieder Vorschlag) und Erinnerung zum Nachfassen
export async function PATCH(req: Request, ctx: Ctx) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!s.access.active) return NextResponse.json({ error: "Das Bewerbungswerkzeug ist abgelaufen." }, { status: 403 });
  const { id } = await ctx.params;
  const j = await ownJob(s.candidate.id, id);
  if (!j) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const b = await req.json().catch(() => ({}));
  const data: Record<string, unknown> = {};
  if (b.status !== undefined) {
    if (!isTrackerStatus(b.status)) return NextResponse.json({ error: "Unbekannter Stand" }, { status: 400 });
    Object.assign(data, nextTrackerState(j, b.status));
  }
  const applied = day(b.appliedAt);
  if (applied) data.appliedAt = applied;
  if (typeof b.notes === "string") data.notes = b.notes.slice(0, 4000);
  if (typeof b.coverLetter === "string") data.coverLetter = b.coverLetter.slice(0, 6000);
  if (b.letterLang === "de" || b.letterLang === "en") data.letterLang = b.letterLang;
  if (typeof b.mailTo === "string") {
    const to = b.mailTo.trim().slice(0, 200);
    if (to && !isEmail(to)) return NextResponse.json({ error: "Bitte prüf die E-Mail-Adresse des Empfängers." }, { status: 400 });
    data.mailTo = to;
  }
  if (typeof b.mailSubject === "string") data.mailSubject = b.mailSubject.replace(/[\r\n]+/g, " ").slice(0, 300);
  if (typeof b.mailBody === "string") data.mailBody = b.mailBody.slice(0, 6000);
  if (b.resetDraft === true) { data.mailSubject = null; data.mailBody = null; }
  if (b.followUpAt === null) data.followUpAt = null;
  else if (b.followUpAt !== undefined) { const f = day(b.followUpAt); if (f) data.followUpAt = f; }
  const updated = await prisma.savedJob.update({ where: { id }, data });
  const { ctx: c } = await trackerItems(s.candidate.id);
  return NextResponse.json({ ok: true, item: toItem(updated, c) });
}

// Aus der eigenen Liste entfernen
export async function DELETE(_req: Request, ctx: Ctx) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { id } = await ctx.params;
  const j = await ownJob(s.candidate.id, id);
  if (!j) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  await prisma.savedJob.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
