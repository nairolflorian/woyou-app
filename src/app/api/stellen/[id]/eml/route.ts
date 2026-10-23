import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { emlFile } from "@/lib/tracker";

// Fertige E-Mail mit Anschreiben und Lebenslauf als Anhang (.eml, Entwurf mit X-Unsent: 1).
// Die Person öffnet sie im eigenen Mailprogramm und schickt sie selbst ab. WoYou verschickt nichts.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { id } = await ctx.params;
  const f = await emlFile(s.candidate.id, id);
  if (!f) return NextResponse.json({ error: "Kein Anschreiben vorhanden" }, { status: 404 });
  return new NextResponse(new Uint8Array(f.body), { headers: { "Content-Type": "message/rfc822", "Content-Disposition": `attachment; filename="${f.file}"`, "Cache-Control": "private, no-store" } });
}
