/**
 * Demodaten vor dem Go-live entfernen.
 *   Probelauf (zeigt nur an):  docker compose --profile init run --rm db-init npx tsx scripts/demo-daten-entfernen.ts
 *   Wirklich löschen:          docker compose --profile init run --rm db-init npx tsx scripts/demo-daten-entfernen.ts --ausfuehren
 * Entfernt: Demo-Konten (*.demo, *@example.com) mit allem, was daran hängt (Profile, Firmen, Anfragen, Matches,
 * Chats, Buchungen, Mappen, Stellen, Guthaben), dazu Aufgaben und Benachrichtigungen dieser Konten.
 * Bleibt: echte Konten, Berufskategorien, Audit- und Fehlerprotokoll.
 * Vorher Backup ziehen und DEMO_MODE=false setzen (sonst spielt db-init beim nächsten Lauf die Demo neu ein).
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const run = process.argv.includes("--ausfuehren");

async function main() {
  const users = await prisma.user.findMany({
    where: { OR: [{ email: { endsWith: ".demo" } }, { email: { endsWith: "@example.com" } }] },
    select: { id: true, email: true, role: true, candidate: { select: { id: true } }, company: { select: { id: true } } },
  });
  const userIds = users.map((u) => u.id);
  const candIds = users.flatMap((u) => (u.candidate ? [u.candidate.id] : []));
  const compIds = users.flatMap((u) => (u.company ? [u.company.id] : []));
  const matches = await prisma.match.findMany({ where: { OR: [{ candidateId: { in: candIds } }, { companyId: { in: compIds } }] }, select: { id: true } });
  const matchIds = matches.map((m) => m.id);
  const convs = await prisma.conversation.findMany({ where: { OR: [{ matchId: { in: matchIds } }, { candidateId: { in: candIds } }, { companyId: { in: compIds } }] }, select: { id: true } });
  const convIds = convs.map((c) => c.id);
  const bookings = await prisma.serviceBooking.count({ where: { candidateId: { in: candIds } } });

  console.log(`Gefunden: ${users.length} Demo-Konten (${candIds.length} Kund:innen, ${compIds.length} Firmen), ${bookings} Buchungen, ${matchIds.length} Matches, ${convIds.length} Chats`);
  for (const u of users) console.log(`  ${u.role.padEnd(11)} ${u.email}`);
  if (!run) { console.log("\nProbelauf: nichts gelöscht. Zum Löschen mit --ausfuehren starten."); return; }

  await prisma.$transaction([
    prisma.message.deleteMany({ where: { OR: [{ conversationId: { in: convIds } }, { senderId: { in: userIds } }] } }),
    prisma.conversation.deleteMany({ where: { id: { in: convIds } } }),
    prisma.adminTask.deleteMany({ where: { OR: [{ candidateId: { in: candIds } }, { companyId: { in: compIds } }, { matchId: { in: matchIds } }, { assignedToId: { in: userIds } }] } }),
    prisma.match.deleteMany({ where: { id: { in: matchIds } } }),
    prisma.jobRequest.deleteMany({ where: { companyId: { in: compIds } } }),
    prisma.notification.deleteMany({ where: { userId: { in: userIds } } }),
    prisma.user.deleteMany({ where: { id: { in: userIds } } }),
  ]);
  console.log("Gelöscht. Hochgeladene Dateien der Demo-Konten liegen ggf. noch im Upload-Volume (woyou_uploads) und können dort entfernt werden.");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
