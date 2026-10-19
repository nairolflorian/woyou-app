import "server-only";

// Buchungen von Zusatz-Services: Stripe-Checkout (wenn konfiguriert), Bezahlt-Markierung, Mails.
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { SERVICES, BOOKING_STATUS, formatPrice, type ServiceKey } from "@/lib/services";
import { crmMelden } from "@/lib/crm-sync";
import { euro } from "@/lib/crm-core";

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
const SERVICE_NAME: Record<ServiceKey, string> = { "bewerbung-25": "Bewerbungs-Service (25 Bewerbungen)" };

// Stripe-Checkout für eine Buchung starten. Ohne Stripe-Konto: null (Buchung bleibt "angefragt").
export async function startCheckout(bookingId: string, origin: string) {
  const stripe = getStripe();
  if (!stripe) return null;
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

// Zahlung bestätigen – idempotent (Webhook und Danke-Seite können beide aufrufen)
export async function markBookingPaid(bookingId: string, stripeSessionId?: string) {
  const res = await prisma.serviceBooking.updateMany({
    where: { id: bookingId, paidAt: null },
    data: { paidAt: new Date(), status: BOOKING_STATUS.PAID, ...(stripeSessionId ? { stripeSessionId } : {}) },
  });
  if (res.count > 0) {
    await (await import("@/lib/credits")).grantStartCredits(bookingId);
    await bookingMails(bookingId, "paid");
    const b = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, include: { candidate: true } });
    if (b) crmMelden("bezahlt", b.candidateId, { paket: b.packageKey, betrag: euro(b.amountCents), datum: b.paidAt?.toISOString() });
    if (b) await ensureTask(b.candidateId, "CONTACT", `Erstgespräch Bewerbungs-Service: ${[b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ")}`, `Bezahlt. Telefon/WhatsApp: ${b.contactPhone ?? "–"}. Berufe: ${b.targetJobs ?? "–"}. Buchung: /admin/buchungen/${b.id}`);
  }
  return res.count > 0;
}

export async function bookingMails(bookingId: string, kind: "requested" | "paid") {
  const b = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, include: { candidate: { include: { user: true } } } });
  if (!b) return;
  const name = [b.candidate.firstName, b.candidate.lastName].filter(Boolean).join(" ") || "du";
  const price = formatPrice(b.amountCents);
  const svc = SERVICE_NAME[b.packageKey as ServiceKey] ?? b.packageKey;
  const to = b.candidate.user.email || "";

  // an die Kundin / den Kunden
  const title = kind === "paid" ? "Deine Buchung ist bestätigt" : "Wir haben deine Anfrage erhalten";
  const paras = kind === "paid"
    ? [`Hallo ${name},`, `vielen Dank! Deine Zahlung über ${price} für den ${svc} ist bei uns eingegangen.`, "Wir melden uns in den nächsten 2 Werktagen bei dir und vereinbaren das Erstgespräch. Lade bis dahin gern deine Zeugnisse und Nachweise in deinem Profil hoch.", "Viele Grüße", "Dein WoYou-Team"]
    : [`Hallo ${name},`, `danke für deine Anfrage zum ${svc} (${price}).`, "Wir melden uns in den nächsten 2 Werktagen bei dir und schicken dir den Link zur Zahlung. Danach starten wir mit dem Erstgespräch.", "Viele Grüße", "Dein WoYou-Team"];
  await sendMail({ to, subject: `WoYou: ${title}`, template: `booking_${kind}`, bookingId: b.id, text: paras.join("\n\n"), html: layout(title, paras, { label: "Zu meinem Profil", href: `${baseUrl()}/profil` }) });

  // ans Team
  const team = teamAddress();
  if (team) {
    const tParas = [
      `${kind === "paid" ? "Bezahlt" : "Neue Anfrage (noch ohne Zahlung)"}: ${svc}, ${price}`,
      `Kandidat:in: ${name} (${to || "ohne E-Mail"})`,
      `Telefon/WhatsApp: ${b.contactPhone || "–"}`,
      `Berufe: ${b.targetJobs || "–"} · Region: ${b.targetRegions || "–"}`,
      b.notes ? `Hinweis: ${b.notes}` : "",
    ].filter(Boolean);
    await sendMail({ to: team, subject: `Buchung ${kind === "paid" ? "bezahlt" : "angefragt"}: ${name}`, template: `team_booking_${kind}`, bookingId: b.id, text: tParas.join("\n"), html: layout("Neue Buchung Bewerbungs-Service", tParas, { label: "Im Admin öffnen", href: `${baseUrl()}/admin/buchungen` }) });
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
