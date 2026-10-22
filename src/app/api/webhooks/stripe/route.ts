import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markBookingPaid } from "@/lib/bookings";
import { markPurchasePaid, extendSubscription, endSubscription } from "@/lib/credits";
import { markToolPurchasePaid, extendToolSubscription, endToolSubscription } from "@/lib/werkzeug";

// Stripe-Webhook. In Stripe als Endpunkt eintragen: https://<domain>/api/webhooks/stripe
// Events: checkout.session.completed, invoice.paid, customer.subscription.deleted
// Signing-Secret als STRIPE_WEBHOOK_SECRET setzen.
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const sig = req.headers.get("stripe-signature");
  const raw = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig ?? "", secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const cs = event.data.object;
    // Startpaket
    if (cs.metadata?.kind === "service_booking" && cs.metadata.bookingId && cs.payment_status === "paid") {
      await markBookingPaid(cs.metadata.bookingId, cs.id);
    }
    const subId = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id;
    // Weg 1: Verlängerung des Werkzeugs (Zahlung) oder Monatsabo (ggf. mit Probezeit bis Ende des bezahlten Zeitraums)
    if (cs.metadata?.kind === "tool_purchase" && cs.metadata.purchaseId && (cs.payment_status === "paid" || cs.mode === "subscription")) {
      let periodEnd: Date | undefined, trialing = false;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        trialing = sub.status === "trialing";
        const end = trialing ? sub.trial_end : sub.items.data[0]?.current_period_end;
        if (end) periodEnd = new Date(end * 1000);
      }
      await markToolPurchasePaid(cs.metadata.purchaseId, { sessionId: cs.id, subscriptionId: subId, periodEnd, trialing });
    }
    // ALT (vor Weg 1): Nachkauf/Abo für Bewerbungsguthaben aus offenen Sitzungen noch verbuchen
    if (cs.metadata?.kind === "credit_purchase" && cs.metadata.purchaseId && (cs.payment_status === "paid" || cs.mode === "subscription")) {
      let periodEnd: Date | undefined;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const end = sub.items.data[0]?.current_period_end;
        if (end) periodEnd = new Date(end * 1000);
      }
      await markPurchasePaid(cs.metadata.purchaseId, { sessionId: cs.id, subscriptionId: subId, periodEnd });
    }
  }
  // Abo-Rechnung bezahlt: bezahlter Zeitraum gilt bis Periodenende
  if (event.type === "invoice.paid") {
    const inv = event.data.object;
    const subId = (inv as unknown as { subscription?: string | null }).subscription ?? inv.parent?.subscription_details?.subscription;
    const end = inv.lines.data[0]?.period?.end;
    if (typeof subId === "string" && end) {
      const handled = await extendToolSubscription(subId, new Date(end * 1000), inv.amount_paid ?? 0);
      if (!handled) await extendSubscription(subId, new Date(end * 1000));
    }
  }
  if (event.type === "customer.subscription.deleted") {
    await endToolSubscription(event.data.object.id);
    await endSubscription(event.data.object.id);
  }
  return NextResponse.json({ received: true });
}
