/**
 * Einmaliger Nachtrag: alle bestehenden echten Kund:innen an das EuBiA-CRM melden, je mit dem höchsten
 * erreichten Ereignis (registriert < gebucht < bezahlt < mappe_eingereicht < bewerbungen_laufen < nachkauf;
 * nur stornierte Buchungen ohne Zahlung: storniert). Demo- und Testkonten (*.demo, example.com usw.) bleiben außen vor.
 * Sendet nur, wenn EUBIA_CRM_URL, EUBIA_CRM_TOKEN und EUBIA_CRM_SYNC=on gesetzt sind (deploy/crm-einrichten.sh).
 *
 * Auf dem Server im Repo-Ordner (/var/www/woyou-app/repo), nach einem Build des Werkzeug-Images
 * (docker compose --profile init build db-init):
 *   Probelauf (zählt nur):  docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts
 *   Wirklich senden:        docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts --ausfuehren
 * Wichtig: db-init immer mit Befehl starten, ohne Befehl spielt es bei DEMO_MODE ungleich false die Demo neu ein.
 * Mehrfaches Ausführen ist unkritisch, das CRM ordnet über die woyouId zu.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { crmConfig, sendCrmEvent, candidatePayload, isDemoEmail, euro, type CrmEventName, type CrmPayload } from "../src/lib/crm-core";

const prisma = new PrismaClient();
const run = process.argv.includes("--ausfuehren");

async function main() {
  if (run && !crmConfig()) {
    console.log("Nicht eingerichtet oder nicht freigegeben (EUBIA_CRM_URL, EUBIA_CRM_TOKEN, EUBIA_CRM_SYNC=on). Nichts gesendet.");
    return;
  }
  const candidates = await prisma.candidate.findMany({
    where: { user: { deletedAt: null } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, createdAt: true,
      user: { select: { email: true } },
      bookings: {
        orderBy: { createdAt: "asc" },
        select: {
          packageKey: true, amountCents: true, status: true, paidAt: true, createdAt: true, applicationsSent: true,
          profile: { select: { submittedAt: true } },
          leads: { where: { status: { in: ["SENT", "APPLIED_MANUALLY"] }, sentAt: { not: null } }, orderBy: { sentAt: "asc" }, take: 1, select: { sentAt: true } },
        },
      },
      creditPurchases: { where: { paidAt: { not: null } }, orderBy: { paidAt: "desc" }, select: { kind: true, amountCents: true, paidAt: true } },
    },
  });

  const counts: Record<string, number> = {};
  let skipped = 0, ok = 0, failed = 0;
  for (const c of candidates) {
    if (isDemoEmail(c.user.email)) { skipped++; continue; }
    const [event, extra] = highest(c);
    counts[event] = (counts[event] ?? 0) + 1;
    if (!run) continue;
    // Erst alle Zahlungen (damit der Umsatz im CRM stimmt), dann die höchste erreichte Phase
    const zahlungen: [CrmEventName, Partial<CrmPayload>][] = [
      ...c.bookings.filter((x) => x.paidAt).map((x): [CrmEventName, Partial<CrmPayload>] => ["bezahlt", { paket: x.packageKey, betrag: euro(x.amountCents), datum: x.paidAt!.toISOString() }]),
      ...c.creditPurchases.slice().reverse().map((x): [CrmEventName, Partial<CrmPayload>] => ["nachkauf", { paket: x.kind, betrag: euro(x.amountCents), datum: (x.paidAt ?? c.createdAt).toISOString() }]),
    ];
    const folge = ["bezahlt", "nachkauf"].includes(event) ? zahlungen : [...zahlungen, [event, extra] as [CrmEventName, Partial<CrmPayload>]];
    let alleOk = true;
    for (const [ev, ex] of folge.length ? folge : [[event, extra] as [CrmEventName, Partial<CrmPayload>]]) {
      const data = await candidatePayload(prisma, c.id, ex);
      if (!data) { alleOk = false; break; }
      if (!(await sendCrmEvent(ev, data))) alleOk = false;
    }
    if (alleOk) ok++; else failed++;
  }

  console.log(`${candidates.length - skipped} echte Kund:innen, ${skipped} Demo-/Testkonten ausgelassen.`);
  for (const [k, n] of Object.entries(counts)) console.log(`  ${k.padEnd(20)} ${n}`);
  if (run) console.log(`Gesendet: ${ok} ok, ${failed} fehlgeschlagen.`);
  else console.log("Probelauf, nichts gesendet. Zum Senden mit --ausfuehren starten.");
}

type C = {
  createdAt: Date;
  bookings: { packageKey: string; amountCents: number; status: string; paidAt: Date | null; createdAt: Date; applicationsSent: number; profile: { submittedAt: Date | null } | null; leads: { sentAt: Date | null }[] }[];
  creditPurchases: { kind: string; amountCents: number; paidAt: Date | null }[];
};

function highest(c: C): [CrmEventName, Partial<CrmPayload>] {
  const iso = (d?: Date | null) => (d ?? c.createdAt).toISOString();
  const purchase = c.creditPurchases[0];
  if (purchase) return ["nachkauf", { paket: purchase.kind, betrag: euro(purchase.amountCents), datum: iso(purchase.paidAt) }];
  const b = c.bookings;
  const running = b.find((x) => x.applicationsSent > 0 || x.leads.length > 0);
  if (running) return ["bewerbungen_laufen", { paket: running.packageKey, datum: iso(running.leads[0]?.sentAt) }];
  const submitted = b.find((x) => x.profile?.submittedAt);
  if (submitted) return ["mappe_eingereicht", { paket: submitted.packageKey, datum: iso(submitted.profile?.submittedAt) }];
  const paid = b.filter((x) => x.paidAt).pop();
  if (paid) return ["bezahlt", { paket: paid.packageKey, betrag: euro(paid.amountCents), datum: iso(paid.paidAt) }];
  const open = b.filter((x) => x.status !== "CANCELLED").pop();
  if (open) return ["gebucht", { paket: open.packageKey, datum: iso(open.createdAt) }];
  const cancelled = b.pop();
  if (cancelled) return ["storniert", { paket: cancelled.packageKey, datum: iso(cancelled.createdAt) }];
  return ["registriert", { datum: iso(c.createdAt) }];
}

main()
  .catch((e) => { console.error("Abbruch:", e instanceof Error ? e.message : e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
