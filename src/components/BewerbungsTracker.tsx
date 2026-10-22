"use client";

import { useState } from "react";
import Link from "next/link";
import { fillIn, dateLocaleOf, wLang, type werkzeugText } from "@/lib/werkzeug-text";
import { TRACKER_STATUS, type TrackerStatus } from "@/lib/stellensuche-core";
import type { TrackerItem } from "@/lib/tracker";

type T = ReturnType<typeof werkzeugText>;
const STATUS_CLASS: Record<TrackerStatus, string> = {
  SAVED: "bg-slate-100 text-slate-700", APPLIED: "bg-blue-100 text-blue-800", REPLY: "bg-indigo-100 text-indigo-800",
  INTERVIEW: "bg-amber-100 text-amber-800", REJECTED: "bg-slate-200 text-slate-600", OFFER: "bg-emerald-100 text-emerald-800",
};

// Meine Bewerbungen: Die Person pflegt Stand, Datum und Notizen selbst, erstellt Anschreiben je Stelle
// und bewirbt sich selbst (eigenes E-Mail-Programm oder Seite des Arbeitgebers).
export function BewerbungsTracker({ t, locale, initial, active }: { t: T; locale: string; initial: TrackerItem[]; active: boolean }) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<TrackerStatus | "ALL">("ALL");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const dl = dateLocaleOf(wLang(locale));
  const shown = items.filter((x) => filter === "ALL" || x.status === filter);
  const replace = (it: TrackerItem) => setItems((xs) => xs.map((x) => (x.id === it.id ? it : x)));

  async function addOwn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const manual = Object.fromEntries(["title", "company", "city", "url", "email"].map((k) => [k, String(f.get(k) || "")]));
    const r = await fetch("/api/stellen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ manual }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setMsg(j.error ?? t.failed); return; }
    setItems((xs) => [j.item, ...xs]); setAdding(false); setMsg(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", ...TRACKER_STATUS] as const).map((s) => {
          const n = s === "ALL" ? items.length : items.filter((x) => x.status === s).length;
          return <button key={s} className={`rounded-full border px-3 py-1 text-sm ${filter === s ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`} onClick={() => setFilter(s)}>{s === "ALL" ? t.all : t.status[s]} ({n})</button>;
        })}
        <span className="flex-1" />
        {active && <Link href="/stellensuche" className="btn-primary">{t.toSearch}</Link>}
        {active && <button className="btn-outline" onClick={() => setAdding((a) => !a)}>{t.addOwn}</button>}
      </div>
      {!active && <p className="card bg-amber-50 border-amber-200 text-sm text-amber-900">{t.readOnly}</p>}
      {adding && (
        <form onSubmit={addOwn} className="card space-y-3 text-sm">
          <p className="text-[color:var(--color-ink-soft)]">{t.addOwnLead}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input name="title" className="input" placeholder={t.ownTitle} required minLength={2} maxLength={200} />
            <input name="company" className="input" placeholder={t.ownCompany} required minLength={2} maxLength={200} />
            <input name="city" className="input" placeholder={t.ownCity} maxLength={120} />
            <input name="url" type="url" className="input" placeholder={t.ownUrl} maxLength={1000} />
            <input name="email" type="email" className="input" placeholder={t.ownEmail} maxLength={200} />
          </div>
          <button className="btn-primary">{t.add}</button>
        </form>
      )}
      {msg && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{msg}</p>}
      {items.length === 0 && <div className="card text-sm text-[color:var(--color-ink-soft)]">{t.empty}</div>}
      <ul className="space-y-3">
        {shown.map((x) => <Item key={x.id} x={x} t={t} dl={dl} active={active} onChange={replace} onRemove={() => setItems((xs) => xs.filter((y) => y.id !== x.id))} />)}
      </ul>
    </div>
  );
}

function Item({ x, t, dl, active, onChange, onRemove }: { x: TrackerItem; t: T; dl: string; active: boolean; onChange: (x: TrackerItem) => void; onRemove: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState(x.notes);
  const [letter, setLetter] = useState(x.coverLetter ?? "");
  const [lang, setLang] = useState(x.letterLang);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const date = (s: string | null) => (s ? new Date(s).toLocaleDateString(dl) : "");

  async function patch(body: Record<string, unknown>, label = "save") {
    setBusy(label); setMsg(null);
    const r = await fetch(`/api/stellen/${x.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? t.failed }); return; }
    onChange(j.item);
    if (label === "notes" || label === "letter") setMsg({ ok: true, t: t.savedOk });
  }
  async function generate() {
    setBusy("generate"); setMsg(null);
    const r = await fetch(`/api/stellen/${x.id}/anschreiben`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? t.failed }); return; }
    onChange(j.item); setLetter(j.item.coverLetter ?? "");
  }
  async function remove() {
    if (!confirm(t.removeAsk)) return;
    const r = await fetch(`/api/stellen/${x.id}`, { method: "DELETE" });
    if (r.ok) onRemove(); else setMsg({ ok: false, t: t.failed });
  }

  const employer = x.applyUrl ?? x.url;
  return (
    <li className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {x.url ? <a href={x.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-[color:var(--color-brand-deep)]">{x.title}</a> : <strong>{x.title}</strong>}
          <div className="text-sm">{x.company}{x.city ? ` · ${x.city}` : ""}</div>
          <div className="mt-1 text-xs text-[color:var(--color-ink-soft)]">
            {[x.appliedAt && fillIn(t.appliedOn, { date: date(x.appliedAt) }), x.repliedAt && x.status !== "APPLIED" && fillIn(t.repliedOn, { date: date(x.repliedAt) }), x.interviewAt && fillIn(t.interviewOn, { date: date(x.interviewAt) }), x.germanRequired && fillIn(t.germanReq, { req: x.germanRequired })].filter(Boolean).join(" · ")}
          </div>
        </div>
        <label className="text-xs">
          <span className="sr-only">{t.statusLabel}</span>
          <select className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_CLASS[x.status]}`} value={x.status} disabled={!active || !!busy} onChange={(e) => patch({ status: e.target.value }, "status")}>
            {TRACKER_STATUS.map((s) => <option key={s} value={s}>{t.status[s]}</option>)}
          </select>
        </label>
      </div>

      <details className="rounded-xl border border-[color:var(--color-border)] p-3" open={x.status === "SAVED"}>
        <summary className="cursor-pointer text-sm font-semibold">{t.letterTitle}</summary>
        <div className="mt-3 space-y-3 text-sm">
          <p className="text-xs text-[color:var(--color-ink-soft)]">{t.letterHint}</p>
          <div className="flex flex-wrap items-center gap-2">
            {x.hasEnglish && (
              <label className="text-xs">{t.letterLang}{" "}
                <select className="input inline-block w-auto py-1" value={lang} disabled={!active} onChange={(e) => setLang(e.target.value as "de" | "en")}><option value="de">Deutsch</option><option value="en">English</option></select>
              </label>
            )}
            {active && <button className="btn-outline" disabled={!!busy} onClick={generate}>{busy === "generate" ? t.generating : x.coverLetter ? t.regenerate : t.generate}</button>}
          </div>
          {x.coverLetter !== null && (
            <>
              <textarea className="input min-h-64 font-mono text-xs" value={letter} disabled={!active} onChange={(e) => setLetter(e.target.value)} onBlur={() => letter !== (x.coverLetter ?? "") && patch({ coverLetter: letter }, "letter")} maxLength={6000} />
              <div className="flex flex-wrap gap-2">
                <a className="btn-outline py-1" href={`/api/stellen/${x.id}/dokument?format=pdf`}>{t.pdf}</a>
                <a className="btn-outline py-1" href={`/api/stellen/${x.id}/dokument?format=docx`}>{t.word}</a>
                <a className="btn-outline py-1" href={`/api/mappe/download?doc=cv${x.letterLang === "en" ? "&lang=en" : ""}`}>{t.cv}</a>
              </div>
            </>
          )}
          <div className="border-t border-[color:var(--color-border)] pt-3 space-y-2">
            {x.mailto ? (
              <>
                <a className="btn-primary" href={x.mailto}>{t.mail}</a>
                <p className="text-xs text-[color:var(--color-ink-soft)]">{t.mailHint}</p>
              </>
            ) : <p className="text-xs text-[color:var(--color-ink-soft)]">{t.noEmail}</p>}
            {employer && <a className="btn-outline inline-flex" href={employer} target="_blank" rel="noreferrer noopener">{t.employer} ↗</a>}
            {active && x.status === "SAVED" && <div><button className="btn-ghost" disabled={!!busy} onClick={() => patch({ status: "APPLIED" }, "status")}>✓ {t.markApplied}</button></div>}
          </div>
        </div>
      </details>

      <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block text-xs">{t.notes}
          <textarea className="input min-h-16" value={notes} placeholder={t.notesPh} disabled={!active} maxLength={4000} onChange={(e) => setNotes(e.target.value)} onBlur={() => notes !== x.notes && patch({ notes }, "notes")} />
        </label>
        <div className="flex flex-col gap-2">
          {x.appliedAt && active && (
            <label className="text-xs">{fillIn(t.appliedOn, { date: "" }).trim()}
              <input type="date" className="input py-1" defaultValue={x.appliedAt.slice(0, 10)} onChange={(e) => e.target.value && patch({ appliedAt: e.target.value }, "date")} />
            </label>
          )}
          {active && <button className="btn-ghost text-xs" onClick={remove}>{t.remove}</button>}
        </div>
      </div>
      {msg && <p className={`text-xs rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
    </li>
  );
}
