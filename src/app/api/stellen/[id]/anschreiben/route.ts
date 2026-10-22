import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { rateLimit } from "@/lib/rate-limit";
import { generateLetter, trackerItems, toItem } from "@/lib/tracker";

export const maxDuration = 60;

// Anschreiben für eine gemerkte Stelle erstellen (Body: { lang: "de" | "en" })
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!s.access.active) return NextResponse.json({ error: "Das Bewerbungswerkzeug ist nicht freigeschaltet." }, { status: 403 });
  if (!rateLimit("anschreiben", s.candidate.id, 40, 3600e3).ok) return NextResponse.json({ error: "Zu viele Anschreiben in kurzer Zeit. Bitte warte einen Moment." }, { status: 429 });
  const { id } = await ctx.params;
  const b = await req.json().catch(() => ({}));
  try {
    const j = await generateLetter(s.candidate.id, id, b.lang === "en" ? "en" : "de");
    const { ctx: c } = await trackerItems(s.candidate.id);
    return NextResponse.json({ ok: true, item: toItem(j, c) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
