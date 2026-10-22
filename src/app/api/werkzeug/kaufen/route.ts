import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { startToolPurchase } from "@/lib/werkzeug";
import { TOOL_KINDS, type ToolKind } from "@/lib/angebot";

const Body = z.object({ kind: z.enum(TOOL_KINDS as [ToolKind, ...ToolKind[]]), acceptTerms: z.literal(true), acceptWaiver: z.literal(true) });

// Werkzeug verlängern (ein Monat) oder Monatsabo starten (Stripe-Checkout; ohne Stripe: Bestellung wird erfasst)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!rateLimit("tool-purchase", clientIp(req), 10, 3600e3).ok) return NextResponse.json({ error: "Zu viele Versuche." }, { status: 429 });
  const p = Body.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: "Bitte AGB und Widerrufshinweis bestätigen." }, { status: 400 });
  const c = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!c) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  try {
    const r = await startToolPurchase(c.id, p.data.kind, new URL(req.url).origin);
    return NextResponse.json({ ok: true, url: r.url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
