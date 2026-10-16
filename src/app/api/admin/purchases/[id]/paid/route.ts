import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { markPurchasePaid } from "@/lib/credits";
import { audit } from "@/lib/audit";

// Nachkauf/Abo von Hand als bezahlt markieren (z. B. Überweisung, solange Stripe fehlt)
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const ok = await markPurchasePaid(id);
  await audit(req, "BOOKING_UPDATE", {}, { purchaseId: id, action: "purchase_paid_manual" });
  return NextResponse.json({ ok });
}
