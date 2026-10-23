import "server-only";

// Vorführung (DEMO_MODE): Beim Demo-Login über /demo bekommen die beiden Demo-Kund:innen automatisch
//   - ein bezahltes Startpaket (nur falls noch keine Buchung da ist; ohne Mails, ohne CRM, ohne Stripe),
//   - einen aktiven Werkzeug-Zugang (toolAccessUntil mindestens 14 Tage in der Zukunft, sonst heute + 3 Monate),
//   - Fatima zusätzlich drei klar erfundene Beispielstellen im Tracker (eine mit E-Mail-Adresse, eine nur über die
//     Bewerbungsseite, eine schon „beworben“ mit Anschreiben und Erinnerung), damit Prüfen und Senden sofort gehen.
// Idempotent: mehrfaches Einloggen legt nichts doppelt an und überschreibt keine Änderungen aus der Vorführung.
// Greift NUR, wenn DEMO_MODE nicht "false" ist, und NUR für die Adressen unten.
import { prisma } from "@/lib/prisma";
import { DEMO_MODE_ENABLED } from "@/lib/demo-accounts";
import { ANGEBOT, addMonths } from "@/lib/angebot";
import { profileForCandidate } from "@/lib/stellensuche";
import { templateLetter } from "@/lib/letters";
import { DEMO_TOOL_EMAILS, DEMO_JOBS, demoJobRow } from "@/lib/demo-jobs";

const FATIMA = "fatima@example.com";
const day = 864e5;

const isDemoTool = (email?: string | null) => !!email && (DEMO_TOOL_EMAILS as readonly string[]).includes(email.toLowerCase());

/** Für den Demo-Login: Demo-Kund:in vorführbereit machen. Gibt true zurück, wenn etwas geprüft wurde. */
export async function prepareDemoCustomer(email?: string | null): Promise<boolean> {
  if (!DEMO_MODE_ENABLED || !isDemoTool(email)) return false;
  const c = await prisma.candidate.findFirst({ where: { user: { email: email!.toLowerCase() } } });
  if (!c) return false;
  const now = new Date();

  // 1. Bezahltes Startpaket, falls es noch keine Buchung gibt (direkt in der Datenbank: keine Mails, kein CRM, keine Zahlung)
  const booking = await prisma.serviceBooking.findFirst({ where: { candidateId: c.id, status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" } });
  if (!booking) {
    await prisma.serviceBooking.create({
      data: {
        candidateId: c.id, packageKey: "startpaket", amountCents: ANGEBOT.startpaket.priceCents, applicationsGoal: 0,
        toolMonths: ANGEBOT.startpaket.toolMonths, contactPhone: "+212 600 000 000", targetJobs: c.desiredJobTitle || "Pflege",
        targetRegions: "Nordrhein-Westfalen", acceptedTermsAt: now, waiverAcceptedAt: now, status: "PAID", paidAt: now,
        adminNote: "Demo-Buchung (automatisch beim Demo-Login angelegt, keine echte Zahlung)",
      },
    });
  }

  // 2. Werkzeug aktiv halten
  if (!c.toolAccessUntil || c.toolAccessUntil.getTime() < now.getTime() + 14 * day) {
    await prisma.candidate.update({ where: { id: c.id }, data: { toolAccessUntil: addMonths(now, ANGEBOT.startpaket.toolMonths) } });
  }

  // 3. Beispielstellen nur für Fatima
  if (email!.toLowerCase() === FATIMA) await ensureDemoJobs(c.id, now);
  return true;
}

async function ensureDemoJobs(candidateId: string, now: Date) {
  const existing = await prisma.savedJob.findMany({ where: { candidateId, source: "MANUAL", sourceRef: { in: DEMO_JOBS.map((j) => j.sourceRef) } }, select: { sourceRef: true } });
  const have = new Set(existing.map((x) => x.sourceRef));
  const missing = DEMO_JOBS.filter((j) => !have.has(j.sourceRef));
  // Aus dem Seed angelegtes „beworben“-Beispiel hat noch kein Anschreiben: einmalig nachtragen
  const noLetter = await prisma.savedJob.findMany({ where: { candidateId, source: "MANUAL", sourceRef: { in: DEMO_JOBS.filter((j) => j.status === "APPLIED").map((j) => j.sourceRef) }, coverLetter: null } });
  if (!missing.length && !noLetter.length) return;
  // Mappe wird dabei aus dem Profil vorbelegt (wie beim ersten Öffnen), damit Anschreiben und Lebenslauf gehen
  const p = await profileForCandidate(candidateId);
  for (const j of missing) {
    const row = demoJobRow(j, now.getTime());
    // Beim „beworben“-Beispiel liegt schon ein Anschreiben vor (sachliche Vorlage aus der Mappe, ohne KI)
    const coverLetter = j.status === "APPLIED" && p.data ? templateLetter(p.data, { title: j.title, company: j.company, city: j.city, contactName: j.contactName, description: j.description }) : null;
    await prisma.savedJob.create({ data: { candidateId, ...row, coverLetter } });
  }
  for (const j of noLetter) {
    if (p.data) await prisma.savedJob.update({ where: { id: j.id }, data: { coverLetter: templateLetter(p.data, { title: j.title, company: j.company, city: j.city, contactName: j.contactName, description: j.description }) } });
  }
}
