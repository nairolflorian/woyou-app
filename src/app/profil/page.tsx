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
import { MyDocuments } from "@/components/MyDocuments";
import { VersandAdresse } from "@/components/VersandAdresse";
import { versandText } from "@/lib/versand-text";
import { toolAccess } from "@/lib/werkzeug";
import { arMonths, srMonths } from "@/lib/werkzeug-text";
import { accountText, fill } from "@/lib/account-text";
import { terminlandUrl, showCallBox, CALL_MINUTES } from "@/lib/termin";

export const dynamic = "force-dynamic";

// Mein Bereich (Weg 1): Startpaket, Stand der Unterlagen, Bewerbungswerkzeug (3 Monate inklusive, keine Verlängerung), Konto
export default async function CandidateDashboardPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) redirect("/anmelden");
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId! }, include: { user: true } });
  if (!candidate) redirect("/bewerbungsservice/buchen");

  const { t, locale } = await getT();
  const sc = serviceCopy(locale);
  const a = accountText(locale);
  const dl = locale === "de" ? "de-DE" : locale === "fr" ? "fr-FR" : locale === "ar" ? "ar-MA" : locale === "hi" ? "hi-IN" : locale === "sr" ? "sr-Latn-RS" : locale === "te" ? "te-IN" : "en-GB";
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
  const months = locale === "ar" ? arMonths(booking?.toolMonths || ANGEBOT.startpaket.toolMonths) : locale === "sr" ? srMonths(booking?.toolMonths || ANGEBOT.startpaket.toolMonths) : String(booking?.toolMonths || ANGEBOT.startpaket.toolMonths);
  const mappeState = (booking?.profile?.status ?? "NONE") as keyof typeof a.mappe;
  // Unterlagen-Check im Call: erst nach der Zahlung (Terminland-Link aus TERMINLAND_URL)
  const paid = !!booking && ["PAID", "IN_PROGRESS", "DONE"].includes(booking.status);
  const callUrl = terminlandUrl();

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl md:text-3xl font-bold">{t("dash.hello", { name: candidate.firstName ?? "👋" })}</h1>
          <p className="text-sm text-[color:var(--color-ink-soft)]">{candidate.user.email ?? candidate.user.phone}</p>

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
                {access.active || !access.until ? (
                  <>
                    <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{access.active ? a.toolLead : a.toolInactiveLead}</p>
                    <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">{fill(a.toolIncluded, { months })}</p>
                  </>
                ) : <p className="mt-2 text-sm rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">{fill(a.toolExpiredLead, { months })}</p>}
                {access.active ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link href="/stellensuche" className="btn-primary">{a.openSearch}</Link>
                    <Link href="/meine-bewerbungen" className="btn-outline">{a.openTracker}</Link>
                    <span className="text-sm text-[color:var(--color-ink-soft)]">{fill(a.counts, { saved, applied })}</span>
                  </div>
                ) : access.until && (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {saved > 0 && <Link href="/meine-bewerbungen" className="btn-outline">{a.myLetters}</Link>}
                    <Link href="/bewerbungsmappe" className="btn-ghost">{a.myMappe}</Link>
                  </div>
                )}
              </div>
              {paid && showCallBox() && (
                <div id="unterlagen-check" className="mt-8 card scroll-mt-20">
                  <h2 className="text-xl font-bold">{a.callTitle}</h2>
                  <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{fill(a.callLead, { min: CALL_MINUTES })}</p>
                  <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">{a.callNote}</p>
                  <div className="mt-4">
                    {callUrl ? (
                      <a href={callUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">{a.callBtn}</a>
                    ) : <p className="text-sm rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">{a.callSoon}</p>}
                  </div>
                </div>
              )}
              <div id="unterlagen" className="mt-8 scroll-mt-20"><MyDocuments locale={locale} /></div>
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

          {booking && (
            <div id="bewerbungsmail" className="mt-8 card scroll-mt-20">
              <h2 className="text-xl font-bold">{versandText(locale).profileHead}</h2>
              <div className="mt-2"><VersandAdresse locale={locale} initial={candidate.applicationEmail} loginEmail={candidate.user.email} /></div>
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
