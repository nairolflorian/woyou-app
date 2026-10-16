import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { applyApproved } from "@/lib/leads";
import { audit } from "@/lib/audit";

export const maxDuration = 300;

// „Jetzt bewerben“: freigegebene Stellen automatisch per Mail bewerben
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { id } = await ctx.params;
  const r = await applyApproved(id);
  await audit(req, "BOOKING_UPDATE", {}, { bookingId: id, action: "apply_approved", sent: r.sent });
  return NextResponse.json({ ok: true, ...r });
}
