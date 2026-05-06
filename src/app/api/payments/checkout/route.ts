import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { APP_CONFIG } from "@/lib/config";
import { getStripe } from "@/lib/stripe";
import { autoMatchForCandidate } from "@/lib/auto-match";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
    include: { user: true },
  });
  if (!candidate) {
    return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });
  }
  if (candidate.paidAt) {
    return NextResponse.json({ error: "ALREADY_PAID" }, { status: 400 });
  }

  const stripe = getStripe();
  const origin = new URL(req.url).origin;
  if (!stripe) {
    // Demo fallback: skip Stripe — mark paid right away and redirect to success page
    await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        paidAt: new Date(),
        stripeSessionId: `DEMO_${Date.now()}`,
        status: CANDIDATE_STATUS.PAID_PLACEABLE,
      },
    });
    // Fire-and-forget: instant matching against all open job requests.
    await autoMatchForCandidate(candidate.id).catch((err) =>
      console.error("auto-match failed:", err)
    );
    return NextResponse.json({
      ok: true,
      demoMode: true,
      url: `/profil/freigeschaltet?demo=1`,
    });
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: candidate.user.email ?? undefined,
    line_items: [
      {
        price_data: {
          currency: APP_CONFIG.currency,
          product_data: {
            name: "WoYou Profil-Freischaltung",
            description: "Einmalige Aktivierungsgebühr",
          },
          unit_amount: APP_CONFIG.profileFeeCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${origin}/profil/freigeschaltet?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/profil?cancelled=1`,
    metadata: { candidateId: candidate.id },
  });

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { stripeSessionId: checkout.id },
  });

  return NextResponse.json({ ok: true, url: checkout.url });
}
