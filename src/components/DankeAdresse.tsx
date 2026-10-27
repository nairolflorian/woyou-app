"use client";

// Nach der Rückkehr von Stripe die Zahlungs-Sitzung (session_id) aus der Adresszeile nehmen und durch die
// Buchungs-ID ersetzen, bevor Tracking-Skripte die Adresse lesen (Layout-Effekt läuft vor TrackingConsent).
// Beim Neuladen erkennt die Seite die Buchung dann über ?b=.
import { useLayoutEffect } from "react";

export function DankeAdresse({ buchungId }: { buchungId: string | null }) {
  useLayoutEffect(() => {
    const u = new URL(window.location.href);
    if (!u.searchParams.has("session_id") && !u.searchParams.has("test")) return;
    const ziel = `${u.pathname}${buchungId ? `?b=${encodeURIComponent(buchungId)}` : ""}`;
    window.history.replaceState(window.history.state, "", ziel);
  }, [buchungId]);
  return null;
}
