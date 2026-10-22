import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toolSession } from "@/lib/werkzeug";
import { rememberedTreffer, cleanManual } from "@/lib/stellensuche";
import { jobDetails, extractEmails } from "@/lib/jobs-ba";
import { germanRequired } from "@/lib/stellensuche-core";
import { trackerItems, toItem } from "@/lib/tracker";

// Meine Bewerbungen: Liste lesen (GET) und Stelle merken bzw. selbst eintragen (POST)
export async function GET() {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const { items } = await trackerItems(s.candidate.id);
  return NextResponse.json({ items, active: s.access.active });
}

// Body: { key } für einen Suchtreffer oder { manual: { title, company, city, url, email } } für eine selbst gefundene Stelle
export async function POST(req: Request) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!s.access.active) return NextResponse.json({ error: "Das Bewerbungswerkzeug ist nicht freigeschaltet." }, { status: 403 });
  const body = await req.json().catch(() => ({}));
  if ((await prisma.savedJob.count({ where: { candidateId: s.candidate.id } })) >= 500) return NextResponse.json({ error: "Deine Liste ist voll (500 Stellen). Entferne bitte alte Einträge." }, { status: 400 });

  let data: Parameters<typeof prisma.savedJob.create>[0]["data"];
  if (typeof body.key === "string") {
    const t = rememberedTreffer(body.key);
    if (!t) return NextResponse.json({ error: "Die Suche ist abgelaufen. Bitte such noch einmal." }, { status: 410 });
    let description = t.description, email = t.email;
    if (t.source === "BA" && !description) {
      const d = await jobDetails(t.ref).catch(() => null);
      description = d?.description.slice(0, 20000) ?? null; email = email ?? d?.emails[0] ?? null;
    }
    data = {
      candidateId: s.candidate.id, source: t.source, sourceRef: t.ref, title: t.title.slice(0, 200), company: t.company.slice(0, 200), city: t.city || null,
      url: t.url, applyUrl: t.applyUrl, email: email ?? (description ? extractEmails(description)[0] ?? null : null), description,
      meta: JSON.stringify({ germanRequired: t.germanRequired ?? (description ? germanRequired(description) : null), fulltime: t.fulltime, parttime: t.parttime, distanceKm: t.distanceKm, publishedAt: t.publishedAt }),
    };
  } else {
    const m = cleanManual(body.manual ?? {});
    if (!m) return NextResponse.json({ error: "Bitte Stellenbezeichnung und Firma eintragen." }, { status: 400 });
    data = { candidateId: s.candidate.id, source: "MANUAL", sourceRef: `manual-${Date.now()}`, title: m.title, company: m.company, city: m.city, url: m.url, email: m.email };
  }
  const existing = data.sourceRef ? await prisma.savedJob.findFirst({ where: { candidateId: s.candidate.id, source: data.source, sourceRef: data.sourceRef } }) : null;
  const job = existing ?? (await prisma.savedJob.create({ data }));
  const { ctx } = await trackerItems(s.candidate.id);
  return NextResponse.json({ ok: true, item: toItem(job, ctx) });
}
