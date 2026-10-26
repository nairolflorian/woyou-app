import { NextResponse } from "next/server";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { pruefeWiderruf } from "@/lib/recht/vertrag";
import { widerrufEinreichen } from "@/lib/recht/server";

// „Vertrag widerrufen“ (ohne Anmeldung). Speichert den Widerruf, schickt sofort eine Eingangsbestätigung,
// legt eine Aufgabe im Admin an. Antwort enthält die Bestätigung zum Anzeigen und Speichern.
export async function POST(req: Request) {
  const rl = rateLimit("widerruf", clientIp(req), 5, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Zu viele Versuche. Bitte später erneut oder schreib uns eine E-Mail." }, { status: 429 });
  const p = pruefeWiderruf(await req.json().catch(() => ({})));
  if (!p.ok) return NextResponse.json({ error: "Bitte prüfe deine Angaben.", fehler: p.fehler }, { status: 400 });
  try {
    const { widerruf, bestaetigung } = await widerrufEinreichen(p.daten);
    return NextResponse.json({ ok: true, id: widerruf.id, eingang: widerruf.createdAt.toISOString(), betreff: bestaetigung.betreff, zeilen: bestaetigung.zeilen });
  } catch (e) {
    console.error("[widerruf]", e instanceof Error ? e.message : e);
    return NextResponse.json({ error: "Das hat leider nicht geklappt. Bitte schreib uns eine E-Mail, dein Widerruf gilt auch so." }, { status: 500 });
  }
}
