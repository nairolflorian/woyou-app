import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { serviceCopy } from "@/lib/services";
import { markBookingPaid } from "@/lib/bookings";
import { paymentTestMode } from "@/lib/werkzeug";

export const dynamic = "force-dynamic";

export default async function BookingThanksPage(props: { searchParams: Promise<{ session_id?: string; id?: string; test?: string }> }) {
  const sp = await props.searchParams;
  const session = await getSession();
  if (!session.userId) redirect("/anmelden");
  const { locale } = await getT();
  const c = serviceCopy(locale);
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!candidate) redirect("/profil");

  let paid = false;
  // Rückkehr von Stripe: Zahlung serverseitig prüfen (zusätzlich zum Webhook)
  if (sp.session_id) {
    const booking = await prisma.serviceBooking.findUnique({ where: { stripeSessionId: sp.session_id } });
    const stripe = getStripe();
    if (booking && booking.candidateId === candidate.id && stripe) {
      if (booking.paidAt) paid = true;
      else {
        const cs = await stripe.checkout.sessions.retrieve(sp.session_id).catch(() => null);
        if (cs?.payment_status === "paid" && cs.metadata?.bookingId === booking.id) { await markBookingPaid(booking.id, cs.id); paid = true; }
      }
    }
  }
  // Lokaler Testmodus ohne Stripe (PAYMENT_TEST_MODE=on, nur next dev): Zahlung gilt als erfolgt
  if (sp.test && paymentTestMode()) {
    const booking = await prisma.serviceBooking.findUnique({ where: { id: sp.test } });
    if (booking && booking.candidateId === candidate.id) { await markBookingPaid(booking.id); paid = true; }
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="text-6xl" aria-hidden>{paid ? "🎉" : "📨"}</div>
          <h1 className="mt-4 text-3xl font-bold">{c.thanksTitle}</h1>
          <p className="mt-3 text-[color:var(--color-ink-soft)]">{paid ? c.thanksPaid : c.thanksRequested}</p>
          <p className="mt-6 text-[color:var(--color-ink-soft)]">{c.thanksMappe}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/bewerbungsmappe" className="btn-primary">{c.toMappe}</Link>
            <Link href="/profil" className="btn-outline">{c.toProfile}</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
