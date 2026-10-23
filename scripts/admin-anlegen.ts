/**
 * Super-Admin anlegen (oder einem bestehenden Admin ein neues Passwort geben).
 * Wird von scripts/admin-anlegen.sh im Prod-Werkzeugcontainer gestartet und liest von stdin drei Zeilen:
 *   E-Mail, Name, Passwort
 * Das Passwort kommt nur über stdin (nie als Argument oder Umgebungsvariable), wird mit bcrypt gespeichert und nie
 * ausgegeben. Der Name steht im Audit-Log (das Konto selbst hat kein Namensfeld).
 *   --neues-passwort   bestehendes Admin-Konto: nur das Passwort neu setzen
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const reset = process.argv.includes("--neues-passwort");
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN", "TEAM"];

async function stdinLines(): Promise<string[]> {
  const chunks: Buffer[] = [];
  for await (const c of process.stdin) chunks.push(c as Buffer);
  return Buffer.concat(chunks).toString("utf8").split(/\r?\n/);
}

async function main() {
  const [rawEmail = "", rawName = "", password = ""] = await stdinLines();
  const email = rawEmail.trim().toLowerCase();
  const name = rawName.trim().slice(0, 120);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Ungültige E-Mail-Adresse.");
  if (/\.demo$|@example\.com$/.test(email)) throw new Error("Demo-Adressen sind hier nicht erlaubt.");
  if (password.length < 12) throw new Error("Das Passwort braucht mindestens 12 Zeichen.");
  if (process.env.DEMO_MODE !== "false") console.warn("Hinweis: DEMO_MODE ist nicht false (das ist nicht die Produktion).");

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (reset) {
    if (!existing || !ADMIN_ROLES.includes(existing.role)) throw new Error("Kein Admin- oder Team-Konto mit dieser Adresse gefunden.");
    await prisma.user.update({ where: { id: existing.id }, data: { passwordHash, deletedAt: null } });
    await prisma.auditLog.create({ data: { action: "ADMIN_PASSWORD_RESET_CLI", actorRole: "SYSTEM", meta: JSON.stringify({ email, via: "scripts/admin-anlegen.sh" }) } });
    console.log(`Neues Passwort gesetzt für ${email} (${existing.role}).`);
    return;
  }
  if (existing) throw new Error(`Es gibt schon ein Konto mit ${email} (Rolle ${existing.role}). Für ein neues Passwort: --neues-passwort`);
  const u = await prisma.user.create({ data: { email, passwordHash, role: "SUPER_ADMIN", locale: "de" } });
  await prisma.auditLog.create({ data: { action: "TEAM_MEMBER_CREATE", actorRole: "SYSTEM", meta: JSON.stringify({ email, name, role: "SUPER_ADMIN", via: "scripts/admin-anlegen.sh" }) } });
  console.log(`Super-Admin angelegt: ${email}${name ? ` (${name})` : ""}, Konto ${u.id}. Anmelden unter /anmelden.`);
}

main()
  .catch((e) => { console.error(`Fehler: ${e instanceof Error ? e.message : "unbekannt"}`); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
