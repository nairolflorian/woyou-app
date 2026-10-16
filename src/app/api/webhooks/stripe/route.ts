import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { markBookingPaid } from "@/lib/bookings";

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
  }
  return NextResponse.json({ received: true });
}
