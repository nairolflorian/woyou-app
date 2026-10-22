import "server-only";

// Buchung des Startpakets (Unterlagen plus Werkzeug): Stripe-Checkout (wenn konfiguriert), Bezahlt-Markierung, Mails.
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { SERVICES, BOOKING_STATUS, formatPrice, type ServiceKey } from "@/lib/services";
import { ANGEBOT } from "@/lib/angebot";
import { crmMelden } from "@/lib/crm-sync";
import { euro } from "@/lib/crm-core";
import { grantToolMonths, paymentTestMode } from "@/lib/werkzeug";
import { bookingMail, wLang } from "@/lib/werkzeug-text";

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const SERVICE_NAME: Record<ServiceKey, string> = {
  startpaket: `Startpaket: Bewerbungsunterlagen und ${ANGEBOT.startpaket.toolMonths} Monate Bewerbungswerkzeug`,
  "bewerbung-25": "Bewerbungs-Service (alt, 25 Bewerbungen)",
};

// Stripe-Checkout für eine Buchung starten. Ohne Stripe-Konto: null (Buchung bleibt "angefragt"),
// im lokalen Testmodus (PAYMENT_TEST_MODE=on) ein Link, der die Zahlung überspringt.
export async function startCheckout(bookingId: string, origin: string) {
  const stripe = getStripe();
  if (!stripe) return paymentTestMode() ? `${origin}/bewerbungsservice/danke?test=${bookingId}` : null;
  const b = await prisma.serviceBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { candidate: { include: { user: true } } } });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: b.candidate.user.email ?? undefined,
    line_items: [{
      price_data: { currency: b.currency, unit_amount: b.amountCents, product_data: { name: `WoYou ${SERVICE_NAME[b.packageKey as ServiceKey] ?? b.packageKey}` } },
      quantity: 1,
    }],
    success_url: `${origin}/bewerbungsservice/danke?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/bewerbungsservice/buchen?abgebrochen=1`,
    metadata: { bookingId: b.id, kind: "service_booking" },
  });
  await prisma.serviceBooking.update({ where: { id: b.id }, data: { stripeSessionId: session.id, status: BOOKING_STATUS.PENDING_PAYMENT } });
  return session.url;
}

// Zahlung bestätigen – idempotent (Webhook, Danke-Seite und Admin können alle aufrufen).
// Weg 1: schaltet das Bewerbungswerkzeug für die gebuchten Monate frei (kein Guthaben je Bewerbung).
export async function markBookingPaid(bookingId: string, stripeSessionId?: string) {
  const res = await prisma.serviceBooking.updateMany({
    where: { id: bookingId, paidAt: null },
    data: { paidAt: new Date(), status: BOOKING_STATUS.PAID, ...(stripeSessionId ? { stripeSessionId } : {}) },
  });
  if (res.count > 0) {
    const b = await prisma.serviceBooking.findUniqueOrThrow({ where: { id: bookingId }, include: { candidate: true } });
    await grantToolMonths(b.candidateId, b.toolMonths || ANGEBOT.startpaket.toolMonths);
    await bookingMails(bookingId, "paid");
    crmMelden("bezahlt", b.candidateId, { paket: b.packageKey, betrag: euro(b.amountCents), datum: b.paidAt?.toISOString() });
    await ensureTask(b.candidateId, "CONTACT", `Erstgespräch Unterlagen: ${[b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ")}`, `Bezahlt. Telefon/WhatsApp: ${b.contactPhone ?? "keine Angabe"}. Berufe: ${b.targetJobs ?? "keine Angabe"}. Buchung: /admin/buchungen/${b.id}`);
  }
  return res.count > 0;
}

export async function bookingMails(bookingId: string, kind: "requested" | "paid") {
  const b = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, include: { candidate: { include: { user: true } } } });
  if (!b) return;
  const name = [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "Kund:in";
  const t = bookingMail(b.candidate.user.locale);
  const price = formatPrice(b.amountCents, wLang(b.candidate.user.locale));
  const svc = SERVICE_NAME[b.packageKey as ServiceKey] ?? b.packageKey;
  const to = b.candidate.user.email || "";

  // an die Kundin / den Kunden
  const title = kind === "paid" ? t.paidSubject : t.requestedSubject;
  const paras = [t.hello(b.candidate.firstName), ...(kind === "paid" ? t.paid(price, b.toolMonths || ANGEBOT.startpaket.toolMonths) : t.requested(price)), t.sign];
  await sendMail({ to, subject: `WoYou: ${title}`, template: `booking_${kind}`, bookingId: b.id, text: paras.join("\n\n"), html: layout(title, paras, { label: t.button, href: `${baseUrl()}/profil` }, undefined, t.dir) });

  // ans Team
  const team = teamAddress();
  if (team) {
    const tParas = [
      `${kind === "paid" ? "Bezahlt" : "Neue Anfrage (noch ohne Zahlung)"}: ${svc}, ${formatPrice(b.amountCents)}`,
      `Kund:in: ${name} (${to || "ohne E-Mail"})`,
      `Telefon/WhatsApp: ${b.contactPhone || "keine Angabe"}`,
      `Berufe: ${b.targetJobs || "keine Angabe"} · Region: ${b.targetRegions || "keine Angabe"}`,
      b.notes ? `Hinweis: ${b.notes}` : "",
    ].filter(Boolean);
    await sendMail({ to: team, subject: `Buchung ${kind === "paid" ? "bezahlt" : "angefragt"}: ${name}`, template: `team_booking_${kind}`, bookingId: b.id, text: tParas.join("\n"), html: layout("Neue Buchung Startpaket", tParas, { label: "Im Admin öffnen", href: `${baseUrl()}/admin/buchungen` }) });
  }
}

export function servicePrice(key: ServiceKey) {
  return SERVICES[key];
}

// Aufgabe im Admin-Bereich anlegen (einmalig je Titel und Kandidat:in)
export async function ensureTask(candidateId: string, kind: "CONTACT" | "DOCUMENT_CHECK" | "OTHER", title: string, description: string, dueInDays = 2) {
  const exists = await prisma.adminTask.findFirst({ where: { candidateId, title, status: { in: ["OPEN", "IN_PROGRESS"] } } });
  if (exists) return exists;
  return prisma.adminTask.create({ data: { candidateId, kind, title, description, dueDate: new Date(Date.now() + dueInDays * 864e5) } });
}
