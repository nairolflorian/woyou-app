import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { letterFile } from "@/lib/tracker";

// Anschreiben einer gemerkten Stelle herunterladen: ?format=pdf | docx
// Bleibt auch nach Ablauf des Werkzeugs möglich: die Unterlagen gehören der Person.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { id } = await ctx.params;
  const format = new URL(req.url).searchParams.get("format") === "docx" ? "docx" : "pdf";
  const f = await letterFile(s.candidate.id, id, format);
  if (!f) return NextResponse.json({ error: "Kein Anschreiben vorhanden" }, { status: 404 });
  return new NextResponse(new Uint8Array(f.body), { headers: { "Content-Type": f.type, "Content-Disposition": `attachment; filename="${f.file}"`, "Cache-Control": "private, no-store" } });
}
