import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, CANDIDATE_STATUS_LABEL } from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";
import { CandidateBulkBar, BulkCheckbox } from "@/components/CandidateBulkBar";

export default async function CandidateList(props: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await props.searchParams;
  const status = sp.status as keyof typeof CANDIDATE_STATUS_LABEL | undefined;
  const q = sp.q?.trim();

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { lastName: { contains: q } },
              { city: { contains: q } },
              { desiredJobCategory: { contains: q } },
            ],
          }
        : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Kandidaten</h1>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Suchen…"
            className="input max-w-xs"
          />
          <button className="btn-outline">Suchen</button>
        </form>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/kandidaten"
          className={`badge ${!status ? "bg-[color:var(--color-brand)] text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Alle
        </Link>
        {Object.values(CANDIDATE_STATUS).map((s) => (
          <Link
            key={s}
            href={`/admin/kandidaten?status=${s}`}
            className={`badge ${status === s ? "bg-[color:var(--color-brand)] text-white" : CANDIDATE_STATUS_LABEL[s].color}`}
          >
            {CANDIDATE_STATUS_LABEL[s].de}
          </Link>
        ))}
      </div>

      <CandidateBulkBar />

      <div className="mt-3 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left py-2 w-8"></th>
              <th className="text-left py-2">Name</th>
              <th className="text-left">Wunschberuf</th>
              <th className="text-left">DE</th>
              <th className="text-left">Test</th>
              <th className="text-left">Profil</th>
              <th className="text-left">Status</th>
              <th className="text-left">Vorschläge</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => {
              const lbl = CANDIDATE_STATUS_LABEL[c.status as keyof typeof CANDIDATE_STATUS_LABEL];
              return (
                <tr key={c.id} className="border-b border-[color:var(--color-border)]">
                  <td className="py-2"><BulkCheckbox id={c.id} /></td>
                  <td className="py-2">
                    <div className="font-semibold">
                      {c.firstName ?? "—"} {c.lastName ?? ""}
                    </div>
                    <div className="text-xs text-[color:var(--color-ink-soft)]">
                      {c.user.email ?? c.user.phone ?? c.user.telegramId ?? "–"}
                    </div>
                  </td>
                  <td>{c.desiredJobCategory ? jobLabel(c.desiredJobCategory) : "—"}</td>
                  <td>{c.germanLevel ?? "—"}</td>
                  <td>{c.languageTestScore != null ? `${c.languageTestScore}/12` : "—"}</td>
                  <td>{c.profileCompleteness}%</td>
                  <td><span className={`badge ${lbl.color}`}>{lbl.de}</span></td>
                  <td>{c.timesProposed}</td>
                  <td className="text-right">
                    <Link
                      href={`/admin/kandidaten/${c.id}`}
                      className="text-[color:var(--color-brand)] font-semibold"
                    >
                      Details →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={9} className="py-6 text-center text-[color:var(--color-ink-soft)]">
                  Keine Treffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
