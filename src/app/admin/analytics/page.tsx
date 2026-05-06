import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, CANDIDATE_STATUS_LABEL, MATCH_STATUS } from "@/lib/enums";
import { jobLabel } from "@/lib/jobs";

export default async function AdminAnalytics() {
  const [
    statusCounts,
    matchesByDay,
    topCandidateCategories,
    topJobCategories,
    placementStats,
    matchStatusCounts,
  ] = await Promise.all([
    prisma.candidate.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    matchesPerDay(),
    prisma.candidate.groupBy({
      by: ["desiredJobCategory"],
      where: { desiredJobCategory: { not: null } },
      _count: { _all: true },
      orderBy: { _count: { desiredJobCategory: "desc" } },
      take: 8,
    }),
    prisma.jobRequest.groupBy({
      by: ["jobCategory"],
      where: { isCustomRequest: false },
      _count: { _all: true },
      orderBy: { _count: { jobCategory: "desc" } },
      take: 8,
    }),
    placementMetrics(),
    prisma.match.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const sc = Object.fromEntries(
    statusCounts.map((r) => [r.status, r._count._all])
  ) as Record<string, number>;
  const totalCandidates = Object.values(sc).reduce((a, b) => a + b, 0);

  const funnel = [
    { key: "REGISTERED", label: "Registriert", count: totalCandidates },
    {
      key: "INCOMPLETE",
      label: "Profil teilweise",
      count:
        (sc.INCOMPLETE ?? 0) +
        (sc.COMPLETE ?? 0) +
        (sc.PAID_PLACEABLE ?? 0) +
        (sc.PROPOSED ?? 0) +
        (sc.PLACED ?? 0),
    },
    {
      key: "COMPLETE",
      label: "Profil vollständig",
      count:
        (sc.COMPLETE ?? 0) +
        (sc.PAID_PLACEABLE ?? 0) +
        (sc.PROPOSED ?? 0) +
        (sc.PLACED ?? 0),
    },
    {
      key: "PAID_PLACEABLE",
      label: "Bezahlt / Vermittelbar",
      count: (sc.PAID_PLACEABLE ?? 0) + (sc.PROPOSED ?? 0) + (sc.PLACED ?? 0),
    },
    {
      key: "PROPOSED",
      label: "Mind. einmal vorgeschlagen",
      count: (sc.PROPOSED ?? 0) + (sc.PLACED ?? 0),
    },
    { key: "PLACED", label: "Vermittelt", count: sc.PLACED ?? 0 },
  ];

  const maxFunnel = Math.max(1, funnel[0].count);
  const maxBar = Math.max(1, ...matchesByDay.map((d) => d.count));

  return (
    <div>
      <h1 className="text-2xl font-bold">Analytics</h1>
      <p className="text-sm text-[color:var(--color-ink-soft)]">
        Stand: {new Date().toLocaleString("de-DE")}
      </p>

      {/* FUNNEL */}
      <section className="mt-8">
        <h2 className="font-semibold mb-3">Funnel</h2>
        <div className="card space-y-2">
          {funnel.map((f, i) => {
            const w = (f.count / maxFunnel) * 100;
            const conv =
              i > 0 && funnel[i - 1].count > 0
                ? ((f.count / funnel[i - 1].count) * 100).toFixed(0)
                : null;
            return (
              <div key={f.key} className="flex items-center gap-3 text-sm">
                <div className="w-44 text-[color:var(--color-ink-soft)]">
                  {f.label}
                </div>
                <div className="flex-1 h-7 rounded-md bg-[color:var(--color-surface)] overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-[color:var(--color-brand)] to-[color:var(--color-brand-dark)]"
                    style={{ width: `${Math.max(w, 2)}%` }}
                  />
                  <div className="absolute inset-0 flex items-center px-3 text-xs font-semibold text-white mix-blend-difference">
                    {f.count}
                  </div>
                </div>
                <div className="w-16 text-right text-xs text-[color:var(--color-ink-soft)]">
                  {conv != null ? `${conv}%` : ""}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MATCH STATUS + PLACEMENT METRICS */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3">Match-Status</h2>
          <ul className="space-y-1 text-sm">
            {matchStatusCounts.map((s) => (
              <li key={s.status} className="flex justify-between">
                <span>{s.status.replace(/_/g, " ").toLowerCase()}</span>
                <strong>{s._count._all}</strong>
              </li>
            ))}
            {matchStatusCounts.length === 0 && (
              <li className="text-[color:var(--color-ink-soft)]">Noch keine Matches.</li>
            )}
          </ul>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Vermittlung</h2>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span>Vermittlungen gesamt</span>
              <strong>{placementStats.total}</strong>
            </li>
            <li className="flex justify-between">
              <span>Ø Tage von „bezahlt" bis Vermittlung</span>
              <strong>
                {placementStats.avgDaysToPlace != null
                  ? `${placementStats.avgDaysToPlace.toFixed(1)} Tage`
                  : "—"}
              </strong>
            </li>
            <li className="flex justify-between">
              <span>Vermittlung-Rate (Vermittelt / Vermittelbar)</span>
              <strong>
                {placementStats.placementRate != null
                  ? `${(placementStats.placementRate * 100).toFixed(0)}%`
                  : "—"}
              </strong>
            </li>
          </ul>
        </div>
      </section>

      {/* MATCHES PER DAY */}
      <section className="mt-8">
        <h2 className="font-semibold mb-3">Matches pro Tag (letzte 14 Tage)</h2>
        <div className="card">
          <div className="flex items-end gap-2 h-40">
            {matchesByDay.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center justify-end gap-1"
                title={`${d.day}: ${d.count}`}
              >
                <div
                  className="w-full bg-[color:var(--color-brand)] rounded-t-md"
                  style={{
                    height: `${(d.count / maxBar) * 100}%`,
                    minHeight: d.count > 0 ? 4 : 0,
                  }}
                  aria-label={`${d.count} Matches am ${d.day}`}
                />
                <div className="text-[10px] text-[color:var(--color-ink-soft)] -rotate-45 origin-top-left whitespace-nowrap mt-3">
                  {d.day.slice(5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOP CATEGORIES */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3">Wunschberufe (Kandidaten)</h2>
          <CatList items={topCandidateCategories.map((c) => ({ slug: c.desiredJobCategory!, count: c._count._all }))} />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-3">Stellenanfragen (Firmen)</h2>
          <CatList items={topJobCategories.map((c) => ({ slug: c.jobCategory, count: c._count._all }))} />
        </div>
      </section>

      {/* DEBUG / status table */}
      <section className="mt-8">
        <h2 className="font-semibold mb-3">Kandidaten-Status (Detail)</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase text-[color:var(--color-ink-soft)] border-b border-[color:var(--color-border)]">
              <tr>
                <th className="text-left py-2">Status</th>
                <th className="text-right">Anzahl</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(CANDIDATE_STATUS).map(([k]) => (
                <tr key={k} className="border-b border-[color:var(--color-border)] last:border-b-0">
                  <td className="py-2">
                    <span className={`badge ${CANDIDATE_STATUS_LABEL[k as keyof typeof CANDIDATE_STATUS_LABEL].color}`}>
                      {CANDIDATE_STATUS_LABEL[k as keyof typeof CANDIDATE_STATUS_LABEL].de}
                    </span>
                  </td>
                  <td className="text-right">{sc[k] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* keep MATCH_STATUS imported for tree-shake stability */}
      <input type="hidden" value={MATCH_STATUS.HIRED} />
    </div>
  );
}

function CatList({ items }: { items: { slug: string; count: number }[] }) {
  if (items.length === 0)
    return <p className="text-sm text-[color:var(--color-ink-soft)]">Noch keine Daten.</p>;
  const max = Math.max(1, ...items.map((i) => i.count));
  return (
    <ul className="space-y-1 text-sm">
      {items.map((i) => (
        <li key={i.slug} className="flex items-center gap-2">
          <span className="w-44 truncate">{jobLabel(i.slug)}</span>
          <div className="flex-1 h-4 bg-[color:var(--color-surface)] rounded">
            <div
              className="h-full bg-[color:var(--color-brand)] rounded"
              style={{ width: `${(i.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 text-right font-semibold">{i.count}</span>
        </li>
      ))}
    </ul>
  );
}

async function matchesPerDay() {
  const since = new Date(Date.now() - 13 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const matches = await prisma.match.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  });
  const buckets = new Map<string, number>();
  for (let i = 0; i < 14; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const m of matches) {
    const k = m.createdAt.toISOString().slice(0, 10);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) ?? 0) + 1);
  }
  return [...buckets.entries()].map(([day, count]) => ({ day, count }));
}

async function placementMetrics() {
  const placed = await prisma.candidate.findMany({
    where: { status: CANDIDATE_STATUS.PLACED, placedAt: { not: null }, paidAt: { not: null } },
    select: { paidAt: true, placedAt: true },
  });
  const placeable = await prisma.candidate.count({
    where: { paidAt: { not: null } },
  });
  const total = placed.length;
  if (total === 0) {
    return {
      total: 0,
      avgDaysToPlace: null as number | null,
      placementRate: placeable > 0 ? 0 : null,
    };
  }
  const totalDays = placed.reduce((acc, c) => {
    const d = (c.placedAt!.getTime() - c.paidAt!.getTime()) / (24 * 60 * 60 * 1000);
    return acc + d;
  }, 0);
  return {
    total,
    avgDaysToPlace: totalDays / total,
    placementRate: placeable > 0 ? total / placeable : null,
  };
}
