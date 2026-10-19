import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { SERVICES, BOOKING_STATUS } from "@/lib/services";
import { startCheckout, bookingMails, ensureTask } from "@/lib/bookings";
import { crmMelden } from "@/lib/crm-sync";

const Body = z.object({
  packageKey: z.literal("bewerbung-25"),
  contactPhone: z.string().trim().min(5).max(40),
  targetJobs: z.string().trim().min(2).max(200),
  targetRegions: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
  acceptTerms: z.literal(true),
  acceptWaiver: z.literal(true),
  acceptConsent: z.literal(true),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return NextResponse.json({ error: "Bitte melde dich zuerst an." }, { status: 401 });
  const rl = rateLimit("booking", clientIp(req), 10, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Zu viele Versuche. Bitte später erneut." }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Bitte alle Pflichtfelder ausfüllen und alle Häkchen setzen." }, { status: 400 });
  const d = parsed.data;

  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId } });
  if (!candidate) return NextResponse.json({ error: "Bitte lege zuerst dein Profil an." }, { status: 404 });

  const existing = await prisma.serviceBooking.findFirst({
    where: { candidateId: candidate.id, packageKey: d.packageKey, status: { in: [BOOKING_STATUS.REQUESTED, BOOKING_STATUS.PAID, BOOKING_STATUS.IN_PROGRESS] } },
  });
  if (existing) return NextResponse.json({ error: "Du hast diesen Service bereits gebucht." }, { status: 409 });

  // Offene, nie bezahlte Checkout-Versuche aufräumen, damit es nur eine aktive Buchung gibt
  await prisma.serviceBooking.updateMany({ where: { candidateId: candidate.id, status: BOOKING_STATUS.PENDING_PAYMENT }, data: { status: BOOKING_STATUS.CANCELLED } });

  const now = new Date();
  const booking = await prisma.serviceBooking.create({
    data: {
      candidateId: candidate.id,
      packageKey: d.packageKey,
      amountCents: SERVICES[d.packageKey].priceCents,
      applicationsGoal: SERVICES[d.packageKey].applications,
      contactPhone: d.contactPhone,
      targetJobs: d.targetJobs,
      targetRegions: d.targetRegions || null,
      notes: d.notes || null,
      acceptedTermsAt: now,
      waiverAcceptedAt: now,
      consentSendAt: now,
      status: BOOKING_STATUS.REQUESTED,
    },
  });
  crmMelden("gebucht", candidate.id, { paket: booking.packageKey });

  const url = await startCheckout(booking.id, new URL(req.url).origin);
  if (url) return NextResponse.json({ ok: true, url });

  // Noch kein Stripe-Konto: Buchung bleibt "angefragt", Kunde und Team bekommen eine Mail
  await bookingMails(booking.id, "requested");
  await ensureTask(candidate.id, "CONTACT", `Erstgespräch Bewerbungs-Service: ${[candidate.firstName, candidate.lastName].filter(Boolean).join(" ")}`, `Angefragt (noch ohne Zahlung). Telefon/WhatsApp: ${d.contactPhone}. Berufe: ${d.targetJobs}. Buchung: /admin/buchungen/${booking.id}`);
  return NextResponse.json({ ok: true, url: `/bewerbungsservice/danke?id=${booking.id}` });
}
