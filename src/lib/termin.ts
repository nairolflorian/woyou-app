// Unterlagen-Check im 15-Minuten-Call (Wunsch Rachid, 26.10.2026): nur nach der Zahlung, gebucht über Terminland
// (Terminland GmbH, Wiesbaden; Auftragsverarbeitung über deren AGB Teil B). Der Buchungslink kommt von EuBiA (Dörthe)
// und steht als TERMINLAND_URL in .env (Staging) bzw. .env.prod. Ohne gültigen Link zeigt woyou.de nichts an,
// Staging zeigt den Kasten mit dem Hinweis „Link folgt“. Wir hängen keine persönlichen Daten an den Link.
// Inhalt des Calls: nur die eigenen Unterlagen, keine Vermittlung, kein Kontakt zu Firmen (Weg 1).
import "server-only";
import { DEMO_MODE_ENABLED } from "@/lib/demo-accounts";

export const CALL_MINUTES = 15;

export function terminlandUrl(): string | null {
  const u = process.env.TERMINLAND_URL?.trim();
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" && /(^|\.)terminland\.(de|eu)$/i.test(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Kasten im Kundenbereich zeigen? Live nur mit Link, in Staging immer (damit man ihn sieht). */
export function showCallBox(): boolean {
  return !!terminlandUrl() || DEMO_MODE_ENABLED;
}
