import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { getT } from "@/lib/i18n";
import { serviceCopy, formatPrice, SERVICES, BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/services";
import { DocumentUpload } from "@/components/DocumentUpload";
import { AccountControls } from "@/components/AccountControls";
import { LoginEditForm } from "@/components/LoginEditForm";

// Mein Bereich: Stand der Buchung, Bewerbungsmappe, Unterlagen, Konto
export default async function CandidateDashboardPage() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) redirect("/anmelden");
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId! }, include: { user: true } });
  if (!candidate) redirect("/bewerbungsservice/buchen");

  const { t, locale } = await getT();
  const sc = serviceCopy(locale);
  const booking = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    include: { leads: { where: { status: { in: ["SENT", "APPLIED_MANUALLY"] } }, orderBy: { sentAt: "desc" }, select: { id: true, title: true, company: true, city: true, sentAt: true, status: true } } },
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl md:text-3xl font-bold">{t("dash.hello", { name: candidate.firstName ?? "👋" })}</h1>
          <p className="text-sm text-[color:var(--color-ink-soft)]">{candidate.user.email ?? candidate.user.phone}</p>

          {booking ? (
            <div className="mt-8 card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{sc.summary}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_LABEL[booking.status as BookingStatus]?.color ?? ""}`}>{BOOKING_STATUS_LABEL[booking.status as BookingStatus]?.de ?? booking.status}</span>
              </div>
              <div className="mt-3 text-sm">{booking.applicationsSent} / {booking.applicationsGoal}</div>
              <div className="mt-1 h-2 rounded bg-slate-100 overflow-hidden"><div className="h-full bg-[color:var(--color-brand)]" style={{ width: `${Math.min(100, Math.round((booking.applicationsSent / booking.applicationsGoal) * 100))}%` }} /></div>
              <Link href="/bewerbungsmappe" className="btn-primary mt-4 inline-flex">Meine Bewerbungsmappe</Link>
              {booking.leads.length > 0 && (
                <ul className="mt-6 divide-y divide-[color:var(--color-border)] text-sm">
                  {booking.leads.map((l) => (
                    <li key={l.id} className="py-2 flex flex-wrap justify-between gap-2">
                      <span><strong>{l.title}</strong> · {l.company}{l.city ? `, ${l.city}` : ""}</span>
                      <span className="text-[color:var(--color-ink-soft)]">{l.sentAt ? l.sentAt.toLocaleDateString("de-DE") : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <div className="mt-8 card flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">{sc.title}</h2>
                <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{sc.lead}</p>
              </div>
              <Link href="/bewerbungsservice/buchen" className="btn-primary">{sc.cta} · {formatPrice(SERVICES["bewerbung-25"].priceCents, locale)}</Link>
            </div>
          )}

          <div id="dokumente" className="mt-8 card scroll-mt-20">
            <h2 className="text-xl font-bold">{t("dash.documents_h")}</h2>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">Zeugnisse, Nachweise und Zertifikate. Wir legen sie deinen Bewerbungen bei, wenn sie passen.</p>
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
