import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  const { sessionId } = await req.json().catch(() => ({}));
  if (!sessionId) {
    return NextResponse.json({ error: "MISSING_SESSION" }, { status: 400 });
  }
  const candidate = await prisma.candidate.findUnique({
    where: { userId: session.userId },
  });
  if (!candidate) {
    return NextResponse.json({ error: "NO_CANDIDATE" }, { status: 404 });
  }
  if (candidate.paidAt) return NextResponse.json({ ok: true });

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 500 });
  }

  const checkout = await stripe.checkout.sessions.retrieve(sessionId);
  if (checkout.payment_status !== "paid") {
    return NextResponse.json({ error: "NOT_PAID" }, { status: 400 });
  }
  await prisma.candidate.update({
    where: { id: candidate.id },
    data: {
      paidAt: new Date(),
      stripeSessionId: checkout.id,
      status: CANDIDATE_STATUS.PAID_PLACEABLE,
    },
  });
  return NextResponse.json({ ok: true });
}
