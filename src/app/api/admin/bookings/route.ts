import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { grantStartCredits } from "@/lib/credits";
import { markBookingPaid } from "@/lib/bookings";
import { BOOKING_STATUS } from "@/lib/services";

const Body = z.object({
  id: z.string().min(1),
  status: z.enum(Object.values(BOOKING_STATUS) as [string, ...string[]]).optional(),
  applicationsSent: z.number().int().min(0).max(500).optional(),
  adminNote: z.string().max(2000).optional(),
});

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session.userId || !isStaff(session.role)) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Ungültige Eingabe" }, { status: 400 });
  const { id, ...data } = parsed.data;
  const before = await prisma.serviceBooking.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
  // "Bezahlt" von Hand setzen (z. B. Überweisung) setzt auch das Zahlungsdatum
  // „Bezahlt“ von Hand (z. B. Überweisung): wie eine Stripe-Zahlung behandeln (Guthaben, Bestätigungsmail, Aufgabe Erstgespräch)
  const markPaid = data.status === BOOKING_STATUS.PAID && !before.paidAt;
  if (markPaid) await markBookingPaid(id);
  const after = await prisma.serviceBooking.update({ where: { id }, data });
  if (after.paidAt) await grantStartCredits(id);
  await audit(req, "BOOKING_UPDATE", { candidateId: before.candidateId }, { bookingId: id, from: { status: before.status, sent: before.applicationsSent }, to: { status: after.status, sent: after.applicationsSent } });
  return NextResponse.json({ ok: true, booking: after });
}
