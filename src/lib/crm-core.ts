// Kern der Anbindung an das EuBiA-CRM (ohne "server-only", damit auch scripts/crm-nachtragen.ts es nutzen kann).
// In der App bitte nur über src/lib/crm-sync.ts verwenden. Hintergrund und Datenschutz: siehe dort.
import type { PrismaClient } from "@prisma/client";

// Weg 1 (22.10.2026): "bewerbungen_laufen" entfällt. WoYou verschickt keine Bewerbungen mehr, und was Kund:innen
// in ihrem eigenen Tracker eintragen, geht weder WoYou noch das CRM etwas an. Neu: "werkzeug_aktiv" = Unterlagen
// fertig (Mappe vom Team freigegeben), die Person arbeitet ab jetzt selbst mit dem Werkzeug.
// "nachkauf" = ALT (Verlängerung/Abo gibt es seit 23.10.2026 nicht mehr; wird nicht mehr gesendet, Typ bleibt fürs Nachtragen).
// Achtung: Das EuBiA-CRM (apps/crm/eingang.js) muss "werkzeug_aktiv" noch annehmen, sonst antwortet es mit 400.
export type CrmEventName = "registriert" | "gebucht" | "bezahlt" | "mappe_eingereicht" | "werkzeug_aktiv" | "nachkauf" | "storniert";

export type CrmPayload = {
  woyouId: string;
  email?: string;
  vorname?: string;
  nachname?: string;
  telefon?: string;
  land?: string;
  zielberuf?: string;
  paket?: string;
  betrag?: number;
  datum?: string;
};

// Weitergabe nur, wenn URL, Schlüssel UND die ausdrückliche Freigabe EUBIA_CRM_SYNC=on gesetzt sind
export function crmConfig() {
  const url = process.env.EUBIA_CRM_URL?.trim().replace(/\/+$/, "");
  const token = process.env.EUBIA_CRM_TOKEN?.trim();
  if (!url || !token || process.env.EUBIA_CRM_SYNC !== "on") return null;
  return { url, token };
}

// Ein Ereignis senden. Wirft nie; Rückgabe true bei 200/201. Im Log nur Ereignis und Status, keine Personendaten.
export async function sendCrmEvent(event: CrmEventName, data: CrmPayload): Promise<boolean> {
  const cfg = crmConfig();
  if (!cfg) return false;
  try {
    const body = JSON.stringify({ event, ...clean(data), datum: data.datum ?? new Date().toISOString() });
    const res = await fetch(`${cfg.url}/hook/woyou?t=${encodeURIComponent(cfg.token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (res.status !== 200 && res.status !== 201) {
      console.error(`[crm] ${event}: HTTP ${res.status}`);
      return false;
    }
    return true;
  } catch (e) {
    const kind = e instanceof Error ? e.name : "Fehler";
    console.error(`[crm] ${event}: ${kind === "TimeoutError" ? "Zeitüberschreitung" : "nicht erreichbar"}`);
    return false;
  }
}

const clean = (d: CrmPayload) => Object.fromEntries(Object.entries(d).filter(([, v]) => v !== undefined && v !== null && v !== "")) as CrmPayload;

// Stammdaten einer Kund:in für das CRM zusammenstellen (Buchungsdaten haben Vorrang, weil aktueller)
export async function candidatePayload(db: PrismaClient, candidateId: string, extra: Partial<CrmPayload> = {}): Promise<CrmPayload | null> {
  const c = await db.candidate.findUnique({
    where: { id: candidateId },
    include: { user: { select: { email: true, phone: true } }, bookings: { orderBy: { createdAt: "desc" }, take: 1, select: { contactPhone: true, targetJobs: true, packageKey: true } } },
  });
  if (!c) return null;
  const b = c.bookings[0];
  return {
    woyouId: c.id,
    email: c.user.email ?? undefined,
    vorname: c.firstName ?? undefined,
    nachname: c.lastName ?? undefined,
    telefon: b?.contactPhone || c.whatsappNumber || c.user.phone || undefined,
    land: c.countryOfResidence || c.nationality || undefined,
    zielberuf: b?.targetJobs || c.desiredJobTitle || undefined,
    paket: b?.packageKey,
    ...extra,
  };
}

// Demo- und Testkonten nie übertragen
export function isDemoEmail(email?: string | null) {
  if (!email) return false;
  const e = email.toLowerCase();
  return /\.demo$/.test(e) || /@(example\.(com|org|net)|test\.(de|com)|woyou\.test)$/.test(e) || e.endsWith(".invalid") || e.endsWith(".local");
}

export const euro = (cents: number) => Math.round(cents) / 100;
