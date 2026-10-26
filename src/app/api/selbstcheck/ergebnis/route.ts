import { prisma } from "@/lib/prisma";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { parseSelbstcheckErgebnis } from "@/lib/pilot-core";
import { captureError } from "@/lib/error-log";

// Selbstcheck-Ergebnis für die Statistik (Pilot Westbalkan). Ohne Anmeldung, ohne Personenbezug:
// gespeichert wird nur, was parseSelbstcheckErgebnis() durchlässt. Die IP dient nur der Mengenbegrenzung
// im Arbeitsspeicher (src/lib/rate-limit.ts) und wird nicht gespeichert.
const leer = (status: number) => new Response(null, { status });

export async function POST(req: Request) {
  // Nur von der eigenen Seite (Browser schicken Origin bei POST mit)
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host) { try { if (new URL(origin).host !== host) return leer(403); } catch { return leer(403); } }
  if (!rateLimit("selbstcheck-ergebnis", clientIp(req), 30, 3600e3).ok) return leer(429);
  const text = await req.text().catch(() => "");
  if (text.length > 1000) return leer(413);
  let body: unknown = null;
  try { body = JSON.parse(text); } catch { return leer(400); }
  const e = parseSelbstcheckErgebnis(body);
  if (!e) return leer(400);
  const stunde = new Date(); stunde.setUTCMinutes(0, 0, 0);
  try {
    await prisma.selfCheckResult.create({ data: { ...e, createdAt: stunde } });
  } catch (err) {
    await captureError(err, { level: "WARN", path: "/api/selbstcheck/ergebnis" }).catch(() => {});
  }
  return leer(204);
}
