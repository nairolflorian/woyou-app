import { NextResponse } from "next/server";
import { toolSession } from "@/lib/werkzeug";
import { rateLimit } from "@/lib/rate-limit";
import { sucheStellen } from "@/lib/stellensuche";
import { LEVELS, type Hours, type Level } from "@/lib/stellensuche-core";

export const maxDuration = 60;

// Stellensuche der Kundin bzw. des Kunden (Weg 1: das Werkzeug, keine Auswahl durch WoYou)
//   GET /api/stellensuche?was=…&wo=…&umkreis=25&arbeitszeit=alle|vollzeit|teilzeit&deutsch=B1&nurPassend=1&seite=1
export async function GET(req: Request) {
  const s = await toolSession();
  if (!s) return NextResponse.json({ error: "Bitte melde dich an." }, { status: 401 });
  if (!s.access.active) return NextResponse.json({ error: "Das Bewerbungswerkzeug ist nicht freigeschaltet." }, { status: 403 });
  if (!rateLimit("stellensuche", s.candidate.id, 60, 3600e3).ok) return NextResponse.json({ error: "Zu viele Suchen in kurzer Zeit. Bitte warte einen Moment." }, { status: 429 });

  const q = new URL(req.url).searchParams;
  const was = (q.get("was") || "").trim().slice(0, 100);
  if (was.length < 2) return NextResponse.json({ error: "Bitte gib einen Beruf ein." }, { status: 400 });
  const umkreis = [10, 25, 50, 100, 200].includes(Number(q.get("umkreis"))) ? Number(q.get("umkreis")) : 25;
  const az = q.get("arbeitszeit");
  const arbeitszeit: Hours = az === "vollzeit" || az === "teilzeit" ? az : "alle";
  const d = (q.get("deutsch") || "").toUpperCase();
  const deutsch = (LEVELS as readonly string[]).includes(d) ? (d as Level) : null;
  const seite = Math.min(20, Math.max(1, Number(q.get("seite")) || 1));
  const r = await sucheStellen({ was, wo: (q.get("wo") || "").trim().slice(0, 80) || undefined, umkreis, arbeitszeit, deutsch, nurPassend: q.get("nurPassend") === "1", seite });
  return NextResponse.json(r);
}
