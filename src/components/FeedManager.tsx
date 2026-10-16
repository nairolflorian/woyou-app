"use client";

import { useState } from "react";

type Feed = { id: string; name: string; kind: string; slug: string; active: boolean; lastCount: number | null; lastError: string | null; checkedAt: string | null };

export function FeedManager({ feeds }: { feeds: Feed[] }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    const r = await fetch("/api/admin/feeds", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: f.get("name"), url: f.get("url") }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Fehler" }); return; }
    window.location.reload();
  }
  async function toggle(f: Feed) { await fetch(`/api/admin/feeds/${f.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !f.active }) }); window.location.reload(); }
  async function remove(f: Feed) { if (!confirm(`${f.name} entfernen?`)) return; await fetch(`/api/admin/feeds/${f.id}`, { method: "DELETE" }); window.location.reload(); }
  return (
    <div className="space-y-4">
      <form onSubmit={add} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
        <input name="name" className="input" placeholder="Arbeitgeber, z. B. Pflegedienst Muster" required />
        <input name="url" className="input" placeholder="Link der Karriereseite (Personio, Greenhouse oder Lever)" required />
        <button className="btn-primary" disabled={busy}>{busy ? "Prüfe …" : "Hinzufügen"}</button>
      </form>
      {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
      {feeds.length === 0 ? <p className="text-sm text-[color:var(--color-ink-soft)]">Noch keine Karriereseiten hinterlegt.</p> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-[color:var(--color-ink-soft)]"><th className="py-1">Arbeitgeber</th><th>Anbieter</th><th>Stellen</th><th>zuletzt geprüft</th><th></th></tr></thead>
          <tbody>{feeds.map((f) => (
            <tr key={f.id} className={`border-t ${f.active ? "" : "opacity-50"}`}>
              <td className="py-2 font-semibold">{f.name}<div className="text-xs font-normal text-[color:var(--color-ink-soft)]">{f.slug}</div></td>
              <td>{f.kind.charAt(0) + f.kind.slice(1).toLowerCase()}</td>
              <td>{f.lastError ? <span className="text-rose-700">{f.lastError}</span> : f.lastCount ?? "–"}</td>
              <td>{f.checkedAt ?? "–"}</td>
              <td className="whitespace-nowrap"><button className="btn-ghost py-1" onClick={() => toggle(f)}>{f.active ? "Pausieren" : "Aktivieren"}</button><button className="btn-ghost py-1 text-rose-700" onClick={() => remove(f)}>Entfernen</button></td>
            </tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}
