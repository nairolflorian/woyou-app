import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { grantCredits } from "@/lib/credits";
import { audit } from "@/lib/audit";

const Body = z.object({ delta: z.number().int().min(-100).max(100).refine((n) => n !== 0), note: z.string().trim().min(3).max(200) });

// Gutschrift oder Korrektur von Hand (z. B. Kulanz, Überweisung) – nur Admin
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte Anzahl und Grund angeben." }, { status: 400 });
  const b = await prisma.serviceBooking.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  await grantCredits(b.candidateId, p.data.delta, p.data.delta > 0 ? "GRANT" : "REFUND", { bookingId: id, note: p.data.note });
  await audit(req, "BOOKING_UPDATE", { candidateId: b.candidateId }, { bookingId: id, credits: p.data.delta, note: p.data.note });
  return NextResponse.json({ ok: true });
}
