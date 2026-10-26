import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { pruefeKuendigung } from "@/lib/recht/vertrag";
import { kuendigungEinreichen } from "@/lib/recht/server";

// „Verträge hier kündigen“ (§ 312k BGB, ohne Anmeldung). Speichert die Kündigung, schickt sofort eine
// Eingangsbestätigung mit Zeitpunkt und Vertragsende, legt eine Aufgabe im Admin an.
export async function POST(req: Request) {
  const rl = rateLimit("kuendigung", clientIp(req), 5, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Zu viele Versuche. Bitte später erneut oder schreib uns eine E-Mail." }, { status: 429 });
  const p = pruefeKuendigung(await req.json().catch(() => ({})));
  if (!p.ok) return NextResponse.json({ error: "Bitte prüfe deine Angaben.", fehler: p.fehler }, { status: 400 });
  try {
    const { kuendigung, bestaetigung } = await kuendigungEinreichen(p.daten);
    return NextResponse.json({ ok: true, id: kuendigung.id, eingang: kuendigung.createdAt.toISOString(), betreff: bestaetigung.betreff, zeilen: bestaetigung.zeilen });
  } catch (e) {
    console.error("[kuendigung]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Das hat leider nicht geklappt. Bitte schreib uns eine E-Mail, deine Kündigung gilt auch so." }, { status: 500 });
  }
}
