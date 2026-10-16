"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type Suggestion = {
  id: string; title: string; company: string; city: string | null; url: string | null; email: string | null; score: number | null;
  notes: string[]; aiNote: string | null; createdAt: string;
  meta: { distanceKm?: number; fulltime?: boolean; parttime?: boolean; salary?: number | null; publishedAt?: string; startAt?: string; externalUrl?: string | null; tasks?: string; requirements?: string; germanRequired?: string | null };
};

const tone = (s: number) => (s >= 75 ? "bg-emerald-100 text-emerald-800" : s >= 55 ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600");
const negative = /nur |keine |verlangt abgeschlossene|knapp|unbekannt|verwandt/;

export function SuggestionList({ bookingId, items, free: free0, approved, ai }: { bookingId: string; items: Suggestion[]; free: number; approved: boolean; ai: boolean }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  const [taken, setTaken] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [onlyMail, setOnlyMail] = useState(false);
  const free = Math.max(0, free0 - taken);
  const shown = list.filter((s) => !onlyMail || s.email);

  async function search() {
    setBusy("search"); setMsg({ ok: true, t: "Suche läuft. Das dauert etwa eine Minute …" });
    const r = await fetch(`/api/admin/bookings/${bookingId}/suggest`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Suche fehlgeschlagen" }); return; }
    setMsg({ ok: true, t: `${j.searched} Stellen durchsucht (${j.terms.join(", ")}${j.regions.length ? ` · ${j.regions.join(", ")}` : " · ganz Deutschland"}), ${j.added} neue Vorschläge.` });
    router.refresh();
    setTimeout(() => window.location.reload(), 400);
  }

  async function take(s: Suggestion) {
    const r = await fetch(`/api/admin/leads/${s.id}/select`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Fehler" }); return false; }
    setList((x) => x.filter((y) => y.id !== s.id)); setTaken((c) => c + 1);
    return true;
  }
  async function one(s: Suggestion) { setBusy(s.id); setMsg(null); if (await take(s)) { setMsg({ ok: true, t: `Übernommen: ${s.title}. Anschreiben ist erstellt.` }); router.refresh(); } setBusy(null); }
  async function hide(s: Suggestion) {
    setBusy(s.id);
    await fetch(`/api/admin/leads/${s.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "HIDDEN" }) });
    setList((x) => x.filter((y) => y.id !== s.id)); setBusy(null);
  }
  async function best() {
    const n = Math.min(free, shown.length);
    if (!n || !confirm(`Die ${n} besten Vorschläge übernehmen? Für jede Stelle wird ein Anschreiben erstellt.`)) return;
    setBusy("best");
    let done = 0;
    for (const s of shown.slice(0, n)) { setMsg({ ok: true, t: `Übernehme ${done + 1} von ${n} …` }); if (!(await take(s))) break; done++; }
    setBusy(null); setMsg({ ok: true, t: `${done} Stellen übernommen. Anschreiben bitte unten prüfen.` });
    router.refresh();
  }

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">Stellenvorschläge</h2>
          <p className="text-xs text-[color:var(--color-ink-soft)]">
            Automatisch gesucht in der Jobbörse der Bundesagentur, sortiert nach Passung zur Mappe{ai ? " (Regeln und KI)" : " (nach Regeln, KI noch aus)"}.
            {!approved && " Die Suche startet automatisch, sobald die Mappe freigegeben ist."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={onlyMail} onChange={(e) => setOnlyMail(e.target.checked)} />nur mit E-Mail</label>
          <button className="btn-outline py-1" disabled={!!busy} onClick={search}>{busy === "search" ? "Sucht …" : list.length ? "Weitere Vorschläge suchen" : "Vorschläge suchen"}</button>
          {shown.length > 0 && free > 0 && <button className="btn-primary py-1" disabled={!!busy} onClick={best}>Beste {Math.min(free, shown.length)} übernehmen</button>}
        </div>
      </div>
      {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
      {shown.length === 0 && <p className="text-sm text-[color:var(--color-ink-soft)]">{list.length ? "Keine Vorschläge mit E-Mail-Adresse." : "Noch keine Vorschläge."}</p>}
      <div className="space-y-3">
        {shown.map((s) => (
          <div key={s.id} className="rounded-xl border border-[color:var(--color-border)] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${tone(s.score ?? 0)}`}>{s.score ?? "–"} %</span>
                  {s.url ? <a href={s.url} target="_blank" rel="noreferrer" className="font-semibold text-[color:var(--color-brand)]">{s.title}</a> : <span className="font-semibold">{s.title}</span>}
                </div>
                <div className="text-sm mt-0.5">{s.company}{s.city ? ` · ${s.city}` : ""}{s.meta.distanceKm != null ? ` (${s.meta.distanceKm} km)` : ""}</div>
                <div className="text-xs text-[color:var(--color-ink-soft)]">
                  {[s.meta.fulltime && "Vollzeit", s.meta.parttime && "Teilzeit", s.meta.salary ? `${Math.round(s.meta.salary).toLocaleString("de-DE")} €/Jahr` : null, s.meta.germanRequired && `Deutsch ${s.meta.germanRequired}`, s.meta.startAt && `ab ${new Date(s.meta.startAt).toLocaleDateString("de-DE")}`, s.email ? `✉ ${s.email}` : s.meta.externalUrl ? "Bewerbung über Firmenseite" : "keine E-Mail gefunden"].filter(Boolean).join(" · ")}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary py-1" disabled={!!busy} onClick={() => one(s)}>{busy === s.id ? "…" : "Übernehmen"}</button>
                <button className="btn-ghost py-1" disabled={!!busy} onClick={() => hide(s)}>Passt nicht</button>
              </div>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {s.notes.map((n) => <li key={n} className={`rounded-full px-2 py-0.5 ${negative.test(n) ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800"}`}>{n}</li>)}
            </ul>
            {s.aiNote && <p className="mt-2 text-sm italic text-[color:var(--color-ink-soft)]">KI: {s.aiNote}</p>}
            {(s.meta.tasks || s.meta.requirements) && (
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-[color:var(--color-brand)]">Stellenprofil</summary>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  {s.meta.tasks && <div><div className="text-xs font-semibold uppercase text-[color:var(--color-ink-soft)]">Aufgaben</div><p className="whitespace-pre-line">{s.meta.tasks}</p></div>}
                  {s.meta.requirements && <div><div className="text-xs font-semibold uppercase text-[color:var(--color-ink-soft)]">Anforderungen</div><p className="whitespace-pre-line">{s.meta.requirements}</p></div>}
                </div>
              </details>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
