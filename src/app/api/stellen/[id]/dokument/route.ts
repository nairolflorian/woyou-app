import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { letterFile, sendFiles } from "@/lib/tracker";

// Unterlagen einer gemerkten Stelle herunterladen:
//   ?format=pdf      Anschreiben als PDF        ?format=docx   Anschreiben als Word
//   ?format=cv       Lebenslauf als PDF         ?format=bundle Anschreiben und Lebenslauf in einer PDF
//   &inline=1        im Browser ansehen statt speichern
// Bleibt auch nach Ablauf des Werkzeugs möglich (keine Verlängerung nötig): die Unterlagen gehören der Person.
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { id } = await ctx.params;
  const q = new URL(req.url).searchParams;
  const format = q.get("format");
  const disp = q.get("inline") === "1" ? "inline" : "attachment";
  const send = (body: Buffer, file: string, type: string) =>
    new NextResponse(new Uint8Array(body), { headers: { "Content-Type": type, "Content-Disposition": `${disp}; filename="${file}"`, "Cache-Control": "private, no-store" } });
  if (format === "cv" || format === "bundle") {
    const f = await sendFiles(s.candidate.id, id);
    if (!f) return NextResponse.json({ error: "Kein Anschreiben vorhanden" }, { status: 404 });
    if (format === "cv") return send(f.cv.body, f.cv.file, "application/pdf");
    if (!f.bundle) return NextResponse.json({ error: "Mit eigenem Lebenslauf gibt es zwei Dateien." }, { status: 404 });
    return send(f.bundle.body, f.bundle.file, "application/pdf");
  }
  const f = await letterFile(s.candidate.id, id, format === "docx" ? "docx" : "pdf");
  if (!f) return NextResponse.json({ error: "Kein Anschreiben vorhanden" }, { status: 404 });
  return send(f.body, f.file, f.type);
}
