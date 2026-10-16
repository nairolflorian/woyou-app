import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { searchJobs } from "@/lib/jobs-ba";

// Stellensuche (Bundesagentur) für eine Buchung; bereits ausgewählte Stellen werden markiert
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const deny = await requireAdmin(); if (deny) return deny;
  const { id } = await ctx.params;
  const u = new URL(req.url);
  const was = (u.searchParams.get("was") || "").trim().slice(0, 120);
  if (!was) return NextResponse.json({ error: "Bitte einen Beruf angeben." }, { status: 400 });
  const wo = (u.searchParams.get("wo") || "").trim().slice(0, 80) || undefined;
  const umkreis = Math.min(200, Math.max(0, Number(u.searchParams.get("umkreis") || 50)));
  const page = Math.max(1, Number(u.searchParams.get("page") || 1));
  try {
    const r = await searchJobs({ was, wo, umkreis, page, size: 50, angebotsart: u.searchParams.get("art") === "ausbildung" ? 4 : 1 });
    const taken = new Set((await prisma.jobLead.findMany({ where: { bookingId: id }, select: { sourceRef: true } })).map((x) => x.sourceRef));
    return NextResponse.json({ total: r.total, jobs: r.jobs.map((j) => ({ ...j, taken: taken.has(j.ref) })) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 502 });
  }
}
