import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, MATCH_STATUS } from "@/lib/enums";

export default async function AdminOverview() {
  const [
    totalCandidates,
    placeable,
    placed,
    incompleteCount,
    companies,
    openRequests,
    customRequests,
    awaitingConsent,
    sharedWithCompany,
    openTasks,
  ] = await Promise.all([
    prisma.candidate.count(),
    prisma.candidate.count({ where: { status: CANDIDATE_STATUS.PAID_PLACEABLE } }),
    prisma.candidate.count({ where: { status: CANDIDATE_STATUS.PLACED } }),
    prisma.candidate.count({
      where: { status: { in: [CANDIDATE_STATUS.REGISTERED, CANDIDATE_STATUS.INCOMPLETE] } },
    }),
    prisma.company.count(),
    prisma.jobRequest.count({ where: { status: "OPEN" } }),
    prisma.jobRequest.count({ where: { isCustomRequest: true, status: "OPEN" } }),
    prisma.match.count({ where: { status: MATCH_STATUS.AWAITING_CANDIDATE_CONSENT } }),
    prisma.match.count({ where: { status: MATCH_STATUS.SHARED_WITH_COMPANY } }),
    prisma.adminTask.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] } } }),
  ]);

  const stats = [
    { l: "Kandidaten gesamt", v: totalCandidates, link: "/admin/kandidaten" },
    { l: "Vermittelbar", v: placeable, link: "/admin/kandidaten?status=PAID_PLACEABLE" },
    { l: "Vermittelt", v: placed, link: "/admin/kandidaten?status=PLACED" },
    { l: "Profil unvollständig", v: incompleteCount, link: "/admin/kandidaten?status=INCOMPLETE" },
    { l: "Unternehmen", v: companies, link: "/admin/firmen" },
    { l: "Offene Anfragen", v: openRequests, link: "/admin/anfragen" },
    { l: "Sonderanfragen", v: customRequests, link: "/admin/anfragen?custom=1" },
    { l: "Wartet auf Kandidat", v: awaitingConsent, link: "/admin/matching" },
    { l: "Wartet auf Firma", v: sharedWithCompany, link: "/admin/matching" },
    { l: "Offene Aufgaben", v: openTasks, link: "/admin/aufgaben" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Übersicht</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Link
            key={s.l}
            href={s.link}
            className="card hover:border-[color:var(--color-brand)] transition"
          >
            <div className="text-3xl font-bold text-[color:var(--color-brand)]">{s.v}</div>
            <div className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{s.l}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
