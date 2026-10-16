import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { startPurchase } from "@/lib/credits";

const Body = z.object({ kind: z.enum(["PACK_25", "SUBSCRIPTION"]), acceptTerms: z.literal(true), acceptWaiver: z.literal(true) });

// Nachkauf oder Abo starten (Stripe-Checkout; ohne Stripe: Bestellung wird erfasst)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!rateLimit("purchase", clientIp(req), 10, 3600e3).ok) return NextResponse.json({ error: "Zu viele Versuche." }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte AGB und Widerrufshinweis bestätigen." }, { status: 400 });
  const c = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!c) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  const paid = await prisma.serviceBooking.findFirst({ where: { candidateId: c.id, paidAt: { not: null } } });
  if (!paid) return NextResponse.json({ error: "Bitte zuerst das Startpaket buchen." }, { status: 409 });
  try {
    const r = await startPurchase(c.id, p.data.kind, new URL(req.url).origin);
    return NextResponse.json({ ok: true, url: r.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
