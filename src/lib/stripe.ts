import "server-only";

import Stripe from "stripe";
import { stripeKeyMode as keyMode, stripeKeyAllowed, allowedKeyMode, type StripeKeyMode } from "@/lib/stripe-mode";

// Stripe nur für das Startpaket (Einmalzahlung). Verlängerung und Abo gibt es seit 23.10.2026 nicht mehr.
//
// Schutz je Umgebung (src/lib/stripe-mode.ts): Staging (DEMO_MODE ungleich "false") nimmt NUR Test-Schlüssel,
// Produktion (DEMO_MODE=false) NUR Live-Schlüssel. Passt der Schlüssel nicht, bleibt Stripe aus: getStripe()
// liefert null, es startet kein Checkout, Buchungen bleiben „angefragt“ (ohne Zahlung), der Webhook antwortet 503.

export type { StripeKeyMode };

/** Art des hinterlegten geheimen Schlüssels (ohne den Schlüssel selbst preiszugeben) */
export const stripeKeyMode = (): StripeKeyMode => keyMode(process.env.STRIPE_SECRET_KEY);

/** Erwarteter Modus in dieser Umgebung ("test" in Staging, "live" in Produktion) */
export const stripeExpectedMode = () => allowedKeyMode(process.env.DEMO_MODE);

/** true, wenn ein Schlüssel hinterlegt ist, er aber nicht zur Umgebung passt (für Hinweise im Admin) */
export const stripeBlocked = () => !!process.env.STRIPE_SECRET_KEY && !stripeKeyAllowed(process.env.STRIPE_SECRET_KEY, process.env.DEMO_MODE);

let _stripe: Stripe | null = null;
let warned = false;
export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (stripeBlocked()) {
    if (!warned) {
      warned = true;
      console.warn(stripeExpectedMode() === "test"
        ? "[stripe] Staging: nur Test-Schlüssel erlaubt, der hinterlegte Schlüssel wird ignoriert. Es gibt keine Zahlungen."
        : "[stripe] Produktion: nur Live-Schlüssel erlaubt, der hinterlegte Schlüssel wird ignoriert. Es gibt keine Zahlungen.");
    }
    return null;
  }
  _stripe = new Stripe(key);
  return _stripe;
}
