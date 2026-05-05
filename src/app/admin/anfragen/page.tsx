import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { jobLabel } from "@/lib/jobs";

export default async function AdminAnfragen(props: {
  searchParams: Promise<{ custom?: string }>;
}) {
  const sp = await props.searchParams;
  const onlyCustom = sp.custom === "1";
  const requests = await prisma.jobRequest.findMany({
    where: onlyCustom ? { isCustomRequest: true } : {},
    include: { company: true, matches: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Stellenanfragen</h1>
        <div className="flex gap-2 text-xs">
          <Link href="/admin/anfragen" className={`badge ${!onlyCustom ? "bg-[color:var(--color-brand)] text-white" : "bg-slate-100 text-slate-700"}`}>Alle</Link>
          <Link href="/admin/anfragen?custom=1" className={`badge ${onlyCustom ? "bg-[color:var(--color-brand)] text-white" : "bg-amber-100 text-amber-800"}`}>Sonderanfragen</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {requests.map((jr) => (
          <div key={jr.id} className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">
                  {jr.customJobTitle ?? jobLabel(jr.jobCategory)}
                  {jr.isCustomRequest && (
                    <span className="ml-2 badge bg-amber-100 text-amber-800">SONDERANFRAGE</span>
                  )}
                </div>
                <div className="text-sm text-[color:var(--color-ink-soft)]">
                  {jr.company.companyName} · {jr.location ?? "—"} · DE {jr.requiredGermanLevel ?? "—"} · {jr.minYearsExperience ?? 0} J. Erfahrung
                </div>
                {jr.description && <p className="mt-2 text-sm">{jr.description}</p>}
              </div>
              <Link href={`/admin/matching?jr=${jr.id}`} className="btn-primary">
                Matching ({jr.matches.length})
              </Link>
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <div className="card text-[color:var(--color-ink-soft)]">Keine Anfragen.</div>
        )}
      </div>
    </div>
  );
}
