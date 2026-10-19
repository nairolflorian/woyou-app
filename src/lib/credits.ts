import "server-only";

// Guthaben an Bewerbungen je Kund:in.
// Startpaket (199 €) = 25, Nachkauf (149 €) = 25, Abo (50 €/Monat) = unbegrenzt, solange bezahlt.
// Jede verschickte Bewerbung bucht 1 ab (mit Abo: Eintrag mit 0, damit alles nachvollziehbar bleibt).
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { CREDIT_PRODUCTS, formatPrice, type CreditKind } from "@/lib/services";
import { crmMelden } from "@/lib/crm-sync";
import { euro } from "@/lib/crm-core";

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
type Tx = Prisma.TransactionClient | typeof prisma;

export async function creditState(candidateId: string, db: Tx = prisma) {
  const [sum, c] = await Promise.all([
    db.creditEntry.aggregate({ where: { candidateId }, _sum: { delta: true } }),
    db.candidate.findUnique({ where: { id: candidateId }, select: { subscriptionUntil: true } }),
  ]);
  const until = c?.subscriptionUntil && c.subscriptionUntil > new Date() ? c.subscriptionUntil : null;
  return { balance: sum._sum.delta ?? 0, unlimited: !!until, until };
}

export async function grantCredits(candidateId: string, delta: number, reason: string, extra: { note?: string; bookingId?: string; purchaseId?: string } = {}) {
  return prisma.creditEntry.create({ data: { candidateId, delta, reason, ...extra } });
}

// Startguthaben einer bezahlten Buchung (idempotent)
export async function grantStartCredits(bookingId: string) {
  const b = await prisma.serviceBooking.findUnique({ where: { id: bookingId } });
  if (!b || !b.paidAt) return;
  const has = await prisma.creditEntry.findFirst({ where: { bookingId, reason: "START" } });
  if (!has) await grantCredits(b.candidateId, b.applicationsGoal, "START", { bookingId, note: "Startpaket" });
}

// Vor dem Versand: Guthaben prüfen und 1 abbuchen (atomar, je Bewerbung nur einmal)
export async function consumeCredit(candidateId: string, leadId: string, bookingId: string, note: string) {
  return prisma.$transaction(async (tx) => {
    const already = await tx.creditEntry.findUnique({ where: { leadId } });
    if (already) return already;
    const s = await creditState(candidateId, tx);
    if (!s.unlimited && s.balance < 1) throw new Error("Kein Guthaben mehr. Die Kundin bzw. der Kunde kann 25 weitere Bewerbungen nachkaufen oder das Abo buchen.");
    return tx.creditEntry.create({ data: { candidateId, leadId, bookingId, delta: s.unlimited ? 0 : -1, reason: "APPLICATION", note: s.unlimited ? `${note} (Abo)` : note } });
  });
}

// Versand fehlgeschlagen: Abbuchung zurücknehmen
export async function refundCredit(leadId: string) {
  await prisma.creditEntry.deleteMany({ where: { leadId, reason: "APPLICATION" } });
}

// ---------- Kauf: Nachkauf (einmalig) oder Abo (monatlich) ----------
export async function startPurchase(candidateId: string, kind: CreditKind, origin: string): Promise<{ url: string | null; purchaseId: string }> {
  const product = CREDIT_PRODUCTS[kind];
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { user: true } });
  if (kind === "SUBSCRIPTION") {
    const s = await creditState(candidateId);
    const open = await prisma.creditPurchase.findFirst({ where: { candidateId, kind, status: { in: ["ACTIVE", "CANCELLING"] } } });
    if (s.unlimited && open?.status === "ACTIVE") throw new Error("Das Abo ist bereits aktiv.");
  }
  await prisma.creditPurchase.updateMany({ where: { candidateId, status: "PENDING_PAYMENT" }, data: { status: "CANCELLED" } });
  const p = await prisma.creditPurchase.create({ data: { candidateId, kind, amountCents: product.priceCents } });
  const stripe = getStripe();
  if (!stripe) {
    await purchaseMails(p.id, "requested");
    return { url: null, purchaseId: p.id };
  }
  const line = kind === "SUBSCRIPTION"
    ? { price_data: { currency: "eur", unit_amount: product.priceCents, recurring: { interval: "month" as const }, product_data: { name: `WoYou ${product.name}` } }, quantity: 1 }
    : { price_data: { currency: "eur", unit_amount: product.priceCents, product_data: { name: `WoYou ${product.name}` } }, quantity: 1 };
  const session = await stripe.checkout.sessions.create({
    mode: kind === "SUBSCRIPTION" ? "subscription" : "payment",
    customer_email: c.user.email ?? undefined,
    line_items: [line],
    success_url: `${origin}/profil?kauf=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/profil?kauf=abgebrochen`,
    metadata: { kind: "credit_purchase", purchaseId: p.id },
    ...(kind === "SUBSCRIPTION" ? { subscription_data: { metadata: { purchaseId: p.id } } } : {}),
  });
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { stripeSessionId: session.id, status: "PENDING_PAYMENT" } });
  return { url: session.url, purchaseId: p.id };
}

const monthLater = (from = new Date()) => { const d = new Date(from); d.setMonth(d.getMonth() + 1); return d; };

// Zahlung eingegangen (Stripe oder von Hand im Admin) – idempotent
export async function markPurchasePaid(purchaseId: string, opts: { sessionId?: string; subscriptionId?: string; periodEnd?: Date } = {}) {
  const p = await prisma.creditPurchase.findUnique({ where: { id: purchaseId } });
  if (!p || p.paidAt) return false;
  const now = new Date();
  if (p.kind === "PACK_25") {
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "PAID", paidAt: now, stripeSessionId: opts.sessionId ?? p.stripeSessionId } });
    await grantCredits(p.candidateId, CREDIT_PRODUCTS.PACK_25.credits, "PACK", { purchaseId: p.id, note: "Nachkauf 25 Bewerbungen" });
  } else {
    const until = opts.periodEnd ?? monthLater(now);
    await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "ACTIVE", paidAt: now, periodEnd: until, stripeSessionId: opts.sessionId ?? p.stripeSessionId, stripeSubscriptionId: opts.subscriptionId ?? p.stripeSubscriptionId } });
    await prisma.candidate.update({ where: { id: p.candidateId }, data: { subscriptionUntil: until } });
  }
  await purchaseMails(p.id, "paid");
  crmMelden("nachkauf", p.candidateId, { paket: p.kind, betrag: euro(p.amountCents), datum: now.toISOString() });
  return true;
}

// Abo verlängert (Stripe: invoice.paid) oder beendet
export async function extendSubscription(subscriptionId: string, periodEnd: Date) {
  const p = await prisma.creditPurchase.findUnique({ where: { stripeSubscriptionId: subscriptionId } });
  if (!p) return;
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { periodEnd, status: p.status === "CANCELLING" ? "CANCELLING" : "ACTIVE" } });
  await prisma.candidate.update({ where: { id: p.candidateId }, data: { subscriptionUntil: periodEnd } });
}
export async function endSubscription(subscriptionId: string) {
  await prisma.creditPurchase.updateMany({ where: { stripeSubscriptionId: subscriptionId }, data: { status: "ENDED" } });
}

// Kündigung durch Kund:in: läuft bis zum Ende des bezahlten Monats
export async function cancelSubscription(candidateId: string) {
  const p = await prisma.creditPurchase.findFirst({ where: { candidateId, kind: "SUBSCRIPTION", status: "ACTIVE" }, orderBy: { createdAt: "desc" } });
  if (!p) throw new Error("Kein aktives Abo gefunden.");
  const stripe = getStripe();
  if (stripe && p.stripeSubscriptionId) await stripe.subscriptions.update(p.stripeSubscriptionId, { cancel_at_period_end: true });
  await prisma.creditPurchase.update({ where: { id: p.id }, data: { status: "CANCELLING" } });
  crmMelden("storniert", candidateId, { paket: p.kind });
  const c = await prisma.candidate.findUniqueOrThrow({ where: { id: candidateId }, include: { user: true } });
  const until = c.subscriptionUntil?.toLocaleDateString("de-DE") ?? "Monatsende";
  const paras = [`Hallo ${c.firstName ?? ""},`.replace(" ,", ","), `dein Abo ist gekündigt. Du kannst den Service noch bis ${until} unbegrenzt nutzen. Danach wird nichts mehr abgebucht.`, "Viele Grüße", "Dein WoYou-Team"];
  if (c.user.email) await sendMail({ to: c.user.email, subject: "WoYou: Kündigung bestätigt", template: "subscription_cancelled", text: paras.join("\n\n"), html: layout("Kündigung bestätigt", paras) });
  return until;
}

async function purchaseMails(purchaseId: string, kind: "requested" | "paid") {
  const p = await prisma.creditPurchase.findUnique({ where: { id: purchaseId }, include: { candidate: { include: { user: true } } } });
  if (!p) return;
  const product = CREDIT_PRODUCTS[p.kind as CreditKind];
  const name = [p.candidate.firstName, p.candidate.lastName].filter(Boolean).join(" ") || "du";
  const price = `${formatPrice(p.amountCents)}${p.kind === "SUBSCRIPTION" ? " im Monat" : ""}`;
  const to = p.candidate.user.email || "";
  const title = kind === "paid" ? "Danke für deinen Kauf" : "Wir haben deine Bestellung erhalten";
  const paras = kind === "paid"
    ? [`Hallo ${name},`, `vielen Dank! ${product.name} (${price}) ist freigeschaltet. Wir bewerben dich weiter auf passende Stellen.`, "Viele Grüße", "Dein WoYou-Team"]
    : [`Hallo ${name},`, `danke für deine Bestellung: ${product.name} (${price}).`, "Wir schicken dir in Kürze den Link zur Zahlung.", "Viele Grüße", "Dein WoYou-Team"];
  if (to) await sendMail({ to, subject: `WoYou: ${title}`, template: `purchase_${kind}`, text: paras.join("\n\n"), html: layout(title, paras, { label: "Zu meinem Bereich", href: `${baseUrl()}/profil` }) });
  const team = teamAddress();
  if (team) await sendMail({ to: team, subject: `${kind === "paid" ? "Bezahlt" : "Bestellt"}: ${product.name} · ${name}`, template: `team_purchase_${kind}`, text: `${name}: ${product.name}, ${price}`, html: layout(`${product.name}`, [`${name}: ${product.name}, ${price}`, kind === "paid" ? "Bezahlt." : "Noch ohne Zahlung (Stripe nicht eingerichtet)."]) });
}
