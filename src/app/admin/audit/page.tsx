import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AUDIT_ACTION_LABEL } from "@/lib/audit";

export default async function AuditLogPage(props: {
  searchParams: Promise<{ action?: string; actorId?: string }>;
}) {
  const sp = await props.searchParams;
  const items = await prisma.auditLog.findMany({
    where: {
      ...(sp.action ? { action: sp.action } : {}),
      ...(sp.actorId ? { actorId: sp.actorId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const actions = Object.keys(AUDIT_ACTION_LABEL);

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit-Log</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Letzte 200 Admin-Aktionen. Filter:
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/admin/audit"
          className={`badge ${!sp.action ? "bg-[color:var(--color-brand)] text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Alle
        </Link>
        {actions.map((a) => (
          <Link
            key={a}
            href={`/admin/audit?action=${a}`}
            className={`badge ${sp.action === a ? "bg-[color:var(--color-brand)] text-white" : "bg-slate-100 text-slate-700"}`}
          >
            {AUDIT_ACTION_LABEL[a as keyof typeof AUDIT_ACTION_LABEL]}
          </Link>
        ))}
      </div>

      <div className="mt-6 card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
            <tr>
              <th className="text-left py-2">Wann</th>
              <th className="text-left">Wer</th>
              <th className="text-left">Aktion</th>
              <th className="text-left">Ziel</th>
              <th className="text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {items.map((e) => {
              const meta = e.meta ? safeJson(e.meta) : null;
              return (
                <tr key={e.id} className="border-b border-[color:var(--color-border)] last:border-b-0 align-top">
                  <td className="py-2 whitespace-nowrap text-xs text-[color:var(--color-ink-soft)]">
                    {e.createdAt.toLocaleString("de-DE")}
                  </td>
                  <td>
                    <div className="font-semibold">{e.actorEmail ?? "—"}</div>
                    <div className="text-[10px] text-[color:var(--color-ink-soft)]">
                      {e.actorRole ?? ""}
                      {e.ip ? ` · ${e.ip}` : ""}
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-slate-100 text-slate-700">
                      {AUDIT_ACTION_LABEL[e.action as keyof typeof AUDIT_ACTION_LABEL] ?? e.action}
                    </span>
                  </td>
                  <td className="text-xs">
                    {e.candidateId && (
                      <Link href={`/admin/kandidaten/${e.candidateId}`} className="text-[color:var(--color-brand)] block">
                        Kandidat: {e.candidateId.slice(0, 8)}…
                      </Link>
                    )}
                    {e.companyId && (
                      <Link href={`/admin/firmen/${e.companyId}`} className="text-[color:var(--color-brand)] block">
                        Firma: {e.companyId.slice(0, 8)}…
                      </Link>
                    )}
                    {e.matchId && (
                      <span className="block text-[color:var(--color-ink-soft)]">
                        Match: {e.matchId.slice(0, 8)}…
                      </span>
                    )}
                  </td>
                  <td className="text-xs">
                    {meta && (
                      <pre className="max-w-[280px] whitespace-pre-wrap text-[10px] text-[color:var(--color-ink-soft)]">
                        {JSON.stringify(meta, null, 2)}
                      </pre>
                    )}
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[color:var(--color-ink-soft)]">
                  Noch keine Einträge.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
