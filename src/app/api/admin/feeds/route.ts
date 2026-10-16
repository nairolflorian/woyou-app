import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { detectFeed, loadFeed, clearFeedCache } from "@/lib/jobs-feeds";

const Body = z.object({ name: z.string().trim().min(2).max(120), url: z.string().trim().min(8).max(300) });

// Karriereseite hinzufügen: Link erkennen, Feed einmal testen, speichern
export async function POST(req: Request) {
  const deny = await requireAdmin(); if (deny) return deny;
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte Name und Link angeben." }, { status: 400 });
  const f = detectFeed(p.data.url);
  if (!f) return NextResponse.json({ error: "Link nicht erkannt. Unterstützt: Personio (…jobs.personio.de), Greenhouse (boards.greenhouse.io/…), Lever (jobs.lever.co/…)." }, { status: 400 });
  let count = 0;
  try { count = (await loadFeed(f.kind, f.slug, p.data.name)).length; }
  catch (e) { return NextResponse.json({ error: `Feed nicht abrufbar: ${e instanceof Error ? e.message : e}` }, { status: 400 }); }
  const feed = await prisma.careerFeed.upsert({ where: { kind_slug: { kind: f.kind, slug: f.slug } }, update: { name: p.data.name, active: true, lastCount: count, lastError: null, checkedAt: new Date() }, create: { name: p.data.name, ...f, lastCount: count, checkedAt: new Date() } });
  clearFeedCache();
  return NextResponse.json({ ok: true, feed });
}
