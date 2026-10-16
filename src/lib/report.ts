import "server-only";

// Monatsreport Woyou: Registrierungen, Freischaltungen, Bewerbungs-Service (Buchungen, Umsatz, Bewerbungen, Antworten)
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { SERVICES } from "@/lib/services";

export type MonthRow = {
  month: string; registrations: number; profileUnlocks: number; unlockRevenueCents: number;
  bookings: number; bookingsPaid: number; serviceRevenueCents: number; mappenSubmitted: number;
  applicationsSent: number; replies: number; conversionPct: number | null;
};

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export async function monthlyReport(months = 6): Promise<MonthRow[]> {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const [users, unlocks, bookings, profiles, leads] = await Promise.all([
    prisma.user.findMany({ where: { role: ROLE.CANDIDATE, createdAt: { gte: start }, deletedAt: null }, select: { createdAt: true } }),
    prisma.candidate.findMany({ where: { paidAt: { gte: start } }, select: { paidAt: true, stripeSessionId: true } }),
    prisma.serviceBooking.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, paidAt: true, amountCents: true } }),
    prisma.applicationProfile.findMany({ where: { submittedAt: { gte: start } }, select: { submittedAt: true } }),
    prisma.jobLead.findMany({ where: { OR: [{ sentAt: { gte: start } }, { respondedAt: { gte: start } }] }, select: { sentAt: true, respondedAt: true, status: true } }),
  ]);
  const { profileFeeCents } = (await import("@/lib/config")).APP_CONFIG;
  const rows: MonthRow[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const k = monthKey(d);
    const inM = (x: Date | null | undefined) => !!x && monthKey(x) === k;
    const reg = users.filter((u) => inM(u.createdAt)).length;
    // Demo-Zahlungen (ohne Stripe) zählen nicht als Umsatz
    const unl = unlocks.filter((c) => inM(c.paidAt));
    const realUnl = unl.filter((c) => !c.stripeSessionId?.startsWith("DEMO_"));
    const bk = bookings.filter((b) => inM(b.createdAt));
    const paid = bookings.filter((b) => inM(b.paidAt));
    rows.push({
      month: k,
      registrations: reg,
      profileUnlocks: unl.length,
      unlockRevenueCents: realUnl.length * profileFeeCents,
      bookings: bk.length,
      bookingsPaid: paid.length,
      serviceRevenueCents: paid.reduce((s, b) => s + b.amountCents, 0),
      mappenSubmitted: profiles.filter((p) => inM(p.submittedAt)).length,
      applicationsSent: leads.filter((l) => inM(l.sentAt) && (l.status === "SENT" || l.status === "APPLIED_MANUALLY")).length,
      replies: leads.filter((l) => inM(l.respondedAt)).length,
      conversionPct: reg ? Math.round((bk.length / reg) * 1000) / 10 : null,
    });
  }
  return rows.reverse();
}

export const SERVICE_PRICE = SERVICES["bewerbung-25"].priceCents;
