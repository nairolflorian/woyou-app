import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { prisma } from "@/lib/prisma";
import { isEmail } from "@/lib/stellensuche-core";

// Eigene E-Mail-Adresse für Bewerbungen speichern (leer = Login-Mail).
// Sie steht in Anschreiben, Lebenslauf und im E-Mail-Entwurf. Kein Passwort, kein Postfach-Zugang: WoYou verschickt nichts.
export async function POST(req: Request) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const email = typeof b.email === "string" ? b.email.trim().slice(0, 200) : "";
  if (email && !isEmail(email)) return NextResponse.json({ error: "Bitte prüf die E-Mail-Adresse." }, { status: 400 });
  await prisma.candidate.update({ where: { id: s.candidate.id }, data: { applicationEmail: email || null } });
  return NextResponse.json({ ok: true, email: email || s.candidate.user.email || "" });
}
