import { NextResponse } from "next/server";
import { z } from "zod";
import { requireStaff } from "@/lib/admin-guard";
import { addLead } from "@/lib/leads";

const Body = z.object({
  ref: z.string().max(60).optional().nullable(), title: z.string().trim().min(2).max(200), company: z.string().trim().min(1).max(200),
  city: z.string().max(120).optional().nullable(), url: z.string().url().max(500).optional().nullable(), applyUrl: z.string().url().max(500).optional().nullable(),
  email: z.string().email().max(200).optional().nullable(), source: z.enum(["BA", "MANUAL", "KLEINANZEIGEN", "STEPSTONE", "INDEED", "LINKEDIN", "FIRMA"]).default("BA"),
  description: z.string().max(20000).optional().nullable(),
});

// Stelle auswählen (aus der Suche) oder manuell hinzufügen
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireStaff(); if (deny) return deny;
  const { id } = await ctx.params;
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte Titel und Firma angeben (Links und E-Mail im richtigen Format)." }, { status: 400 });
  try {
    const lead = await addLead(id, p.data);
    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fehler";
    return NextResponse.json({ error: /Unique constraint/i.test(msg) ? "Diese Stelle ist schon ausgewählt." : msg }, { status: 400 });
  }
}
