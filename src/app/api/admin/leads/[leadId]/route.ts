import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/admin-guard";
import { recount } from "@/lib/leads";
import { consumeCredit, refundCredit } from "@/lib/credits";
import { audit } from "@/lib/audit";

const Body = z.object({
  email: z.union([z.string().email().max(200), z.literal("")]).optional(),
  contactName: z.string().max(120).optional(),
  coverLetter: z.string().max(6000).optional(),
  status: z.enum(["SELECTED", "READY", "APPLIED_MANUALLY", "DISCARDED", "HIDDEN", "SUGGESTED"]).optional(),
  response: z.string().max(4000).optional(),
  lang: z.enum(["de", "en"]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { leadId } = await ctx.params;
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Ungültige Eingabe (E-Mail prüfen)." }, { status: 400 });
  const before = await prisma.jobLead.findUnique({ where: { id: leadId } });
  if (!before) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  if (before.status === "SENT" && (p.data.status || p.data.lang)) return NextResponse.json({ error: "Bereits verschickt." }, { status: 409 });
  if (before.status === "SENT" && p.data.status) return NextResponse.json({ error: "Bereits verschickt." }, { status: 409 });
  if (p.data.status === "APPLIED_MANUALLY" && before.status !== "APPLIED_MANUALLY") {
    const b = await prisma.serviceBooking.findUniqueOrThrow({ where: { id: before.bookingId } });
    try { await consumeCredit(b.candidateId, leadId, b.id, `${before.title} · ${before.company} (Firmenseite)`); }
    catch (e) { return NextResponse.json({ error: e instanceof Error ? e.message : "Kein Guthaben" }, { status: 402 }); }
  }
  if (before.status === "APPLIED_MANUALLY" && p.data.status && p.data.status !== "APPLIED_MANUALLY") await refundCredit(leadId);
  const data: Record<string, unknown> = { ...p.data };
  if (p.data.email === "") data.email = null;
  if (p.data.status === "APPLIED_MANUALLY" && !before.sentAt) data.sentAt = new Date();
  if (p.data.response && !before.respondedAt) data.respondedAt = new Date();
  const lead = await prisma.jobLead.update({ where: { id: leadId }, data });
  const sent = await recount(before.bookingId);
  if (p.data.status) await audit(req, "BOOKING_UPDATE", {}, { bookingId: before.bookingId, leadId, status: p.data.status });
  return NextResponse.json({ ok: true, lead, sent });
}
