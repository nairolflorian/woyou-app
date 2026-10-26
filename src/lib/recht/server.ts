import "server-only";

// Verbraucherrecht (26.10.2026): Widerruf und Kündigung speichern, Buchung zuordnen, Eingangsbestätigung per E-Mail,
// Aufgabe im Admin, Erstattung über Stripe. Mails werfen nie (ohne SMTP werden sie nur protokolliert).
//
// CRM: Das EuBiA-CRM (apps/crm/eingang.js) lehnt unbekannte Ereignisse mit 400 ab. Ein eigenes Ereignis „widerrufen“
// gibt es deshalb nicht. Nach der Erstattung bzw. Stornierung melden wir das bekannte Ereignis „storniert“.
import { prisma } from "@/lib/prisma";
import { sendMail, layout, teamAddress } from "@/lib/mail";
import { getStripe } from "@/lib/stripe";
import { crmMelden } from "@/lib/crm-sync";
import { BOOKING_STATUS, SERVICE_KEYS } from "@/lib/services";
import {
  buchungsNummer, buchungsNummerSuche, datum, datumUhrzeit, erstattungBis, kuendigungsEnde, kuendigungBestaetigung, widerrufBestaetigung,
  type KuendigungEingabe, type WiderrufEingabe,
} from "@/lib/recht/vertrag";

const baseUrl = () => process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

type GefundeneBuchung = { id: string; candidateId: string; createdAt: Date; paidAt: Date | null; toolAccessUntil: Date | null };

/** Buchung über Buchungsnummer oder E-Mail der Buchung finden (neueste, nicht stornierte zuerst) */
export async function findeBuchung(ref: string | null | undefined, email?: string | null): Promise<GefundeneBuchung | null> {
  const select = { id: true, candidateId: true, createdAt: true, paidAt: true, candidate: { select: { toolAccessUntil: true } } } as const;
  const map = (b: { id: string; candidateId: string; createdAt: Date; paidAt: Date | null; candidate: { toolAccessUntil: Date | null } } | null) =>
    b ? { id: b.id, candidateId: b.candidateId, createdAt: b.createdAt, paidAt: b.paidAt, toolAccessUntil: b.candidate.toolAccessUntil } : null;
  const r = (ref ?? "").trim();
  const suche = r && !r.includes("@") ? buchungsNummerSuche(r) : null;
  if (suche) {
    const b = await prisma.serviceBooking.findFirst({ where: { OR: [{ id: suche }, { id: { endsWith: suche } }], packageKey: { in: SERVICE_KEYS } }, orderBy: { createdAt: "desc" }, select });
    if (b) return map(b);
  }
  for (const e of [r.includes("@") ? r.toLowerCase() : null, email?.toLowerCase() ?? null]) {
    if (!e) continue;
    const b = await prisma.serviceBooking.findFirst({
      where: { candidate: { user: { email: { equals: e, mode: "insensitive" } } }, packageKey: { in: SERVICE_KEYS }, status: { notIn: [BOOKING_STATUS.PENDING_PAYMENT] } },
      orderBy: [{ paidAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      select,
    });
    if (b) return map(b);
  }
  return null;
}

const buchungText = (b: GefundeneBuchung) => `${buchungsNummer(b.id)}, Startpaket, gebucht am ${datum(b.createdAt)}${b.paidAt ? `, bezahlt am ${datum(b.paidAt)}` : ", noch nicht bezahlt"}`;

async function sicherMail(opts: Parameters<typeof sendMail>[0]) {
  try {
    return await sendMail(opts);
  } catch (e) {
    console.error("[recht] Mail nicht verschickt:", e instanceof Error ? e.message : e);
    return { status: "FAILED" as const };
  }
}

async function aufgabe(candidateId: string | null, title: string, description: string, dueInDays: number) {
  try {
    await prisma.adminTask.create({ data: { candidateId, kind: "OTHER", title, description, dueDate: new Date(Date.now() + dueInDays * 864e5) } });
  } catch (e) {
    console.error("[recht] Aufgabe nicht angelegt:", e instanceof Error ? e.message : e);
  }
}

export async function widerrufEinreichen(d: WiderrufEingabe) {
  const b = await findeBuchung(d.bookingRef, d.email);
  const w = await prisma.widerruf.create({ data: { name: d.name, email: d.email, bookingRef: d.bookingRef, bookingId: b?.id ?? null, message: d.message } });
  const best = widerrufBestaetigung({ ...d, eingang: w.createdAt, buchung: b ? buchungText(b) : null });
  await sicherMail({ to: d.email, subject: `WoYou: ${best.betreff}`, template: "widerruf_eingang", bookingId: b?.id, text: best.zeilen.join("\n\n"), html: layout(best.betreff, best.zeilen) });

  const frist = datum(erstattungBis(w.createdAt));
  const team = teamAddress();
  const info = [`Widerruf eingegangen am ${datumUhrzeit(w.createdAt)}`, `Name: ${d.name}`, `E-Mail: ${d.email}`, `Angabe zur Buchung: ${d.bookingRef}`, `Zugeordnet: ${b ? buchungText(b) : "keine Buchung gefunden, bitte prüfen"}`, d.message ? `Nachricht: ${d.message}` : "", `Erstattung spätestens bis ${frist}.`].filter(Boolean);
  if (team) await sicherMail({ to: team, subject: `Widerruf: ${d.name}`, template: "team_widerruf", bookingId: b?.id, text: info.join("\n"), html: layout("Widerruf eingegangen", info, { label: "Widerrufe öffnen", href: `${baseUrl()}/admin/widerrufe` }) });
  await aufgabe(b?.candidateId ?? null, `Widerruf bearbeiten: ${d.name}`, `${info.join(" · ")} · Erstatten unter /admin/widerrufe`, 3);
  return { widerruf: w, bestaetigung: best };
}

export async function kuendigungEinreichen(d: KuendigungEingabe) {
  const b = await findeBuchung(d.bookingRef, d.email);
  const eingang = new Date();
  const festesEnde = b?.toolAccessUntil && b.toolAccessUntil > eingang ? b.toolAccessUntil : null;
  const ende = kuendigungsEnde({ art: d.art, wirksamZu: d.wirksamZu, festesEnde, eingang });
  const k = await prisma.kuendigung.create({
    data: { createdAt: eingang, art: d.art, grund: d.grund, name: d.name, email: d.email, bookingRef: d.bookingRef, bookingId: b?.id ?? null, vertrag: d.vertrag, wirksam: d.wirksam, wirksamZu: d.wirksamZu, bestaetigungEmail: d.bestaetigungEmail, vertragsende: ende.datum },
  });
  const best = kuendigungBestaetigung({ ...d, eingang: k.createdAt, ende, buchung: b ? buchungText(b) : null });
  await sicherMail({ to: d.bestaetigungEmail, subject: `WoYou: ${best.betreff}`, template: "kuendigung_eingang", bookingId: b?.id, text: best.zeilen.join("\n\n"), html: layout(best.betreff, best.zeilen) });

  const info = [`Kündigung (${d.art}) eingegangen am ${datumUhrzeit(k.createdAt)}`, `Name: ${d.name}`, `E-Mail der Buchung: ${d.email}`, d.grund ? `Grund: ${d.grund}` : "", `Zugeordnet: ${b ? buchungText(b) : "keine Buchung gefunden, bitte prüfen"}`, `Vertragsende laut Bestätigung: ${ende.datum ? datum(ende.datum) : "nächstmöglicher Zeitpunkt"}`].filter(Boolean);
  const team = teamAddress();
  if (team) await sicherMail({ to: team, subject: `Kündigung: ${d.name}`, template: "team_kuendigung", bookingId: b?.id, text: info.join("\n"), html: layout("Kündigung eingegangen", info, { label: "Im Admin öffnen", href: `${baseUrl()}/admin/widerrufe` }) });
  await aufgabe(b?.candidateId ?? null, `Kündigung bearbeiten: ${d.name}`, `${info.join(" · ")} · Übersicht unter /admin/widerrufe`, d.art === "ausserordentlich" ? 2 : 5);
  return { kuendigung: k, bestaetigung: best };
}

export class ErstattungFehler extends Error {}

/**
 * Erstattung nach Widerruf: Stripe-Refund für die Zahlung der Buchung (Checkout-Session → payment_intent),
 * dann Buchung stornieren und Werkzeug beenden. Betrag 0 = nichts erstatten (z. B. nie bezahlt), nur stornieren.
 * Staging nimmt nur Test-Schlüssel, Produktion nur Live-Schlüssel (getStripe).
 */
export async function widerrufErstatten(widerrufId: string, cents: number) {
  const w = await prisma.widerruf.findUnique({ where: { id: widerrufId } });
  if (!w) throw new ErstattungFehler("Widerruf nicht gefunden.");
  if (w.refundedAt) throw new ErstattungFehler("Für diesen Widerruf wurde schon erstattet.");
  if (!w.bookingId) throw new ErstattungFehler("Keine Buchung zugeordnet. Bitte zuerst eine Buchung zuordnen.");
  const b = await prisma.serviceBooking.findUnique({ where: { id: w.bookingId } });
  if (!b) throw new ErstattungFehler("Buchung nicht gefunden.");
  if (!Number.isInteger(cents) || cents < 0 || cents > b.amountCents) throw new ErstattungFehler("Der Betrag muss zwischen 0 und dem gezahlten Preis liegen.");
  if (cents > 0 && !b.paidAt) throw new ErstattungFehler("Die Buchung ist nicht bezahlt. Bitte 0 € eintragen, dann wird nur storniert.");

  let refundId: string | null = null;
  if (cents > 0) {
    const stripe = getStripe();
    if (!stripe) throw new ErstattungFehler("Stripe ist in dieser Umgebung nicht eingerichtet (oder der Schlüssel passt nicht zur Umgebung). Bitte im Stripe-Dashboard erstatten und hier „erledigt“ eintragen.");
    if (!b.stripeSessionId) throw new ErstattungFehler("Zur Buchung gibt es keine Stripe-Zahlung (z. B. im Admin als bezahlt markiert). Bitte manuell erstatten.");
    const session = await stripe.checkout.sessions.retrieve(b.stripeSessionId);
    const pi = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    if (!pi) throw new ErstattungFehler("Zur Stripe-Sitzung gibt es keine Zahlung.");
    const refund = await stripe.refunds.create(
      { payment_intent: pi, amount: cents, reason: "requested_by_customer", metadata: { widerrufId: w.id, bookingId: b.id } },
      { idempotencyKey: `widerruf-${w.id}-${cents}` },
    );
    refundId = refund.id;
  }
  const now = new Date();
  await prisma.widerruf.update({ where: { id: w.id }, data: { status: "ERSTATTET", refundCents: cents, refundedAt: now, stripeRefundId: refundId } });
  await stornieren(b.id, b.candidateId, b.packageKey);
  return { refundId };
}

/** Buchung stornieren und Werkzeugzugang beenden (Unterlagen bleiben herunterladbar) */
export async function stornieren(bookingId: string, candidateId: string, packageKey: string) {
  const now = new Date();
  const before = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, select: { status: true } });
  await prisma.serviceBooking.update({ where: { id: bookingId }, data: { status: BOOKING_STATUS.CANCELLED } });
  await prisma.candidate.updateMany({ where: { id: candidateId, toolAccessUntil: { gt: now } }, data: { toolAccessUntil: now } });
  if (before?.status !== BOOKING_STATUS.CANCELLED) crmMelden("storniert", candidateId, { paket: packageKey });
}
