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
import { CreditShop } from "@/components/CreditShop";
import { creditState } from "@/lib/credits";
import { CREDIT_PRODUCTS } from "@/lib/services";
import { getStripe } from "@/lib/stripe";

const OFFER_STATUS: Record<string, [string, string]> = {
  SUGGESTED: ["Vorschlag", "bg-slate-100 text-slate-700"], SELECTED: ["wird vorbereitet", "bg-amber-100 text-amber-800"], READY: ["freigegeben", "bg-blue-100 text-blue-800"],
  SENT: ["beworben", "bg-emerald-100 text-emerald-800"], APPLIED_MANUALLY: ["beworben", "bg-emerald-100 text-emerald-800"],
};

// Mein Bereich: Stand der Buchung, Bewerbungsmappe, Unterlagen, Konto
export default async function CandidateDashboardPage(props: { searchParams: Promise<{ kauf?: string }> }) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) redirect("/anmelden");
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId! }, include: { user: true } });
  if (!candidate) redirect("/bewerbungsservice/buchen");

  const { t, locale } = await getT();
  const sc = serviceCopy(locale);
  const booking = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, status: { not: "CANCELLED" } },
    orderBy: { createdAt: "desc" },
    include: { leads: { where: { status: { in: Object.keys(OFFER_STATUS) } }, orderBy: [{ sentAt: { sort: "desc", nulls: "last" } }, { score: { sort: "desc", nulls: "last" } }], take: 80, select: { id: true, title: true, company: true, city: true, sentAt: true, status: true, url: true, response: true, email: true, applyUrl: true } } },
  });
  // Verschickte und freigegebene zuerst, dann in Vorbereitung, dann Vorschläge
  const rank: Record<string, number> = { SENT: 0, APPLIED_MANUALLY: 0, READY: 1, SELECTED: 2, SUGGESTED: 3 };
  booking?.leads.sort((x, y) => (rank[x.status] ?? 9) - (rank[y.status] ?? 9));
  const credits = await creditState(candidate.id);
  const sub = await prisma.creditPurchase.findFirst({ where: { candidateId: candidate.id, kind: "SUBSCRIPTION", status: { in: ["ACTIVE", "CANCELLING"] } }, orderBy: { createdAt: "desc" } });
  const sp = await props.searchParams;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <h1 className="text-2xl md:text-3xl font-bold">{t("dash.hello", { name: candidate.firstName ?? "👋" })}</h1>
          <p className="text-sm text-[color:var(--color-ink-soft)]">{candidate.user.email ?? candidate.user.phone}</p>

          {sp.kauf === "ok" && <div className="mt-6 card bg-emerald-50 border-emerald-200 text-sm text-emerald-900">Danke für deinen Kauf! Sobald die Zahlung bestätigt ist, ist dein Guthaben freigeschaltet.</div>}
          {sp.kauf === "abgebrochen" && <div className="mt-6 card bg-amber-50 border-amber-200 text-sm text-amber-900">Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.</div>}
          {booking ? (
            <>
            <div className="mt-8 card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">{sc.summary}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_LABEL[booking.status as BookingStatus]?.color ?? ""}`}>{BOOKING_STATUS_LABEL[booking.status as BookingStatus]?.de ?? booking.status}</span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-[color:var(--color-surface)] p-4">
                  <div className="text-xs text-[color:var(--color-ink-soft)]">Verschickte Bewerbungen</div>
                  <div className="text-2xl font-bold">{booking.applicationsSent}</div>
                </div>
                <div className="rounded-xl bg-[color:var(--color-surface)] p-4">
                  <div className="text-xs text-[color:var(--color-ink-soft)]">Noch übrig</div>
                  <div className="text-2xl font-bold">{credits.unlimited ? "unbegrenzt" : credits.balance}</div>
                  {credits.unlimited && credits.until && <div className="text-xs text-[color:var(--color-ink-soft)]">Abo bezahlt bis {credits.until.toLocaleDateString("de-DE")}</div>}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/bewerbungsmappe" className="btn-outline">Meine Bewerbungsmappe</Link>
              </div>
              {booking.paidAt && (
                <div className="mt-6 border-t border-[color:var(--color-border)] pt-4">
                  <h3 className="font-semibold text-sm">Mehr Bewerbungen</h3>
                  <p className="text-xs text-[color:var(--color-ink-soft)] mb-3">25 weitere einmalig oder unbegrenzt im Abo, jederzeit zum Monatsende kündbar.</p>
                  <CreditShop unlimited={credits.unlimited} until={credits.until?.toLocaleDateString("de-DE") ?? null} cancelling={sub?.status === "CANCELLING"} packPrice={formatPrice(CREDIT_PRODUCTS.PACK_25.priceCents, locale)} aboPrice={formatPrice(CREDIT_PRODUCTS.SUBSCRIPTION.priceCents, locale)} stripe={!!getStripe()} />
                </div>
              )}
            </div>
            <div className="mt-8 card">
              <h2 className="text-xl font-bold">Deine Stellenangebote</h2>
              <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">Diese Stellen haben wir für dich gefunden. Unser Team prüft sie, gibt die passenden frei und bewirbt dich per E-Mail. Antworten der Firmen bekommst du direkt.</p>
              {booking.leads.length === 0 ? <p className="mt-4 text-sm text-[color:var(--color-ink-soft)]">Sobald deine Mappe freigegeben ist, erscheinen hier passende Stellen.</p> : (
                <ul className="mt-4 divide-y divide-[color:var(--color-border)] text-sm">
                  {booking.leads.map((l) => { const [lbl, col] = OFFER_STATUS[l.status] ?? [l.status, ""]; return (
                    <li key={l.id} className="py-3 flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {l.url ? <a href={l.url} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-brand)]">{l.title}</a> : <strong>{l.title}</strong>}
                        <div className="text-[color:var(--color-ink-soft)]">{l.company}{l.city ? `, ${l.city}` : ""}</div>
                        {!l.email && l.applyUrl && <div className="text-xs text-[color:var(--color-ink-soft)]">Bewerbung über die Seite des Arbeitgebers</div>}
                        {l.response && <div className="mt-1 text-xs">Antwort: {l.response}</div>}
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${col}`}>{lbl}{l.sentAt ? ` · ${l.sentAt.toLocaleDateString("de-DE")}` : ""}</span>
                    </li>
                  ); })}
                </ul>
              )}
            </div>
            </>
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
