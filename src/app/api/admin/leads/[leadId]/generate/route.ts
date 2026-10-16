import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/admin-guard";
import { regenerateLetter } from "@/lib/leads";
import { aiEnabled } from "@/lib/letters";

export async function POST(_req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { leadId } = await ctx.params;
  const lead = await regenerateLetter(leadId);
  return NextResponse.json({ ok: true, coverLetter: lead.coverLetter, ai: aiEnabled() });
}
