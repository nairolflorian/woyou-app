import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { sendApplication } from "@/lib/leads";
import { audit } from "@/lib/audit";

export async function POST(req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { leadId } = await ctx.params;
  try {
    const sent = await sendApplication(leadId);
    await audit(req, "BOOKING_UPDATE", {}, { leadId, action: "application_sent" });
    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
