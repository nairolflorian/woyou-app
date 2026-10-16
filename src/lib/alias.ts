import "server-only";

// Persönliche WoYou-Adresse je Bewerbungs-Service-Kund:in, z. B. fatima.benali@bewerbung.woyou.de.
// Aktiv erst, wenn MAIL_ALIAS_DOMAIN gesetzt ist (DNS + Mail-Dienst mit Weiterleitung eingerichtet).
// Bis dahin: Versand über MAIL_FROM, Antworten (Reply-To) gehen direkt an die echte Adresse des Kunden.
import { prisma } from "@/lib/prisma";

const translit = (s: string) =>
  s.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "").replace(/\.{2,}/g, ".");

export const aliasDomain = () => process.env.MAIL_ALIAS_DOMAIN || "";

export async function ensureAlias(bookingId: string, firstName: string, lastName: string) {
  const b = await prisma.serviceBooking.findUnique({ where: { id: bookingId }, select: { aliasLocal: true } });
  if (b?.aliasLocal) return b.aliasLocal;
  const base = translit(`${firstName} ${lastName}`) || `bewerber.${bookingId.slice(-6)}`;
  for (let i = 0; i < 50; i++) {
    const local = i === 0 ? base : `${base}${i + 1}`;
    const taken = await prisma.serviceBooking.findUnique({ where: { aliasLocal: local } });
    if (!taken) { await prisma.serviceBooking.update({ where: { id: bookingId }, data: { aliasLocal: local } }); return local; }
  }
  return null;
}

export function aliasAddress(local: string | null | undefined) {
  const d = aliasDomain();
  return local && d ? `${local}@${d}` : null;
}
