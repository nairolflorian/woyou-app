import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { markPurchasePaid } from "@/lib/credits";
import { markToolPurchasePaid } from "@/lib/werkzeug";
import { TOOL_KINDS, type ToolKind } from "@/lib/angebot";
import { audit } from "@/lib/audit";

// Verlängerung/Abo von Hand als bezahlt markieren (z. B. Überweisung, solange Stripe fehlt).
// Alte Käufe (Bewerbungsguthaben, vor Weg 1) werden wie bisher verbucht.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const p = await prisma.creditPurchase.findUnique({ where: { id }, select: { kind: true } });
  if (!p) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const ok = TOOL_KINDS.includes(p.kind as ToolKind) ? await markToolPurchasePaid(id) : await markPurchasePaid(id);
  await audit(req, "BOOKING_UPDATE", {}, { purchaseId: id, action: "purchase_paid_manual" });
  return NextResponse.json({ ok });
}
