"use client";

// Kauf an Meta/Google melden (nur mit Einwilligung und gesetzten IDs), je Buchung nur einmal pro Browser.
// Die Buchungs-ID ist die event_id bzw. transaction_id, damit die spätere Conversions API doppelte Meldungen erkennt.
import { useEffect } from "react";
import { aktuelleWahl, trackEreignis, WARTESCHLANGE_EVENT } from "@/lib/tracking-client";

const KEY = "woyou_kauf_gemeldet";

export function KaufEreignis({ buchungId }: { buchungId: string }) {
  useEffect(() => {
    // setTimeout: erst nach dem Start von TrackingConsent (steht im Layout hinter der Seite, sein Effekt läuft später)
    const t = setTimeout(() => {
      let gemeldet: string[] = [];
      try { const x = JSON.parse(localStorage.getItem(KEY) || "[]"); if (Array.isArray(x)) gemeldet = x.filter((v) => typeof v === "string"); } catch { /* ohne localStorage */ }
      if (gemeldet.includes(buchungId)) return;
      if (!window.__woyouTracking || aktuelleWahl() !== "all") return; // ohne Einwilligung nichts merken
      // in die Warteschlange; TrackingConsent sendet sie, sobald die Skripte geladen sind
      trackEreignis({ typ: "kauf", buchungId }, { nachSeitenwechsel: true });
      try { localStorage.setItem(KEY, JSON.stringify([...gemeldet, buchungId].slice(-20))); } catch { /* egal */ }
      window.dispatchEvent(new Event(WARTESCHLANGE_EVENT));
    }, 0);
    return () => clearTimeout(t);
  }, [buchungId]);
  return null;
}
