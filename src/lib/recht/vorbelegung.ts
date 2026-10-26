import "server-only";

// Angemeldete Kund:innen: Name, E-Mail und Buchungsnummer in „Vertrag widerrufen“ und „Verträge hier kündigen“ vorbelegen.
// Die Seiten funktionieren auch ohne Anmeldung und ohne Datenbank (dann leer).
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { buchungsNummer } from "@/lib/recht/vertrag";

export async function vorbelegung(): Promise<{ name?: string; email?: string; bookingRef?: string } | undefined> {
  try {
    const s = await getSession();
    if (!s.userId || s.role !== ROLE.CANDIDATE) return undefined;
    const c = await prisma.candidate.findUnique({ where: { userId: s.userId }, include: { user: { select: { email: true } }, bookings: { where: { status: { not: "CANCELLED" } }, orderBy: { createdAt: "desc" }, take: 1, select: { id: true } } } });
    if (!c) return undefined;
    return { name: [c.firstName, c.lastName].filter(Boolean).join(" ") || undefined, email: c.user.email ?? undefined, bookingRef: c.bookings[0] ? buchungsNummer(c.bookings[0].id) : undefined };
  } catch {
    return undefined;
  }
}
