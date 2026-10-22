import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { cancelToolSubscription } from "@/lib/werkzeug";
import { purchaseMail } from "@/lib/werkzeug-text";

// Monatsabo kündigen (Kündigungsbutton, § 312k BGB): Zugang bleibt bis zum Ende des bezahlten Zeitraums
export async function POST() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const c = await prisma.candidate.findUnique({ where: { userId: session.userId }, include: { user: true } });
  if (!c) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  try {
    const until = await cancelToolSubscription(c.id);
    return NextResponse.json({ ok: true, until: until.toLocaleDateString(purchaseMail(c.user.locale).dateLocale) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
