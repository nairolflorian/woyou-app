// Einwilligung und Tracking (Meta Pixel, Google-Tag), Kernlogik ohne Server- oder Browser-Abhängigkeit (testbar).
// Die IDs kommen zur Laufzeit aus der Server-Umgebung (META_PIXEL_ID, GOOGLE_TAG_ID). Solange beide leer oder ungültig sind,
// bleibt alles wie bisher: kein Banner mit Auswahl, keine externen Skripte, CSP unverändert.
// Externe Skripte laden erst nach der Einwilligung („Alle akzeptieren“ oder Schalter in den Einstellungen).

export type TrackingIds = { meta: string | null; google: string | null };

/** Meta-Pixel-ID: nur Ziffern (heute meist 15 oder 16 Stellen). */
export function parseMetaPixelId(v: string | undefined | null): string | null {
  const s = (v ?? "").trim();
  return /^\d{10,20}$/.test(s) ? s : null;
}

/** Google-Tag-ID: G-XXXX (Analytics) oder AW-XXXX (Ads). */
export function parseGoogleTagId(v: string | undefined | null): string | null {
  const s = (v ?? "").trim().toUpperCase();
  return /^(G|AW)-[A-Z0-9]{4,20}$/.test(s) ? s : null;
}

// Bewusst mit berechnetem Schlüssel gelesen: Die Middleware läuft in der Edge-Sandbox, dort würde ein statisches
// process.env.X beim Build eingefroren. So gilt der Wert aus der Laufzeit-Umgebung (wie TERMINLAND_URL).
const envKey = (k: "META_PIXEL_ID" | "GOOGLE_TAG_ID", env: Record<string, string | undefined>) => env[k];

export function trackingIdsAus(env: Record<string, string | undefined>): TrackingIds {
  return { meta: parseMetaPixelId(envKey("META_PIXEL_ID", env)), google: parseGoogleTagId(envKey("GOOGLE_TAG_ID", env)) };
}

export const trackingAn = (ids: TrackingIds) => !!(ids.meta || ids.google);

/** Content-Security-Policy. Ohne IDs exakt wie vor dem Tracking (siehe Test in scripts/weg1-test.ts). */
export function buildCsp(nonce: string, isDev: boolean, ids: TrackingIds = { meta: null, google: null }): string {
  const g = !!ids.google, m = !!ids.meta, ads = !!ids.google?.startsWith("AW-");
  const extra = (...hosts: (string | false)[]) => hosts.filter(Boolean).map((h) => ` ${h}`).join("");

  const scriptHosts = extra(g && "https://www.googletagmanager.com", m && "https://connect.facebook.net");
  const scriptSrc = isDev
    ? `script-src 'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval'${scriptHosts}`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${scriptHosts}`;

  const googleHosts = ["https://*.googletagmanager.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://*.g.doubleclick.net", "https://*.google.com"];
  const imgExtra = extra(...(g ? googleHosts : []), m && "https://www.facebook.com");
  const connectExtra = extra(...(g ? googleHosts : []), m && "https://www.facebook.com", m && "https://connect.facebook.net");

  return [
    "default-src 'self'",
    scriptSrc,
    // Style-src stays loose: Next.js + Tailwind 4 inline some critical CSS.
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data:${imgExtra}`, // Fotos liegen lokal (public/bilder); Fremd-Hosts nur mit Tracking-IDs
    "font-src 'self' data:",
    `connect-src 'self'${connectExtra}`,
    // Google Ads (AW-) nutzt für Remarketing einen unsichtbaren Frame
    ...(ads ? ["frame-src https://td.doubleclick.net https://www.googletagmanager.com"] : []),
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

// --- Einwilligungs-Cookie (first party, kein Bezug zur Person) ---

export const CONSENT_COOKIE = "woyou_consent";
export const CONSENT_VERSION = "v1";
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 182; // 6 Monate
export type ConsentWahl = "all" | "none";

/** Wert des Cookies prüfen. Alles andere (alte Version, kaputt) gilt als „noch nicht entschieden“. */
export function parseConsent(v: string | undefined | null): ConsentWahl | null {
  const s = (v ?? "").trim();
  if (s === `${CONSENT_VERSION}:all`) return "all";
  if (s === `${CONSENT_VERSION}:none`) return "none";
  return null;
}

/** Aus einem Cookie-Header bzw. document.cookie. */
export function consentAusCookieHeader(header: string | undefined | null): ConsentWahl | null {
  for (const teil of (header ?? "").split(";")) {
    const i = teil.indexOf("=");
    if (i < 0) continue;
    if (teil.slice(0, i).trim() === CONSENT_COOKIE) {
      let wert = teil.slice(i + 1);
      try { wert = decodeURIComponent(wert); } catch { /* roh lassen */ }
      return parseConsent(wert);
    }
  }
  return null;
}

export function consentCookie(wahl: ConsentWahl, secure: boolean): string {
  return `${CONSENT_COOKIE}=${CONSENT_VERSION}:${wahl}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax${secure ? "; Secure" : ""}`;
}

/** Cookies, die Meta und Google setzen; beim Widerruf löschen wir sie (soweit sie auf woyou.de liegen). */
export const FREMD_COOKIE = /^(_ga|_ga_[A-Z0-9]+|_gid|_gat.*|_gcl_[a-z]+|_fbp|_fbc)$/;

// --- Seiten und Adressen ---

/** Seiten ohne Tracking: Admin, Abmeldelink und Telegram-Registrierung (Token in der Adresse), Druckansicht. */
const OHNE_TRACKING = ["/admin", "/abmelden", "/registrierung/telegram", "/druck", "/api"];
export function trackingErlaubt(pathname: string): boolean {
  return !OHNE_TRACKING.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Adresse für Google: nur Pfad und Werbeparameter, keine anderen Parameter (z. B. Stripe-Sitzung). */
// b = Buchungs-ID auf der Danke-Seite; geht ohnehin als event_id bzw. transaction_id mit dem Kauf-Ereignis raus
const ERLAUBTE_PARAMETER = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "gbraid", "wbraid", "fbclid", "land", "b"];
// Meta liest die Adresse selbst aus (sie lässt sich nicht kürzen). Deshalb Meta-Aufrufe nur auf Adressen,
// deren Parameter alle unbedenklich sind; z. B. nie mit Stripe-Sitzung (session_id) oder Abmelde-Schlüssel.
export function nurErlaubteParameter(href: string): boolean {
  try { return [...new URL(href).searchParams.keys()].every((k) => ERLAUBTE_PARAMETER.includes(k)); } catch { return false; }
}
export function sichereUrl(href: string): string {
  try {
    const u = new URL(href);
    const q = new URLSearchParams();
    for (const k of ERLAUBTE_PARAMETER) { const v = u.searchParams.get(k); if (v) q.set(k, v.slice(0, 100)); }
    const s = q.toString();
    return `${u.origin}${u.pathname}${s ? `?${s}` : ""}`;
  } catch {
    return "";
  }
}

// --- Ereignisse (nur feste Felder, nie Name, E-Mail, Telefon oder Freitext) ---

export const KAUF_WERT_EUR = 199;
export type TrackEreignis =
  | { typ: "selbstcheck"; level: "green" | "yellow" | "red"; land: string }
  | { typ: "registrierung" }
  | { typ: "kauf"; buchungId: string };

/** Nur erlaubte Werte durchlassen; alles andere fällt weg. */
export function sauberesEreignis(e: unknown): TrackEreignis | null {
  if (!e || typeof e !== "object") return null;
  const x = e as Record<string, unknown>;
  if (x.typ === "selbstcheck" && (x.level === "green" || x.level === "yellow" || x.level === "red")) {
    const land = typeof x.land === "string" && /^[A-Z]{2}$/.test(x.land) ? x.land : "other";
    return { typ: "selbstcheck", level: x.level, land };
  }
  if (x.typ === "registrierung") return { typ: "registrierung" };
  if (x.typ === "kauf" && typeof x.buchungId === "string" && /^[A-Za-z0-9_-]{6,40}$/.test(x.buchungId)) return { typ: "kauf", buchungId: x.buchungId };
  return null;
}

type MetaAufruf = { art: "track" | "trackCustom"; name: string; daten?: Record<string, string | number>; eventID?: string };
type GoogleAufruf = { name: string; daten: Record<string, string | number> };

/** Welche Aufrufe ein Ereignis auslöst. Lead/generate_lead nur bei Grün und Gelb, damit Anzeigen nicht auf „wir raten ab“ optimieren. */
export function ereignisAufrufe(e: TrackEreignis): { meta: MetaAufruf[]; google: GoogleAufruf[] } {
  switch (e.typ) {
    case "selbstcheck": {
      const daten = { level: e.level, country: e.land };
      const lead = e.level !== "red";
      return {
        meta: [{ art: "trackCustom", name: "SelfCheckDone", daten }, ...(lead ? [{ art: "track" as const, name: "Lead", daten: { content_name: "selbstcheck", ...daten } }] : [])],
        google: [{ name: "selfcheck_done", daten }, ...(lead ? [{ name: "generate_lead", daten: { lead_source: "selbstcheck", ...daten } }] : [])],
      };
    }
    case "registrierung":
      return { meta: [{ art: "track", name: "CompleteRegistration" }], google: [{ name: "sign_up", daten: { method: "woyou" } }] };
    case "kauf":
      return {
        meta: [{ art: "track", name: "Purchase", daten: { value: KAUF_WERT_EUR, currency: "EUR", content_name: "startpaket" }, eventID: e.buchungId }],
        google: [{ name: "purchase", daten: { transaction_id: e.buchungId, value: KAUF_WERT_EUR, currency: "EUR" } }],
      };
  }
}
