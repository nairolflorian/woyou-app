import "server-only";

// Monatsreport Woyou (Weg 1): Registrierungen, Startpakete, Mappen. Verlängerung/Abo gibt es nicht mehr (23.10.2026).
// Bewerbungen und Antworten zählen wir nicht mehr: die verschicken Kund:innen selbst.
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { SERVICES } from "@/lib/services";

export type MonthRow = {
  month: string; registrations: number;
  bookings: number; bookingsPaid: number; serviceRevenueCents: number; mappenSubmitted: number;
  conversionPct: number | null;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function monthlyReport(months = 6): Promise<MonthRow[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const [users, bookings, profiles] = await Promise.all([
    prisma.user.findMany({ where: { role: ROLE.CANDIDATE, createdAt: { gte: start }, deletedAt: null }, select: { createdAt: true } }),
    prisma.serviceBooking.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, paidAt: true, amountCents: true } }),
    prisma.applicationProfile.findMany({ where: { submittedAt: { gte: start } }, select: { submittedAt: true } }),
  ]);
  const rows: MonthRow[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const k = monthKey(d);
    const inM = (x: Date | null | undefined) => !!x && monthKey(x) === k;
    const reg = users.filter((u) => inM(u.createdAt)).length;
    const bk = bookings.filter((b) => inM(b.createdAt));
    const paid = bookings.filter((b) => inM(b.paidAt));
    rows.push({
      month: k,
      registrations: reg,
      bookings: bk.length,
      bookingsPaid: paid.length,
      serviceRevenueCents: paid.reduce((s, b) => s + b.amountCents, 0),
      mappenSubmitted: profiles.filter((p) => inM(p.submittedAt)).length,
      conversionPct: reg ? Math.round((bk.length / reg) * 1000) / 10 : null,
    });
  }
  return rows.reverse();
}

export const SERVICE_PRICE = SERVICES.startpaket.priceCents;
