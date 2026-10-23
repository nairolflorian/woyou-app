import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { markPurchasePaid } from "@/lib/credits";
import { markToolPurchasePaid } from "@/lib/werkzeug";
import { isLegacyToolKind } from "@/lib/angebot";
import { audit } from "@/lib/audit";

// ALT: offene Altkäufe von Hand als bezahlt markieren (z. B. Überweisung). Neue Käufe nach dem Startpaket
// gibt es nicht mehr (keine Verlängerung, kein Abo seit 23.10.2026). Bewerbungsguthaben (vor Weg 1) wie bisher.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const p = await prisma.creditPurchase.findUnique({ where: { id }, select: { kind: true } });
  if (!p) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  const ok = isLegacyToolKind(p.kind) ? await markToolPurchasePaid(id) : await markPurchasePaid(id);
  await audit(req, "BOOKING_UPDATE", {}, { purchaseId: id, action: "purchase_paid_manual" });
  return NextResponse.json({ ok });
}
