import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { captureError } from "@/lib/error-log";
import { SELBSTCHECK_COOKIE, SELBSTCHECK_COOKIE_TAGE, gemerktAusEingabe, gemerktJson } from "@/lib/selbstcheck-vorbuchung";
import { selbstcheckVorBuchungAn } from "@/lib/selbstcheck-vorbuchung-server";

// Schalter „Selbstcheck vor der Buchung“: Ergebnis merken, damit die Bestellseite es kennt.
// Angemeldete Kund:innen: im Konto (Candidate.selbstcheck). Ohne Konto: kurzlebiges Cookie, das bei Registrierung
// oder Anmeldung übernommen wird. Gemerkt wird nur Ampel, Datum und beim Westbalkan Ländercode und Berufsgruppe.
// Getrennt von /api/selbstcheck/ergebnis: die anonyme Statistik wird nie mit dem Konto verknüpft.
// Die Ampel berechnet der Browser (wie bisher im Selbstcheck); sie ist eine ehrliche Empfehlung, keine Sicherheitsgrenze.
const leer = (status: number) => new Response(null, { status });

export async function POST(req: Request) {
  if (!selbstcheckVorBuchungAn()) return leer(204); // Schalter aus: nichts merken, alles wie bisher
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) { try { if (new URL(origin).host !== host) return leer(403); } catch { return leer(403); } }
  if (!rateLimit("selbstcheck-merken", clientIp(req), 30, 3600e3).ok) return leer(429);
  const text = await req.text().catch(() => "");
  if (text.length > 500) return leer(413);
  let body: unknown = null;
  try { body = JSON.parse(text); } catch { return leer(400); }
  const check = gemerktAusEingabe(body);
  if (!check) return leer(400);

  const session = await getSession();
  if (session.userId && session.role === ROLE.CANDIDATE) {
    try {
      const selbstcheck = gemerktJson(check);
      await prisma.candidate.upsert({ where: { userId: session.userId }, update: { selbstcheck }, create: { userId: session.userId, status: CANDIDATE_STATUS.REGISTERED, selbstcheck } });
    } catch (err) {
      await captureError(err, { level: "WARN", path: "/api/selbstcheck/merken" }).catch(() => {});
    }
    const res = new NextResponse(null, { status: 204 });
    res.cookies.delete(SELBSTCHECK_COOKIE);
    return res;
  }
  const res = new NextResponse(null, { status: 204 });
  res.cookies.set(SELBSTCHECK_COOKIE, gemerktJson(check), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SELBSTCHECK_COOKIE_TAGE * 86_400,
  });
  return res;
}
