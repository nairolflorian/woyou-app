import "server-only";

// Weg 1: Zugang zum Bewerbungswerkzeug (Stellensuche, Anschreiben je Stelle, Tracker).
// Startpaket schaltet ANGEBOT.startpaket.toolMonths frei. Danach: Verlängerung je Monat (Einmalzahlung) oder
// Monatsabo (Stripe-Abo, beginnt erst, wenn der bezahlte Zeitraum endet). Kein Guthaben je Bewerbung.
//
// Zahlung:
//   - mit STRIPE_SECRET_KEY: Stripe-Checkout, Bestätigung über Webhook und Rückkehrseite
//   - ohne Stripe: Bestellung wird erfasst, das Team markiert sie im Admin als bezahlt
//   - lokal zum Ausprobieren: PAYMENT_TEST_MODE=on (nur mit `next dev`, nie in Produktion) überspringt die Zahlung
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";
import { getStripe } from "@/lib/stripe";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { ANGEBOT, extendUntil, toolState, toolProduct, formatPrice, type ToolKind } from "@/lib/angebot";
import { crmMelden } from "@/lib/crm-sync";
import { euro } from "@/lib/crm-core";
import { purchaseMail } from "@/lib/werkzeug-text";

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const isTool = (kind: string): kind is ToolKind => kind === ANGEBOT.verlaengerung.kind || kind === ANGEBOT.abo.kind;

/** Testmodus ohne Zahlung: nur lokal mit `next dev` und PAYMENT_TEST_MODE=on */
export const paymentTestMode = () => process.env.PAYMENT_TEST_MODE === "on" && process.env.NODE_ENV !== "production";

export async function toolAccess(candidateId: string) {
  const [c, sub, paid] = await Promise.all([
    prisma.candidate.findUnique({ where: { id: candidateId }, select: { toolAccessUntil: true } }),
    prisma.creditPurchase.findFirst({ where: { candidateId, kind: ANGEBOT.abo.kind, status: { in: ["ACTIVE", "CANCELLING"] } }, orderBy: { createdAt: "desc" } }),
    prisma.serviceBooking.findFirst({ where: { candidateId, paidAt: { not: null }, status: { not: "CANCELLED" } }, select: { id: true } }),
  ]);
  return { ...toolState(c?.toolAccessUntil), subscription: sub ? { id: sub.id, status: sub.status as "ACTIVE" | "CANCELLING" } : null, hasPackage: !!paid };
}

/** Werkzeug um n Monate verlängern (hinten anhängen, wenn es noch läuft) */
export async function grantToolMonths(candidateId: string, months: number) {
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, select: { toolAccessUntil: true } });
  const until = extendUntil(c.toolAccessUntil, months);
  await prisma.candidate.update({ where: { id: candidateId }, data: { toolAccessUntil: until } });
  return until;
}

/** Werkzeug mindestens bis zu einem Datum (Stripe-Abo: Periodenende) */
async function accessAtLeast(candidateId: string, until: Date) {
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, select: { toolAccessUntil: true } });
  if (!c.toolAccessUntil || c.toolAccessUntil < until) await prisma.candidate.update({ where: { id: candidateId }, data: { toolAccessUntil: until } });
}

// ---------- Verlängerung oder Abo kaufen ----------
export async function startToolPurchase(candidateId: string, kind: ToolKind, origin: string): Promise<{ url: string | null; purchaseId: string }> {
  const product = toolProduct(kind);
  const access = await toolAccess(candidateId);
  if (!access.hasPackage) throw new Error("Bitte zuerst das Startpaket buchen.");
  if (kind === ANGEBOT.abo.kind && access.subscription?.status === "ACTIVE") throw new Error("Das Abo ist bereits aktiv.");
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { user: true } });
  await prisma.creditPurchase.updateMany({ where: { candidateId, status: "PENDING_PAYMENT" }, data: { status: "CANCELLED" } });
  const p = await prisma.creditPurchase.create({ data: { candidateId, kind, amountCents: product.priceCents, months: product.months } });

  const stripe = getStripe();
  if (!stripe) {
    if (paymentTestMode()) return { url: `${origin}/profil?kauf=ok&test=${p.id}`, purchaseId: p.id };
    await purchaseMails(p.id, "requested");
    return { url: null, purchaseId: p.id };
  }
  const name = kind === ANGEBOT.abo.kind ? "WoYou Bewerbungswerkzeug (Monatsabo)" : `WoYou Bewerbungswerkzeug (${product.months} Monat)`;
  const abo = kind === ANGEBOT.abo.kind;
  // Abo beginnt erst, wenn der schon bezahlte Zeitraum endet (Stripe verlangt dafür mindestens 48 Stunden Vorlauf)
  const trialEnd = abo && access.until && access.until.getTime() > Date.now() + 49 * 3600e3 ? Math.floor(access.until.getTime() / 1000) : undefined;
  const session = await stripe.checkout.sessions.create({
    mode: abo ? "subscription" : "payment",
    customer_email: c.user.email ?? undefined,
    line_items: [{ price_data: { currency: "eur", unit_amount: product.priceCents, product_data: { name }, ...(abo ? { recurring: { interval: "month" as const } } : {}) }, quantity: 1 }],
    success_url: `${origin}/profil?kauf=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/profil?kauf=abgebrochen`,
    metadata: { kind: "tool_purchase", purchaseId: p.id },
    ...(abo ? { subscription_data: { metadata: { purchaseId: p.id }, ...(trialEnd ? { trial_end: trialEnd } : {}) } } : {}),
  });
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { stripeSessionId: session.id, status: "PENDING_PAYMENT" } });
  return { url: session.url, purchaseId: p.id };
}

/** Zahlung eingegangen (Stripe, Testmodus oder von Hand im Admin). Idempotent. */
export async function markToolPurchasePaid(purchaseId: string, opts: { sessionId?: string; subscriptionId?: string; periodEnd?: Date; trialing?: boolean } = {}) {
  const p = await prisma.creditPurchase.findUnique({ where: { id: purchaseId } });
  if (!p || !isTool(p.kind) || ["PAID", "ACTIVE", "CANCELLING", "ENDED"].includes(p.status)) return false;
  const now = new Date();
  if (p.kind === ANGEBOT.verlaengerung.kind) {
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "PAID", paidAt: now, stripeSessionId: opts.sessionId ?? p.stripeSessionId } });
    await grantToolMonths(p.candidateId, p.months ?? ANGEBOT.verlaengerung.months);
  } else {
    // Abo: mit Stripe gilt das Periodenende (bei Probezeit = Ende des schon bezahlten Zeitraums), ohne Stripe ein Monat
    const until = opts.periodEnd ?? extendUntil((await prisma.candidate.findUnique({ where: { id: p.candidateId } }))?.toolAccessUntil, p.months ?? 1, now);
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "ACTIVE", paidAt: opts.trialing ? null : now, periodEnd: until, stripeSessionId: opts.sessionId ?? p.stripeSessionId, stripeSubscriptionId: opts.subscriptionId ?? p.stripeSubscriptionId } });
    await accessAtLeast(p.candidateId, until);
  }
  await purchaseMails(p.id, "paid");
  if (!opts.trialing) crmMelden("nachkauf", p.candidateId, { paket: p.kind, betrag: euro(p.amountCents), datum: now.toISOString() });
  return true;
}

/** Stripe: Abo-Rechnung bezahlt, Zugang bis Periodenende */
export async function extendToolSubscription(subscriptionId: string, periodEnd: Date, amountPaidCents: number) {
  const p = await prisma.creditPurchase.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!p || !isTool(p.kind)) return false;
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { periodEnd, paidAt: p.paidAt ?? (amountPaidCents > 0 ? new Date() : null), status: p.status === "CANCELLING" ? "CANCELLING" : "ACTIVE" } });
  await accessAtLeast(p.candidateId, periodEnd);
  if (amountPaidCents > 0) crmMelden("nachkauf", p.candidateId, { paket: p.kind, betrag: euro(amountPaidCents), datum: new Date().toISOString() });
  return true;
}

export async function endToolSubscription(subscriptionId: string) {
  await prisma.creditPurchase.updateMany({ where: { stripeSubscriptionId: subscriptionId, kind: ANGEBOT.abo.kind }, data: { status: "ENDED" } });
}

/** Kündigung durch die Kundin bzw. den Kunden: Zugang bleibt bis zum Ende des bezahlten Zeitraums */
export async function cancelToolSubscription(candidateId: string) {
  const p = await prisma.creditPurchase.findFirst({ where: { candidateId, kind: ANGEBOT.abo.kind, status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  if (!p) throw new Error("Kein aktives Abo gefunden.");
  const stripe = getStripe();
  if (stripe && p.stripeSubscriptionId) await stripe.subscriptions.update(p.stripeSubscriptionId, { cancel_at_period_end: true });
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "CANCELLING" } });
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { user: true } });
  const t = purchaseMail(c.user.locale);
  const until = c.toolAccessUntil ?? p.periodEnd ?? new Date();
  const paras = [t.hello(c.firstName), t.cancelled(until.toLocaleDateString(t.dateLocale)), t.sign];
  if (c.user.email) await sendMail({ to: c.user.email, subject: `WoYou: ${t.cancelledSubject}`, template: "tool_subscription_cancelled", text: paras.join("\n\n"), html: layout(t.cancelledSubject, paras) });
  return until;
}

async function purchaseMails(purchaseId: string, state: "requested" | "paid") {
  const p = await prisma.creditPurchase.findUnique({ where: { id: purchaseId }, include: { candidate: { include: { user: true } } } });
  if (!p || !isTool(p.kind)) return;
  const t = purchaseMail(p.candidate.user.locale);
  const abo = p.kind === ANGEBOT.abo.kind;
  const what = abo ? t.aboName(formatPrice(p.amountCents, t.lang)) : t.monthName(p.months ?? 1, formatPrice(p.amountCents, t.lang));
  const to = p.candidate.user.email || "";
  const title = state === "paid" ? t.paidSubject : t.requestedSubject;
  const paras = state === "paid" ? [t.hello(p.candidate.firstName), t.paid(what), t.sign] : [t.hello(p.candidate.firstName), t.requested(what), t.sign];
  if (to) await sendMail({ to, subject: `WoYou: ${title}`, template: `tool_purchase_${state}`, text: paras.join("\n\n"), html: layout(title, paras, { label: t.button, href: `${baseUrl()}/profil` }) });
  const team = teamAddress();
  const name = [p.candidate.firstName, p.candidate.lastName].filter(Boolean).join(" ") || "Kund:in";
  const teamWhat = abo ? `Monatsabo Werkzeug, ${formatPrice(p.amountCents)} im Monat` : `Werkzeug ${p.months ?? 1} Monat, ${formatPrice(p.amountCents)}`;
  if (team) await sendMail({ to: team, subject: `${state === "paid" ? "Bezahlt" : "Bestellt"}: ${teamWhat} · ${name}`, template: `team_tool_purchase_${state}`, text: `${name}: ${teamWhat}`, html: layout(teamWhat, [`${name}: ${teamWhat}`, state === "paid" ? "Bezahlt." : "Noch ohne Zahlung (Stripe nicht eingerichtet). Im Admin unter der Buchung als bezahlt markieren."]) });
}

/** Für die Werkzeug-Routen: angemeldete Kundin bzw. angemeldeter Kunde mit Zugangsstand (sonst null) */
export async function toolSession() {
  const session = await getSession();
  if (!session.userId || session.role !== ROLE.CANDIDATE) return null;
  const candidate = await prisma.candidate.findUnique({ where: { userId: session.userId }, include: { user: true } });
  if (!candidate) return null;
  return { candidate, access: await toolAccess(candidate.id) };
}
