import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { getT } from "@/lib/i18n";
import { serviceCopy, BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/services";
import { ANGEBOT, formatPrice } from "@/lib/angebot";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AccountControls } from "@/components/AccountControls";
import { LoginEditForm } from "@/components/LoginEditForm";
import { ToolShop } from "@/components/ToolShop";
import { MyDocuments } from "@/components/MyDocuments";
import { toolAccess, markToolPurchasePaid, paymentTestMode } from "@/lib/werkzeug";
import { getStripe } from "@/lib/stripe";
import { accountText, fill } from "@/lib/account-text";

export const dynamic = "force-dynamic";

// Mein Bereich (Weg 1): Startpaket, Stand der Unterlagen, Bewerbungswerkzeug, Verlängerung, Konto
export default async function CandidateDashboardPage(props: { searchParams: Promise<{ kauf?: string; session_id?: string; test?: string }> }) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) redirect("/anmelden");
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId! }, include: { user: true } });
  if (!candidate) redirect("/bewerbungsservice/buchen");

  const { t, locale } = await getT();
  const sc = serviceCopy(locale);
  const a = accountText(locale);
  const dl = locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : locale === "ar" ? "ar-MA" : locale === "hi" ? "hi-IN" : "en-GB";
  const sp = await props.searchParams;

  // Rückkehr vom Kauf: Stripe-Sitzung prüfen (zusätzlich zum Webhook) bzw. lokaler Testmodus ohne Zahlung
  if (sp.kauf === "ok" && (sp.session_id || sp.test)) {
    const p = await prisma.creditPurchase.findFirst({ where: sp.session_id ? { stripeSessionId: sp.session_id } : { id: sp.test } });
    if (p && p.candidateId === candidate.id) {
      if (sp.test && paymentTestMode()) await markToolPurchasePaid(p.id);
      const stripe = getStripe();
      if (sp.session_id && stripe) {
        const cs = await stripe.checkout.sessions.retrieve(sp.session_id).catch(() => null);
        if (cs && cs.metadata?.purchaseId === p.id && cs.payment_status === "paid" && cs.mode === "payment") await markToolPurchasePaid(p.id, { sessionId: cs.id });
      }
    }
  }

  const booking = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    include: { profile: { select: { status: true } } },
  });
  const access = await toolAccess(candidate.id);
  const [saved, applied] = await Promise.all([
    prisma.savedJob.count({ where: { candidateId: candidate.id } }),
    prisma.savedJob.count({ where: { candidateId: candidate.id, status: { not: "SAVED" } } }),
  ]);
  const untilStr = access.until?.toLocaleDateString(dl) ?? null;
  const mappeState = (booking?.profile?.status ?? "NONE") as keyof typeof a.mappe;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl md:text-3xl font-bold">{t("dash.hello", { name: candidate.firstName ?? "👋" })}</h1>
          <p className="text-sm text-[color:var(--color-ink-soft)]">{candidate.user.email ?? candidate.user.phone}</p>

          {sp.kauf === "ok" && <div className="mt-6 card bg-emerald-50 border-emerald-200 text-sm text-emerald-900">{a.paidThanks}</div>}
          {sp.kauf === "abgebrochen" && <div className="mt-6 card bg-amber-50 border-amber-200 text-sm text-amber-900">{a.payAborted}</div>}
          {booking ? (
            <>
              <div className="mt-8 card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{booking.packageKey === "bewerbung-25" ? a.legacyPackage : a.packageTitle}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_LABEL[booking.status as BookingStatus]?.color ?? ""}`}>{a.booking[booking.status as keyof typeof a.booking] ?? booking.status}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[color:var(--color-surface)] p-4">
                  <div>
                    <div className="text-xs text-[color:var(--color-ink-soft)]">{a.mappeState}</div>
                    <div className="font-semibold">{a.mappe[mappeState]}</div>
                  </div>
                  <Link href="/bewerbungsmappe" className="btn-outline">{a.myMappe}</Link>
                </div>
              </div>

              <div className="mt-8 card">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold">{a.toolTitle}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${access.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                    {access.active ? fill(a.toolActive, { date: untilStr ?? "" }) : access.until ? fill(a.toolExpired, { date: untilStr ?? "" }) : a.toolInactive}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{access.until || access.active ? a.toolLead : a.toolInactiveLead}</p>
                {access.subscription && <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{access.subscription.status === "CANCELLING" ? fill(a.toolAboCancelling, { date: untilStr ?? "" }) : a.toolAbo}</p>}
                {(access.active || saved > 0) && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {access.active && <Link href="/stellensuche" className="btn-primary">{a.openSearch}</Link>}
                    <Link href="/meine-bewerbungen" className="btn-outline">{a.openTracker}</Link>
                    <span className="text-sm text-[color:var(--color-ink-soft)]">{fill(a.counts, { saved, applied })}</span>
                  </div>
                )}
                {booking.paidAt && (
                  <div id="verlaengern" className="mt-6 border-t border-[color:var(--color-border)] pt-4 scroll-mt-20">
                    <h3 className="font-semibold text-sm">{a.extendTitle}</h3>
                    <p className="text-xs text-[color:var(--color-ink-soft)] mb-3">{a.extendLead}</p>
                    <ToolShop abo={access.subscription?.status ?? null} until={untilStr} locale={locale} monthPrice={formatPrice(ANGEBOT.verlaengerung.priceCents, locale)} aboPrice={formatPrice(ANGEBOT.abo.priceCents, locale)} stripe={!!getStripe() || paymentTestMode()} />
                  </div>
                )}
              </div>
              <div className="mt-8"><MyDocuments locale={locale} /></div>
            </>
          ) : (
            <div className="mt-8 card flex flex-wrap items-center justify-between gap-4">
              <div className="max-w-xl">
                <h2 className="font-semibold">{a.noBookingTitle}</h2>
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{sc.lead}</p>
              </div>
              <Link href="/bewerbungsservice/buchen" className="btn-primary">{sc.cta} · {formatPrice(ANGEBOT.startpaket.priceCents, locale)}</Link>
            </div>
          )}

          <div id="dokumente" className="mt-8 card scroll-mt-20">
            <h2 className="text-xl font-bold">{t("dash.documents_h")}</h2>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">{a.docsLead}</p>
            <div className="mt-4"><DocumentUpload candidateId={candidate.id} /></div>
          </div>

          <div className="mt-8 card">
            <h2 className="text-xl font-bold">{t("dash.account_h")}</h2>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1 mb-6">{t("dash.account_desc")}</p>
            <LoginEditForm initialEmail={candidate.user.email} initialPhone={candidate.user.phone} />
            <hr className="my-6 border-[color:var(--color-border)]" />
            <AccountControls />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
