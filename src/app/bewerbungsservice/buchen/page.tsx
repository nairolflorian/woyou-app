import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BookingForm } from "@/components/BookingForm";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { SERVICES, SERVICE_KEYS, CURRENT_SERVICE, serviceCopy, formatPrice, BOOKING_STATUS } from "@/lib/services";
import { getStripe } from "@/lib/stripe";
import { paymentTestMode } from "@/lib/werkzeug";
import { accountText } from "@/lib/account-text";
import { rechtUi } from "@/lib/recht/ui-text";
import { ANGEBOT, MAPPE_FERTIG_WERKTAGE } from "@/lib/angebot";
import { fillIn } from "@/lib/werkzeug-text";

export default async function BookServicePage(props: { searchParams: Promise<{ abgebrochen?: string }> }) {
  const sp = await props.searchParams;
  const session = await getSession();
  if (!session.userId) redirect(`/anmelden?next=${encodeURIComponent("/bewerbungsservice/buchen")}`);
  if (session.role !== ROLE.CANDIDATE) redirect("/bewerbungsservice");

  const { locale } = await getT();
  const c = serviceCopy(locale);
  const a = accountText(locale);
  const svc = SERVICES[CURRENT_SERVICE];
  const ru = rechtUi(locale);
  const submitLabel = getStripe() || paymentTestMode() ? c.submit : c.submitNoPay;
  const months = svc.toolMonths || ANGEBOT.startpaket.toolMonths;
  const candidate =
    (await prisma.candidate.findUnique({ where: { userId: session.userId } })) ??
    (await prisma.candidate.create({ data: { userId: session.userId!, status: CANDIDATE_STATUS.REGISTERED } }));

  // Laufende Buchung (auch ein altes Paket)? Dann nicht doppelt buchen lassen
  const open = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, packageKey: { in: SERVICE_KEYS }, status: { in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <Link href="/" className="text-sm text-[color:var(--color-brand)]">{locale === "ar" ? "→" : "←"} {c.badge}</Link>
          <h1 className="mt-3 text-3xl font-bold">{c.bookTitle}</h1>
          <p className="mt-2 text-[color:var(--color-ink-soft)]">{c.bookLead}</p>

          <div className="card mt-6 flex items-center justify-between gap-4">
            <div><div className="font-semibold">{c.summary}</div><div className="text-sm text-[color:var(--color-ink-soft)]">{c.priceNote}</div></div>
            <div className="text-end"><div className="text-3xl font-bold text-[color:var(--color-brand)]">{formatPrice(svc.priceCents, locale)}</div><div className="text-xs text-[color:var(--color-ink-soft)]">{ru.vat}</div></div>
          </div>
          <p className="mt-3 text-sm text-[color:var(--color-ink-soft)]">{c.lead}</p>

          {/* ANWALT PRÜFEN (26.10.2026): Lieferzeit, Vertragsschluss, Korrektur vor dem Klick, Speicherung, Vertragssprache, Widerrufsbelehrung vorab */}
          <div className="card mt-4 text-sm">
            <h2 className="font-semibold">{ru.notesTitle}</h2>
            <ul className="mt-2 list-disc ps-5 space-y-1 text-[color:var(--color-ink-soft)]">
              <li>{fillIn(ru.noteDelivery, { n: MAPPE_FERTIG_WERKTAGE, months })}</li>
              <li>{fillIn(ru.noteContract, { btn: submitLabel })}</li>
              <li>{ru.noteCheck}</li>
              <li>{ru.noteStored}</li>
              <li>{ru.noteLanguage}</li>
              <li>{ru.noteWiderruf} <Link href="/widerruf" target="_blank" className="underline">{ru.linkWiderruf}</Link></li>
            </ul>
          </div>

          {sp.abgebrochen && <p className="mt-4 rounded bg-amber-50 border border-amber-200 text-amber-800 p-3 text-sm">{a.payAborted}</p>}

          {open ? (
            <div className="card mt-6">
              <p className="font-semibold">{c.alreadyBooked}</p>
              <Link href="/profil" className="btn-primary mt-4 inline-flex">{c.toProfile}</Link>
            </div>
          ) : (
            <BookingForm
              copy={{ phone: c.phone, jobs: c.jobs, regions: c.regions, notes: c.notes, terms: c.terms, waiver: c.waiver, submit: submitLabel, failed: c.failed }}
              defaults={{ phone: candidate.whatsappNumber || "", jobs: candidate.desiredJobTitle || "", regions: "" }}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
