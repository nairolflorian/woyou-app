import "server-only";

import Stripe from "stripe";
import { stripeKeyMode as keyMode, stripeKeyAllowed, type StripeKeyMode } from "@/lib/stripe-mode";

// Stripe nur für das Startpaket (Einmalzahlung). Verlängerung und Abo gibt es seit 23.10.2026 nicht mehr.
//
// Schutz im DEMO_MODE: Solange DEMO_MODE nicht "false" ist, wird NUR ein Test-Schlüssel (sk_test_… / rk_test_…)
// verwendet. Steht dort ein Live-Schlüssel (sk_live_… / rk_live_…) oder etwas anderes, bleibt Stripe aus:
// getStripe() liefert null, es startet nie ein echter Checkout, Buchungen bleiben „angefragt“ (ohne Zahlung),
// und der Webhook antwortet mit 503. Echte Zahlungen erst mit DEMO_MODE=false.

export type { StripeKeyMode };

/** Art des hinterlegten geheimen Schlüssels (ohne den Schlüssel selbst preiszugeben) */
export const stripeKeyMode = (): StripeKeyMode => keyMode(process.env.STRIPE_SECRET_KEY);

/** true, wenn ein Schlüssel hinterlegt ist, er aber wegen DEMO_MODE nicht benutzt wird (für Hinweise im Admin) */
export const stripeBlockedByDemo = () => !!process.env.STRIPE_SECRET_KEY && !stripeKeyAllowed(process.env.STRIPE_SECRET_KEY, process.env.DEMO_MODE);

let _stripe: Stripe | null = null;
let warned = false;
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (stripeBlockedByDemo()) {
    if (!warned) { warned = true; console.warn("[stripe] DEMO_MODE ist an: Nicht-Test-Schlüssel wird ignoriert, es gibt keine echten Zahlungen. Für echte Zahlungen DEMO_MODE=false setzen."); }
    return null;
  }
  _stripe = new Stripe(key);
  return _stripe;
}
