import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { selectSuggestion } from "@/lib/leads";

// Vorschlag übernehmen (zählt zu den gebuchten Bewerbungen, Anschreiben wird erstellt)
export async function POST(_req: Request, ctx: { params: Promise<{ leadId: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { leadId } = await ctx.params;
  try {
    const lead = await selectSuggestion(leadId);
    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
