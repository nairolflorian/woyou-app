import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { widerrufErstatten, ErstattungFehler, findeBuchung } from "@/lib/recht/server";

// Admin: Erstattung über Stripe (POST) oder Status, Notiz, Zuordnung der Buchung ändern (PATCH)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const p = z.object({ cents: z.number().int().min(0) }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte einen gültigen Betrag eintragen." }, { status: 400 });
  try {
    const r = await widerrufErstatten(id, p.data.cents);
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    if (e instanceof ErstattungFehler) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("[erstattung]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: `Stripe: ${e instanceof Error ? e.message : "Fehler"}` }, { status: 502 });
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { id } = await ctx.params;
  const p = z.object({ status: z.enum(["OFFEN", "ERLEDIGT"]).optional(), adminNote: z.string().max(2000).optional(), bookingRef: z.string().max(200).optional() }).safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Ungültige Angaben." }, { status: 400 });
  const data: { status?: string; adminNote?: string; bookingId?: string | null } = {};
  if (p.data.status) data.status = p.data.status;
  if (p.data.adminNote !== undefined) data.adminNote = p.data.adminNote;
  if (p.data.bookingRef !== undefined) {
    const b = await findeBuchung(p.data.bookingRef);
    if (!b) return NextResponse.json({ error: "Keine Buchung zu dieser Buchungsnummer oder E-Mail gefunden." }, { status: 404 });
    data.bookingId = b.id;
  }
  await prisma.widerruf.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
