import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BookingForm } from "@/components/BookingForm";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE, CANDIDATE_STATUS } from "@/lib/enums";
import { SERVICES, serviceCopy, formatPrice, BOOKING_STATUS } from "@/lib/services";
import { getStripe } from "@/lib/stripe";

export default async function BookServicePage(props: { searchParams: Promise<{ abgebrochen?: string }> }) {
  const sp = await props.searchParams;
  const session = await getSession();
  if (!session.userId) redirect(`/anmelden?next=${encodeURIComponent("/bewerbungsservice/buchen")}`);
  if (session.role !== ROLE.CANDIDATE) redirect("/bewerbungsservice");

  const { locale } = await getT();
  const c = serviceCopy(locale);
  const svc = SERVICES["bewerbung-25"];
  const candidate =
    (await prisma.candidate.findUnique({ where: { userId: session.userId } })) ??
    (await prisma.candidate.create({ data: { userId: session.userId!, status: CANDIDATE_STATUS.REGISTERED } }));

  // Laufende Buchung? Dann nicht doppelt buchen lassen
  const open = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, packageKey: "bewerbung-25", status: { in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-2xl px-6 py-14">
          <Link href="/bewerbungsservice" className="text-sm text-[color:var(--color-brand)]">← {c.badge}</Link>
          <h1 className="mt-3 text-3xl font-bold">{c.bookTitle}</h1>
          <p className="mt-2 text-[color:var(--color-ink-soft)]">{c.bookLead}</p>

          <div className="card mt-6 flex items-center justify-between gap-4">
            <div><div className="font-semibold">{c.summary}</div><div className="text-sm text-[color:var(--color-ink-soft)]">{c.priceNote}</div></div>
            <div className="text-3xl font-bold text-[color:var(--color-brand)]">{formatPrice(svc.priceCents, locale)}</div>
          </div>

          {sp.abgebrochen && <p className="mt-4 rounded bg-amber-50 border border-amber-200 text-amber-800 p-3 text-sm">Die Zahlung wurde abgebrochen. Du kannst es jederzeit erneut versuchen.</p>}

          {open ? (
            <div className="card mt-6">
              <p className="font-semibold">Du hast den Bewerbungs-Service bereits gebucht.</p>
              <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">Stand: {open.applicationsSent} von {open.applicationsGoal} Bewerbungen verschickt.</p>
              <Link href="/profil" className="btn-primary mt-4 inline-flex">{c.toProfile}</Link>
            </div>
          ) : (
            <BookingForm
              copy={{ phone: c.phone, jobs: c.jobs, regions: c.regions, notes: c.notes, terms: c.terms, waiver: c.waiver, consent: c.consent, submit: getStripe() ? c.submit : c.submitNoPay }}
              defaults={{ phone: candidate.whatsappNumber || "", jobs: candidate.desiredJobTitle || "", regions: "" }}
            />
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
