// Tracking-IDs aus der Server-Umgebung (zur Laufzeit, wie TERMINLAND_URL in src/lib/termin.ts).
// META_PIXEL_ID: nur Ziffern. GOOGLE_TAG_ID: G-XXXX oder AW-XXXX. Ungültige Werte gelten als leer.
// TODO Conversions API (Meta, serverseitig): noch nicht gebaut, siehe MARKETING.md Abschnitt 4.
import "server-only";
import { trackingIdsAus, trackingAn, type TrackingIds } from "@/lib/tracking-core";

export function trackingIds(): TrackingIds {
  return trackingIdsAus(process.env);
}

/** Mindestens eine gültige ID gesetzt: Banner mit Auswahl, Datenschutz-Abschnitt, Link „Cookie-Einstellungen“. */
export function trackingAktiv(): boolean {
  return trackingAn(trackingIds());
}

/** Für die Anzeige im Admin: eingerichtet, nicht eingerichtet oder Wert ungültig. */
export function trackingStatus(): { meta: string; google: string } {
  const ids = trackingIds();
  const zeile = (roh: string | undefined, id: string | null) => (id ? `eingerichtet (${id})` : roh?.trim() ? "Wert ungültig, wird ignoriert" : "nicht eingerichtet");
  return { meta: zeile(process.env.META_PIXEL_ID, ids.meta), google: zeile(process.env.GOOGLE_TAG_ID, ids.google) };
}
