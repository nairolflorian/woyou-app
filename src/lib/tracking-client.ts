// Browser-Seite des Trackings. Alles hier ist wirkungslos, solange
//  a) keine ID gesetzt ist (dann gibt es TrackingConsent nicht und window.__woyouTracking fehlt) oder
//  b) keine Einwilligung vorliegt (Cookie woyou_consent nicht v1:all).
// Ereignisse tragen nur feste Werte (siehe sauberesEreignis), nie Name, E-Mail, Telefon oder Freitext.
import {
  CONSENT_COOKIE, FREMD_COOKIE, consentAusCookieHeader, consentCookie, ereignisAufrufe, sauberesEreignis, sichereUrl,
  type ConsentWahl, type TrackEreignis, type TrackingIds,
} from "@/lib/tracking-core";

type Fn = (...args: unknown[]) => void;
type FbqFn = Fn & { callMethod?: Fn; queue: unknown[]; push: Fn; loaded: boolean; version: string; disablePushState?: boolean };
type WoyouTracking = { ids: TrackingIds; geladen: boolean; nonce?: string };
declare global {
  interface Window { __woyouTracking?: WoyouTracking; dataLayer?: unknown[]; gtag?: Fn; fbq?: FbqFn; _fbq?: FbqFn }
}

const QUEUE = "woyou_track_queue";
/** Neues Ereignis in der Warteschlange, TrackingConsent sendet sie, wenn die Skripte schon geladen sind. */
export const WARTESCHLANGE_EVENT = "woyou:track-queue";

export function aktuelleWahl(): ConsentWahl | null {
  try { return consentAusCookieHeader(document.cookie); } catch { return null; }
}

export function wahlSpeichern(wahl: ConsentWahl) {
  try { document.cookie = consentCookie(wahl, window.location.protocol === "https:"); } catch { /* ohne Cookies bleibt das Banner */ }
}

/** Beim Widerruf: Cookies von Meta und Google auf dieser Domain und der Hauptdomain löschen. */
export function fremdCookiesLoeschen() {
  try {
    const host = window.location.hostname;
    const teile = host.split(".");
    const domains = ["", host, ...(teile.length > 2 ? [teile.slice(-2).join(".")] : []), ...(teile.length > 1 ? [`.${teile.slice(-2).join(".")}`] : [])];
    for (const c of document.cookie.split(";")) {
      const name = c.split("=")[0]?.trim();
      if (!name || name === CONSENT_COOKIE || !FREMD_COOKIE.test(name)) continue;
      for (const d of domains) document.cookie = `${name}=; Path=/; Max-Age=0${d ? `; Domain=${d}` : ""}`;
    }
  } catch { /* nichts zu tun */ }
}

function skript(src: string, nonce?: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  if (nonce) s.nonce = nonce;
  document.head.appendChild(s);
}

/** Von TrackingConsent beim Start: IDs bekannt, Skripte noch nicht geladen. Ohne diesen Aufruf bleibt trackEreignis stumm. */
export function trackingVorbereiten(ids: TrackingIds, nonce?: string) {
  if (!window.__woyouTracking) window.__woyouTracking = { ids, geladen: false, nonce };
}

/** Erst nach Einwilligung aufrufen. Lädt gtag.js und fbevents.js genau einmal. */
export function skripteLaden(ids: TrackingIds, nonce?: string) {
  const w = window;
  if (w.__woyouTracking?.geladen) return;
  w.__woyouTracking = { ids, geladen: true, nonce };

  if (ids.google) {
    w.dataLayer = w.dataLayer || [];
    // gtag erwartet das arguments-Objekt, kein Array
    // eslint-disable-next-line prefer-rest-params
    w.gtag = function gtag() { w.dataLayer!.push(arguments); };
    // Consent Mode v2: zuerst alles verweigert, dann (Einwilligung liegt vor) erteilt, erst danach config
    w.gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: "denied" });
    w.gtag("consent", "update", { ad_storage: "granted", ad_user_data: "granted", ad_personalization: "granted", analytics_storage: "granted" });
    w.gtag("js", new Date());
    w.gtag("config", ids.google, { send_page_view: false }); // Seitenaufrufe senden wir selbst (App Router)
    skript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ids.google)}`, nonce);
  }

  if (ids.meta && !w.fbq) {
    // offizieller Platzhalter von Meta, als Code statt Inline-Skript (CSP)
    const n = function fbq(...args: unknown[]) { if (n.callMethod) n.callMethod(...args); else n.queue.push(args); } as FbqFn;
    n.queue = []; n.push = n; n.loaded = true; n.version = "2.0";
    n.disablePushState = true; // keine automatischen Seitenaufrufe, sonst doppelt mit unseren
    w.fbq = n; if (!w._fbq) w._fbq = n;
    w.fbq("set", "autoConfig", false, ids.meta); // keine automatischen Klick- und Formular-Ereignisse
    w.fbq("init", ids.meta);
    skript("https://connect.facebook.net/en_US/fbevents.js", nonce);
  }
}

export function seitenaufruf() {
  const w = window, t = w.__woyouTracking;
  if (!t?.geladen) return;
  if (t.ids.google && w.gtag) w.gtag("event", "page_view", { page_location: sichereUrl(w.location.href), page_title: document.title });
  if (t.ids.meta && w.fbq) w.fbq("track", "PageView");
}

function senden(e: TrackEreignis) {
  const w = window, t = w.__woyouTracking;
  if (!t?.geladen) return;
  const a = ereignisAufrufe(e);
  if (t.ids.meta && w.fbq) for (const m of a.meta) w.fbq(m.art, m.name, m.daten ?? {}, ...(m.eventID ? [{ eventID: m.eventID }] : []));
  if (t.ids.google && w.gtag) for (const g of a.google) w.gtag("event", g.name, g.daten);
}

function queueLesen(): TrackEreignis[] {
  try { const x = JSON.parse(sessionStorage.getItem(QUEUE) || "[]"); return Array.isArray(x) ? x.map(sauberesEreignis).filter((e): e is TrackEreignis => !!e) : []; } catch { return []; }
}

/** Gemerkte Ereignisse senden (nach dem Laden der Skripte, z. B. Registrierung vor dem Seitenwechsel). */
export function warteschlangeSenden() {
  if (!window.__woyouTracking?.geladen) return;
  const q = queueLesen();
  try { sessionStorage.removeItem(QUEUE); } catch { /* egal */ }
  for (const e of q) senden(e);
}

/**
 * Ereignis melden. Ohne Tracking-IDs oder ohne Einwilligung passiert nichts.
 * nachSeitenwechsel: true, wenn gleich danach die Seite neu lädt (Registrierung); dann sendet die nächste Seite.
 */
export function trackEreignis(roh: TrackEreignis, opts: { nachSeitenwechsel?: boolean } = {}) {
  try {
    const e = sauberesEreignis(roh);
    if (!e || !window.__woyouTracking || aktuelleWahl() !== "all") return;
    if (!opts.nachSeitenwechsel && window.__woyouTracking?.geladen) { senden(e); return; }
    sessionStorage.setItem(QUEUE, JSON.stringify([...queueLesen(), e].slice(-10)));
  } catch { /* Tracking darf nie stören */ }
}
