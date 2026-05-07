import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE } from "@/lib/enums";

export default async function ErrorLogPage() {
  const session = await getSession();
  if (session.role !== ROLE.SUPER_ADMIN) redirect("/admin");

  const items = await prisma.errorLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Group by message to surface repeats.
  const grouped = new Map<string, { count: number; first: typeof items[0]; last: typeof items[0] }>();
  for (const e of items) {
    const key = e.message;
    const existing = grouped.get(key);
    if (existing) {
      existing.count++;
      if (e.createdAt > existing.last.createdAt) existing.last = e;
      if (e.createdAt < existing.first.createdAt) existing.first = e;
    } else {
      grouped.set(key, { count: 1, first: e, last: e });
    }
  }
  const aggregated = [...grouped.entries()].sort(
    (a, b) => b[1].last.createdAt.getTime() - a[1].last.createdAt.getTime()
  );

  return (
    <div>
      <h1 className="text-2xl font-bold">Fehler-Log</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Letzte 200 erfasste Fehler (Server- und Client-Seite). Wiederholungen
        sind gruppiert. Behebe einen, indem du auf den Eintrag klickst und den
        Stacktrace anschaust.
      </p>

      <div className="mt-6 space-y-3">
        {aggregated.map(([msg, info]) => (
          <details
            key={msg}
            className="card open:border-rose-300 open:bg-rose-50/30"
          >
            <summary className="cursor-pointer flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="font-mono text-sm break-words">{msg}</div>
                <div className="mt-1 text-xs text-[color:var(--color-ink-soft)]">
                  {info.last.method ?? "—"} · {info.last.path ?? "—"} ·{" "}
                  {info.last.createdAt.toLocaleString("de-DE")}
                </div>
              </div>
              <span
                className={`badge flex-shrink-0 ${info.count > 1 ? "bg-rose-600 text-white" : "bg-rose-100 text-rose-800"}`}
              >
                {info.count}× {info.last.level}
              </span>
            </summary>

            <div className="mt-4 space-y-3 text-xs">
              {info.last.digest && (
                <div>
                  <div className="font-semibold text-[color:var(--color-ink-soft)] uppercase tracking-wider">
                    Digest
                  </div>
                  <code className="font-mono">{info.last.digest}</code>
                </div>
              )}
              {info.last.stack && (
                <div>
                  <div className="font-semibold text-[color:var(--color-ink-soft)] uppercase tracking-wider">
                    Stacktrace (jüngste Vorkommen)
                  </div>
                  <pre className="mt-1 bg-[color:var(--color-surface)] p-2 rounded overflow-x-auto whitespace-pre-wrap">
                    {info.last.stack}
                  </pre>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-[10px] text-[color:var(--color-ink-soft)]">
                <span>Erstes Vorkommen: {info.first.createdAt.toLocaleString("de-DE")}</span>
                {info.last.userAgent && (
                  <span title={info.last.userAgent} className="truncate max-w-[260px]">
                    UA: {info.last.userAgent}
                  </span>
                )}
              </div>
            </div>
          </details>
        ))}
        {aggregated.length === 0 && (
          <div className="card text-center text-[color:var(--color-ink-soft)]">
            Keine Fehler protokolliert. 🎉
          </div>
        )}
      </div>
    </div>
  );
}
