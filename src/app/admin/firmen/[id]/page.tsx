import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { jobLabel } from "@/lib/jobs";

export default async function AdminFirmaDetail(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const company = await prisma.company.findUnique({
    where: { id },
    include: {
      user: true,
      jobRequests: { orderBy: { createdAt: "desc" } },
      matches: { include: { candidate: true, jobRequest: true } },
    },
  });
  if (!company) notFound();

  return (
    <div>
      <Link href="/admin/firmen" className="text-sm text-[color:var(--color-ink-soft)]">← zurück</Link>
      <h1 className="mt-2 text-2xl font-bold">{company.companyName}</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        {company.user.email ?? "—"} · {company.city ?? "—"}
      </p>

      <h2 className="mt-8 font-semibold">Stellenanfragen</h2>
      <div className="mt-3 space-y-2">
        {company.jobRequests.map((jr) => (
          <div key={jr.id} className="card flex items-center justify-between">
            <div>
              <div className="font-semibold">{jr.customJobTitle ?? jobLabel(jr.jobCategory)}</div>
              <div className="text-xs text-[color:var(--color-ink-soft)]">{jr.location ?? "—"}</div>
            </div>
            <Link href={`/admin/matching?jr=${jr.id}`} className="btn-outline text-xs">Matching →</Link>
          </div>
        ))}
        {company.jobRequests.length === 0 && (
          <div className="text-[color:var(--color-ink-soft)]">Keine Anfragen.</div>
        )}
      </div>
    </div>
  );
}
