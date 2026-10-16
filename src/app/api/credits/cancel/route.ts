import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { cancelSubscription } from "@/lib/credits";

// Abo kündigen (Kündigungsbutton, § 312k BGB): endet zum Ende des bezahlten Monats
export async function POST() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const c = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!c) return NextResponse.json({ error: "Profil nicht gefunden." }, { status: 404 });
  try {
    return NextResponse.json({ ok: true, until: await cancelSubscription(c.id) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Fehler" }, { status: 400 });
  }
}
