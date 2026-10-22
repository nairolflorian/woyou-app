import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROLE } from "@/lib/enums";
import { BOOKING_STATUS } from "@/lib/services";

// Übersicht (Weg 1): Unterlagen-Service und Werkzeug. Firmen, Anfragen und Matching gibt es nicht mehr.
export default async function AdminOverview() {
  const now = new Date();
  const [customers, booked, paid, submitted, toolActive, openTasks] = await Promise.all([
    prisma.user.count({ where: { role: ROLE.CANDIDATE, deletedAt: null } }),
    prisma.serviceBooking.count({ where: { status: { not: BOOKING_STATUS.CANCELLED } } }),
    prisma.serviceBooking.count({ where: { paidAt: { not: null }, status: { not: BOOKING_STATUS.CANCELLED } } }),
    prisma.applicationProfile.count({ where: { status: "SUBMITTED" } }),
    prisma.candidate.count({ where: { toolAccessUntil: { gt: now } } }),
    prisma.adminTask.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const stats = [
    { l: "Kund:innen", v: customers, link: "/admin/kandidaten" },
    { l: "Buchungen", v: booked, link: "/admin/buchungen" },
    { l: "davon bezahlt", v: paid, link: "/admin/buchungen" },
    { l: "Mappen warten auf Prüfung", v: submitted, link: "/admin/buchungen" },
    { l: "Werkzeug aktiv", v: toolActive, link: "/admin/auswertung" },
    { l: "Offene Aufgaben", v: openTasks, link: "/admin/aufgaben" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Übersicht</h1>
      <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">Bewerbungsunterlagen und Bewerbungswerkzeug. Kund:innen suchen Stellen selbst und bewerben sich selbst.</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.l} href={s.link} className="card hover:border-[color:var(--color-brand)] transition">
            <div className="text-3xl font-bold text-[color:var(--color-brand)]">{s.v}</div>
            <div className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{s.l}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
