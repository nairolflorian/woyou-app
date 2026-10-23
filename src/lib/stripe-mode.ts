// Welche Stripe-Schlüssel dürfen benutzt werden? (ohne Importe, damit Tests es direkt prüfen können)
//
// Zwei Umgebungen, unterschieden über DEMO_MODE:
//   - Staging (DEMO_MODE ungleich "false", z. B. woyou-app.46.225.109.84.nip.io): NUR Test-Schlüssel
//     (sk_test_/rk_test_). Stripe-Sandkasten, kein echtes Geld. Ein Live-Schlüssel wird ignoriert.
//   - Produktion (DEMO_MODE=false, woyou.de): NUR Live-Schlüssel (sk_live_/rk_live_). Ein Test-Schlüssel wird
//     ignoriert, damit auf der echten Seite nie eine Buchung „bezahlt“ wird, ohne dass Geld fließt.
// Unbekannte Werte sind in beiden Umgebungen gesperrt.

export type StripeKeyMode = "none" | "test" | "live" | "unknown";

/** Art des geheimen Schlüssels, ohne ihn preiszugeben */
export function stripeKeyMode(key?: string | null): StripeKeyMode {
  if (!key) return "none";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  return "unknown";
}

export const isDemoMode = (demoEnv?: string | null) => demoEnv !== "false";

/** Umgebung aus DEMO_MODE: "staging" (Demo-Daten, Sandkasten) oder "prod" (woyou.de, echte Zahlungen) */
export const appEnv = (demoEnv?: string | null): "staging" | "prod" => (isDemoMode(demoEnv) ? "staging" : "prod");

/** Welcher Schlüssel-Modus ist in dieser Umgebung erlaubt? */
export const allowedKeyMode = (demoEnv?: string | null): "test" | "live" => (isDemoMode(demoEnv) ? "test" : "live");

/** Darf mit diesem Schlüssel ein Checkout starten? Staging nur Test, Produktion nur Live. */
export function stripeKeyAllowed(key: string | null | undefined, demoEnv: string | null | undefined) {
  return stripeKeyMode(key) === allowedKeyMode(demoEnv);
}
