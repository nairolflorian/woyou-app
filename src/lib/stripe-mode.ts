// Welche Stripe-Schlüssel dürfen benutzt werden? (ohne Importe, damit Tests es direkt prüfen können)
// Im DEMO_MODE (DEMO_MODE ungleich "false") NUR Test-Schlüssel: nie ein Live-Checkout in der Demo.

export type StripeKeyMode = "none" | "test" | "live" | "unknown";

/** Art des geheimen Schlüssels, ohne ihn preiszugeben */
export function stripeKeyMode(key?: string | null): StripeKeyMode {
  if (!key) return "none";
  if (/^(sk|rk)_test_/.test(key)) return "test";
  if (/^(sk|rk)_live_/.test(key)) return "live";
  return "unknown";
}

export const isDemoMode = (demoEnv?: string | null) => demoEnv !== "false";

/** Darf mit diesem Schlüssel ein Checkout starten? Live und Unbekanntes nur, wenn DEMO_MODE=false. */
export function stripeKeyAllowed(key: string | null | undefined, demoEnv: string | null | undefined) {
  const m = stripeKeyMode(key);
  if (m === "none") return false;
  return isDemoMode(demoEnv) ? m === "test" : true;
}
