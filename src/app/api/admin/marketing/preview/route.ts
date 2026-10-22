import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { STEPS, render, sampleVars } from "@/lib/marketing";

// Vorschau einer Mail der Marketingstrecke: ?step=REG_1&lang=de
export async function GET(req: Request) {
  const deny = await requireAdmin(); if (deny) return deny;
  const u = new URL(req.url);
  const step = STEPS.find((s) => s.key === u.searchParams.get("step"));
  const lang = (["de", "en", "fr", "ar", "hi"].includes(u.searchParams.get("lang") || "") ? u.searchParams.get("lang") : "de") as "de" | "en" | "fr" | "ar" | "hi";
  if (!step) return NextResponse.json({ error: "unbekannt" }, { status: 404 });
  const m = render(step, lang, sampleVars(lang), "vorschau");
  return new NextResponse(m.html.replace("<body", `<body dir="ltr"`).replace("</body>", `<p style="font:12px Arial;color:#888;text-align:center">Betreff: ${m.subject.replace(/</g, "&lt;")}</p></body>`), { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
