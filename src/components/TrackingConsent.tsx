"use client";

// Einwilligungs-Banner mit Auswahl. Nur im Layout, wenn META_PIXEL_ID oder GOOGLE_TAG_ID gültig gesetzt ist;
// sonst bleibt der bisherige Hinweis (CookieBanner) und es gibt keine externen Skripte.
// „Alle akzeptieren“ und „Nur notwendige“ sind gleich groß und gleich gestaltet, nichts ist vorausgewählt (TDDDG/DSGVO).
// Vor der Einwilligung lädt nichts von Meta oder Google. Wir protokollieren keine Wahl auf dem Server.

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { ConsentText } from "@/lib/consent-text";
import { trackingErlaubt, type ConsentWahl, type TrackingIds } from "@/lib/tracking-core";
import {
  aktuelleWahl, fremdCookiesLoeschen, seitenaufruf, skripteLaden, trackingVorbereiten, wahlSpeichern, warteschlangeSenden, WARTESCHLANGE_EVENT,
} from "@/lib/tracking-client";

export const COOKIE_EINSTELLUNGEN_EVENT = "woyou:cookie-einstellungen";

export function TrackingConsent({ ids, nonce, text }: { ids: TrackingIds; nonce?: string; text: ConsentText }) {
  const pathname = usePathname();
  const [wahl, setWahl] = useState<ConsentWahl | null | undefined>(undefined); // undefined = noch nicht gelesen
  const [offen, setOffen] = useState(false);
  const [details, setDetails] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const geladen = useRef(false);

  // Beim Start: Wahl aus dem Cookie lesen
  useEffect(() => {
    trackingVorbereiten(ids, nonce);
    const w = aktuelleWahl();
    setWahl(w);
    if (!w) setOffen(true);
    // nach einem Widerruf: Reste von Meta/Google entfernen (gtag schreibt beim Verlassen der Seite noch einmal)
    if (w === "none") fremdCookiesLoeschen();
  }, [ids, nonce]);

  // Link „Cookie-Einstellungen“ in der Fußzeile öffnet das Banner wieder
  useEffect(() => {
    const auf = () => { setMarketing(aktuelleWahl() === "all"); setDetails(true); setOffen(true); };
    window.addEventListener(COOKIE_EINSTELLUNGEN_EVENT, auf);
    return () => window.removeEventListener(COOKIE_EINSTELLUNGEN_EVENT, auf);
  }, []);

  // Ereignis aus einer Seite (Kauf) nachträglich senden, wenn die Skripte schon laufen
  useEffect(() => {
    const senden = () => { if (geladen.current) warteschlangeSenden(); };
    window.addEventListener(WARTESCHLANGE_EVENT, senden);
    return () => window.removeEventListener(WARTESCHLANGE_EVENT, senden);
  }, []);

  // Skripte nach Einwilligung laden, Seitenaufruf bei jedem Wechsel im App Router
  useEffect(() => {
    if (wahl !== "all" || !trackingErlaubt(pathname)) return;
    if (!geladen.current) { skripteLaden(ids, nonce); geladen.current = true; }
    seitenaufruf();
    warteschlangeSenden();
  }, [wahl, pathname, ids, nonce]);

  const entscheiden = useCallback((neu: ConsentWahl) => {
    const vorher = aktuelleWahl();
    wahlSpeichern(neu);
    setWahl(neu);
    setOffen(false);
    setDetails(false);
    if (neu === "none" && vorher === "all") {
      // Widerruf: Fremd-Cookies löschen und neu laden, damit keine Skripte mehr laufen
      fremdCookiesLoeschen();
      if (window.__woyouTracking?.geladen) window.location.reload();
    }
  }, []);

  if (!offen || wahl === undefined) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-titel" className="fixed inset-x-0 bottom-0 z-50 border-t border-[color:var(--color-border)] bg-white shadow-xl">
      <div className="mx-auto max-w-5xl px-6 py-4 space-y-3">
        <div className="text-sm text-[color:var(--color-ink)]">
          <strong id="consent-titel" className="block mb-1">{text.title}</strong>
          {text.body}{" "}
          <a href="/datenschutz" className="text-[color:var(--color-brand)] underline">{text.privacy}</a>
        </div>

        {details && (
          <div className="rounded-xl border border-[color:var(--color-border)] p-3 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div><strong>{text.necessary}</strong><div className="text-[color:var(--color-ink-soft)]">{text.necessaryDesc}</div></div>
              <span className="text-xs text-[color:var(--color-ink-soft)] whitespace-nowrap">{text.alwaysOn}</span>
            </div>
            <label className="flex items-start justify-between gap-3 cursor-pointer">
              <span><strong>{text.marketing}</strong><span className="block text-[color:var(--color-ink-soft)]">{text.marketingDesc}</span></span>
              <input type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
            </label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary text-sm" onClick={() => entscheiden("all")}>{text.accept}</button>
          <button type="button" className="btn-primary text-sm" onClick={() => entscheiden("none")}>{text.reject}</button>
          {details
            ? <button type="button" className="btn-outline text-sm" onClick={() => entscheiden(marketing ? "all" : "none")}>{text.save}</button>
            : <button type="button" className="btn-outline text-sm" onClick={() => { setMarketing(false); setDetails(true); }}>{text.settings}</button>}
        </div>
      </div>
    </div>
  );
}

/** Link in der Fußzeile (nur mit Tracking-IDs). Als Knopf, weil er nur das Banner öffnet. */
export function CookieEinstellungenLink({ label }: { label: string }) {
  return (
    <button type="button" className="hover:text-white text-start" onClick={() => window.dispatchEvent(new Event(COOKIE_EINSTELLUNGEN_EVENT))}>
      {label}
    </button>
  );
}
