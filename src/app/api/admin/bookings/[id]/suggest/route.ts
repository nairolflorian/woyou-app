import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { suggestJobs } from "@/lib/suggest";

export const maxDuration = 180;

// Neue Stellenvorschläge für eine Buchung suchen und bewerten
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  try {
    return NextResponse.json({ ok: true, ...(await suggestJobs(id)) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
