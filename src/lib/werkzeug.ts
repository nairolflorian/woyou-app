import "server-only";

// Weg 1: Zugang zum Bewerbungswerkzeug (Stellensuche, Anschreiben je Stelle, Tracker).
// Nur das Startpaket schaltet das Werkzeug frei (ANGEBOT.startpaket.toolMonths). Keine Verlängerung, kein Abo
// (Entscheidung 23.10.2026). Nach Ablauf: Suche und Tracker gesperrt, Unterlagen bleiben herunterladbar.
//
// Zahlung des Startpakets: siehe src/lib/bookings.ts.
//   - lokal zum Ausprobieren: PAYMENT_TEST_MODE=on (nur mit `next dev`, nie in Produktion) überspringt die Zahlung
//
// ALT: frühere Verlängerungen/Abos (CreditPurchase mit kind TOOL_MONTH/TOOL_SUBSCRIPTION) werden nicht mehr
// angelegt. Die Funktionen unten verbuchen nur noch Altdaten bzw. Stripe-Ereignisse dazu (Sicherheit).
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { extendUntil, toolState, isLegacyToolKind } from "@/lib/angebot";

/** Testmodus ohne Zahlung: nur lokal mit `next dev` und PAYMENT_TEST_MODE=on */
export const paymentTestMode = () => process.env.PAYMENT_TEST_MODE === "on" && process.env.NODE_ENV !== "production";

export async function toolAccess(candidateId: string) {
  const [c, sub, paid] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: candidateId }, select: { toolAccessUntil: true } }),
    prisma.creditPurchase.findFirst({ where: { candidateId, kind: "TOOL_SUBSCRIPTION", status: { in: ["ACTIVE", "CANCELLING"] } }, orderBy: { createdAt: "desc" } }),
    prisma.serviceBooking.findFirst({ where: { candidateId, paidAt: { not: null }, status: { not: "CANCELLED" } }, select: { id: true } }),
  ]);
  return { ...toolState(c?.toolAccessUntil), subscription: sub ? { id: sub.id, status: sub.status as "ACTIVE" | "CANCELLING" } : null, hasPackage: !!paid };
}

/** Werkzeug für n Monate freischalten (hinten anhängen, wenn es noch läuft) */
export async function grantToolMonths(candidateId: string, months: number) {
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, select: { toolAccessUntil: true } });
  const until = extendUntil(c.toolAccessUntil, months);
  await prisma.candidate.update({ where: { id: candidateId }, data: { toolAccessUntil: until } });
  return until;
}

/** Werkzeug mindestens bis zu einem Datum (auch für die Demo-Konten, siehe src/lib/demo-setup.ts) */
export async function accessAtLeast(candidateId: string, until: Date) {
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, select: { toolAccessUntil: true } });
  if (!c.toolAccessUntil || c.toolAccessUntil < until) await prisma.candidate.update({ where: { id: candidateId }, data: { toolAccessUntil: until } });
}

/** ALT: frühere Verlängerung/Abo als bezahlt verbuchen (Admin oder Stripe-Webhook). Idempotent, ohne Mails. */
export async function markToolPurchasePaid(purchaseId: string, opts: { sessionId?: string; subscriptionId?: string; periodEnd?: Date; trialing?: boolean } = {}) {
  const p = await prisma.creditPurchase.findUnique({ where: { id: purchaseId } });
  if (!p || !isLegacyToolKind(p.kind) || ["PAID", "ACTIVE", "CANCELLING", "ENDED"].includes(p.status)) return false;
  const now = new Date();
  if (p.kind === "TOOL_MONTH") {
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "PAID", paidAt: now, stripeSessionId: opts.sessionId ?? p.stripeSessionId } });
    await grantToolMonths(p.candidateId, p.months ?? 1);
  } else {
    const until = opts.periodEnd ?? extendUntil((await prisma.candidate.findUnique({ where: { id: p.candidateId } }))?.toolAccessUntil, p.months ?? 1, now);
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "ACTIVE", paidAt: opts.trialing ? null : now, periodEnd: until, stripeSessionId: opts.sessionId ?? p.stripeSessionId, stripeSubscriptionId: opts.subscriptionId ?? p.stripeSubscriptionId } });
    await accessAtLeast(p.candidateId, until);
  }
  console.warn(`[werkzeug] Altkauf ${p.kind} ${p.id} verbucht (Verlängerung/Abo werden nicht mehr angeboten)`);
  return true;
}

/** ALT: Stripe meldet eine bezahlte Abo-Rechnung zu einem früheren Abo. Zugang bis Periodenende. */
export async function extendToolSubscription(subscriptionId: string, periodEnd: Date, amountPaidCents: number) {
  const p = await prisma.creditPurchase.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!p || !isLegacyToolKind(p.kind)) return false;
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { periodEnd, paidAt: p.paidAt ?? (amountPaidCents > 0 ? new Date() : null), status: p.status === "CANCELLING" ? "CANCELLING" : "ACTIVE" } });
  await accessAtLeast(p.candidateId, periodEnd);
  return true;
}

export async function endToolSubscription(subscriptionId: string) {
  await prisma.creditPurchase.updateMany({ where: { stripeSubscriptionId: subscriptionId, kind: "TOOL_SUBSCRIPTION" }, data: { status: "ENDED" } });
}

/** Für die Werkzeug-Routen: angemeldete Kundin bzw. angemeldeter Kunde mit Zugangsstand (sonst null) */
export async function toolSession() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return null;
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId }, include: { user: true } });
  if (!candidate) return null;
  return { candidate, access: await toolAccess(candidate.id) };
}
