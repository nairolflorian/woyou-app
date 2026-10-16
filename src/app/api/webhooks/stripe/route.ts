import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markBookingPaid } from "@/lib/bookings";
import { markPurchasePaid, extendSubscription, endSubscription } from "@/lib/credits";

// Stripe-Webhook (Event: checkout.session.completed). In Stripe als Endpunkt eintragen:
//   https://<domain>/api/webhooks/stripe   und das Signing-Secret als STRIPE_WEBHOOK_SECRET setzen.
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
    if (cs.metadata?.kind === "service_booking" && cs.metadata.bookingId && cs.payment_status === "paid") {
      await markBookingPaid(cs.metadata.bookingId, cs.id);
    }
    // Nachkauf (Zahlung) oder Abo (erste Periode)
    if (cs.metadata?.kind === "credit_purchase" && cs.metadata.purchaseId && (cs.payment_status === "paid" || cs.mode === "subscription")) {
      let periodEnd: Date | undefined;
      const subId = typeof cs.subscription === "string" ? cs.subscription : cs.subscription?.id;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const end = sub.items.data[0]?.current_period_end;
        if (end) periodEnd = new Date(end * 1000);
      }
      await markPurchasePaid(cs.metadata.purchaseId, { sessionId: cs.id, subscriptionId: subId, periodEnd });
    }
  }
  // Abo verlängert: bezahlter Zeitraum gilt bis Periodenende
  if (event.type === "invoice.paid") {
    const inv = event.data.object;
    const subId = (inv as unknown as { subscription?: string | null }).subscription ?? inv.parent?.subscription_details?.subscription;
    const end = inv.lines.data[0]?.period?.end;
    if (typeof subId === "string" && end) await extendSubscription(subId, new Date(end * 1000));
  }
  if (event.type === "customer.subscription.deleted") await endSubscription(event.data.object.id);
  return NextResponse.json({ received: true });
}
