"use client";

import { useState } from "react";

type Job = { ref: string; title: string; company: string; city: string; distanceKm?: number; publishedAt?: string; startAt?: string; fulltime: boolean; parttime: boolean; salary?: number | null; externalUrl?: string | null; url: string; profession?: string; taken: boolean };

export function JobSearch({ bookingId, defaults, selectedCount, goal }: { bookingId: string; defaults: { was: string; wo: string }; selectedCount: number; goal: number }) {
  const [was, setWas] = useState(defaults.was);
  const [wo, setWo] = useState(defaults.wo);
  const [umkreis, setUmkreis] = useState(50);
  const [art, setArt] = useState("arbeit");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [count, setCount] = useState(selectedCount);
  const [adding, setAdding] = useState<string | null>(null);

  async function search(p = 1) {
    setBusy(true); setErr(null);
    const q = new URLSearchParams({ was, wo, umkreis: String(umkreis), page: String(p), art });
    const r = await fetch(`/api/admin/bookings/${bookingId}/jobs?${q}`);
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error ?? "Suche fehlgeschlagen"); return; }
    setJobs(j.jobs); setTotal(j.total); setPage(p);
  }

  async function pick(job: Job) {
    setAdding(job.ref); setErr(null);
    const r = await fetch(`/api/admin/bookings/${bookingId}/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: job.ref, title: job.title, company: job.company, city: job.city, url: job.url, applyUrl: job.externalUrl || null, source: "BA" }) });
    const j = await r.json().catch(() => ({}));
    setAdding(null);
    if (!r.ok) { setErr(j.error ?? "Fehler"); return; }
    setJobs((xs) => xs.map((x) => (x.ref === job.ref ? { ...x, taken: true } : x)));
    setCount((c) => c + 1);
  }

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Stellensuche · Jobbörse der Bundesagentur für Arbeit</h2>
        <span className="text-sm">Ausgewählt: <strong>{count}</strong> / {goal} · <a href="" className="text-[color:var(--color-brand)]">Liste aktualisieren</a></span>
      </div>
      <form className="grid gap-3 md:grid-cols-[2fr_2fr_1fr_1fr_auto]" onSubmit={(e) => { e.preventDefault(); search(1); }}>
        <input className="input" placeholder="Beruf, z. B. Pflegefachkraft" value={was} onChange={(e) => setWas(e.target.value)} required />
        <input className="input" placeholder="Ort oder PLZ (leer = ganz Deutschland)" value={wo} onChange={(e) => setWo(e.target.value)} />
        <select className="input" value={umkreis} onChange={(e) => setUmkreis(Number(e.target.value))} disabled={!wo}>{[10, 25, 50, 100, 200].map((k) => <option key={k} value={k}>{k} km</option>)}</select>
        <select className="input" value={art} onChange={(e) => setArt(e.target.value)}><option value="arbeit">Arbeit</option><option value="ausbildung">Ausbildung</option></select>
        <button className="btn-primary" disabled={busy}>{busy ? "…" : "Suchen"}</button>
      </form>
      {err && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{err}</p>}
      {total !== null && <p className="text-sm text-[color:var(--color-ink-soft)]">{total.toLocaleString("de-DE")} Treffer · Seite {page}</p>}
      <div className="divide-y">
        {jobs.map((j) => (
          <div key={j.ref} className="py-3 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <a href={j.url} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-brand)]">{j.title}</a>
              <div className="text-sm">{j.company} · {j.city}{j.distanceKm != null ? ` (${j.distanceKm} km)` : ""}</div>
              <div className="text-xs text-[color:var(--color-ink-soft)]">
                {[j.fulltime && "Vollzeit", j.parttime && "Teilzeit", j.salary ? `${Math.round(j.salary).toLocaleString("de-DE")} €/Jahr` : null, j.startAt && `ab ${new Date(j.startAt).toLocaleDateString("de-DE")}`, j.publishedAt && `veröffentlicht ${new Date(j.publishedAt).toLocaleDateString("de-DE")}`, j.externalUrl && "Bewerbung über Firmenseite"].filter(Boolean).join(" · ")}
              </div>
            </div>
            <button className={j.taken ? "btn-ghost" : "btn-outline"} disabled={j.taken || adding === j.ref || count >= goal} onClick={() => pick(j)}>{j.taken ? "✓ ausgewählt" : adding === j.ref ? "…" : "Auswählen"}</button>
          </div>
        ))}
      </div>
      {total !== null && total > page * 50 && (
        <div className="flex gap-2">
          {page > 1 && <button className="btn-ghost" onClick={() => search(page - 1)}>← zurück</button>}
          <button className="btn-ghost" onClick={() => search(page + 1)}>weiter →</button>
        </div>
      )}
    </section>
  );
}
