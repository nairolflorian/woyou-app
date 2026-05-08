import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CANDIDATE_STATUS, CANDIDATE_STATUS_LABEL } from "@/lib/enums";
import { jobLabel, JOB_CATEGORIES } from "@/lib/jobs";
import { CandidateBulkBar, BulkCheckbox } from "@/components/CandidateBulkBar";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default async function CandidateList(props: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    city?: string;
    country?: string;
    de?: string; // min German level
    minExp?: string; // min years experience
    job?: string; // job category slug
  }>;
}) {
  const sp = await props.searchParams;
  const status = sp.status as keyof typeof CANDIDATE_STATUS_LABEL | undefined;
  const q = sp.q?.trim();
  const city = sp.city?.trim();
  const country = sp.country?.trim();
  const minDe = sp.de && LEVELS.includes(sp.de) ? sp.de : undefined;
  const minExp = sp.minExp ? Math.max(0, parseInt(sp.minExp)) : undefined;
  const jobSlug = sp.job ? sp.job.trim() : undefined;

  const order = ["NONE", ...LEVELS];
  const minDeIdx = minDe ? order.indexOf(minDe) : 0;
  const allowedDe = minDe ? LEVELS.filter((l) => order.indexOf(l) >= minDeIdx) : null;

  const candidates = await prisma.candidate.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(jobSlug ? { desiredJobCategory: jobSlug } : {}),
      ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      ...(country
        ? { countryOfResidence: { contains: country, mode: "insensitive" } }
        : {}),
      ...(allowedDe ? { germanLevel: { in: allowedDe } } : {}),
      ...(minExp != null ? { yearsExperience: { gte: minExp } } : {}),
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { desiredJobCategory: { contains: q, mode: "insensitive" } },
              { aboutMe: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const activeFilters: { label: string; href: string }[] = [];
  const baseParams = new URLSearchParams();
  if (status) baseParams.set("status", status);
  if (q) {
    activeFilters.push({ label: `Suche: ${q}`, href: removeParam(sp, "q") });
    baseParams.set("q", q);
  }
  if (city) {
    activeFilters.push({ label: `Stadt: ${city}`, href: removeParam(sp, "city") });
    baseParams.set("city", city);
  }
  if (country) {
    activeFilters.push({
      label: `Land: ${country}`,
      href: removeParam(sp, "country"),
    });
    baseParams.set("country", country);
  }
  if (minDe) {
    activeFilters.push({ label: `DE ≥ ${minDe}`, href: removeParam(sp, "de") });
    baseParams.set("de", minDe);
  }
  if (minExp != null) {
    activeFilters.push({
      label: `≥ ${minExp} J.`,
      href: removeParam(sp, "minExp"),
    });
    baseParams.set("minExp", String(minExp));
  }
  if (jobSlug) {
    activeFilters.push({
      label: `Beruf: ${jobLabel(jobSlug)}`,
      href: removeParam(sp, "job"),
    });
    baseParams.set("job", jobSlug);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Kandidaten</h1>
      </div>

      {/* Filter form — replaces the simple search box */}
      <form className="mt-4 card grid gap-3 md:grid-cols-6" method="get">
        {status && <input type="hidden" name="status" value={status} />}
        <div className="md:col-span-2">
          <label className="label">Suchen</label>
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="Name, Stadt, Beruf, Bio …"
            className="input"
          />
        </div>
        <div>
          <label className="label">Stadt</label>
          <input name="city" defaultValue={city ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Land</label>
          <input name="country" defaultValue={country ?? ""} className="input" />
        </div>
        <div>
          <label className="label">DE-Min</label>
          <select name="de" defaultValue={minDe ?? ""} className="select">
            <option value="">—</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                ≥ {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Min. Erfahrung</label>
          <input
            name="minExp"
            type="number"
            min={0}
            defaultValue={minExp ?? ""}
            className="input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Beruf</label>
          <select name="job" defaultValue={jobSlug ?? ""} className="select">
            <option value="">— alle —</option>
            {JOB_CATEGORIES.map((j) => (
              <option key={j.slug} value={j.slug}>
                {j.de}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end gap-2 md:col-span-4">
          <button className="btn-primary" type="submit">
            Suchen
          </button>
          {(activeFilters.length > 0 || q) && (
            <Link
              href={status ? `/admin/kandidaten?status=${status}` : "/admin/kandidaten"}
              className="btn-ghost text-xs"
            >
              Zurücksetzen
            </Link>
          )}
        </div>
      </form>

      {activeFilters.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeFilters.map((f, i) => (
            <Link
              key={i}
              href={f.href}
              className="badge bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] hover:bg-[color:var(--color-brand)] hover:text-white"
              title="Filter entfernen"
            >
              {f.label} ×
            </Link>
          ))}
        </div>
      )}

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
              <th className="text-left">Stadt</th>
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
              const lbl =
                CANDIDATE_STATUS_LABEL[
                  c.status as keyof typeof CANDIDATE_STATUS_LABEL
                ];
              return (
                <tr
                  key={c.id}
                  className="border-b border-[color:var(--color-border)]"
                >
                  <td className="py-2">
                    <BulkCheckbox id={c.id} />
                  </td>
                  <td className="py-2">
                    <div className="font-semibold">
                      {c.firstName ?? "—"} {c.lastName ?? ""}
                    </div>
                    <div className="text-xs text-[color:var(--color-ink-soft)]">
                      {c.user.email ?? c.user.phone ?? c.user.telegramId ?? "–"}
                    </div>
                  </td>
                  <td>{c.desiredJobCategory ? jobLabel(c.desiredJobCategory) : "—"}</td>
                  <td className="text-xs">
                    {c.city ?? "—"}
                    {c.countryOfResidence && (
                      <div className="text-[10px] text-[color:var(--color-ink-soft)]">
                        {c.countryOfResidence}
                      </div>
                    )}
                  </td>
                  <td>{c.germanLevel ?? "—"}</td>
                  <td>{c.languageTestScore != null ? `${c.languageTestScore}/12` : "—"}</td>
                  <td>{c.profileCompleteness}%</td>
                  <td>
                    <span className={`badge ${lbl.color}`}>{lbl.de}</span>
                  </td>
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
                <td
                  colSpan={10}
                  className="py-6 text-center text-[color:var(--color-ink-soft)]"
                >
                  Keine Treffer.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[color:var(--color-ink-soft)]">
        {candidates.length} Kandidat:innen gezeigt (max. 100).
      </p>
    </div>
  );
}

// Build a URL that omits one specific search param — used by the filter chips.
function removeParam(
  current: Record<string, string | undefined>,
  key: string
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) {
    if (k === key || !v) continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `/admin/kandidaten?${qs}` : "/admin/kandidaten";
}
