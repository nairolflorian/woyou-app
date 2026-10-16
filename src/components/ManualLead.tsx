"use client";

import { useState } from "react";
import { PORTALS, portalSearchLinks } from "@/lib/portals";

const mails = (t: string) => [...new Set((t.replace(/\s*[[(]at[\])]\s*/gi, "@").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((e) => e.toLowerCase()))];

// Stellen aus Portalen ohne Schnittstelle (Kleinanzeigen, StepStone, Indeed, LinkedIn, Firmenseiten):
// Suche mit einem Klick öffnen, Anzeige mit Link und Text übernehmen
export function ManualLead({ bookingId, was, wo }: { bookingId: string; was: string; wo: string }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => (String(f.get(k) || "").trim() || null);
    setBusy(true); setErr(null);
    const r = await fetch(`/api/admin/bookings/${bookingId}/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: val("portal") ?? "MANUAL", title: val("title"), company: val("company"), city: val("city"), url: val("url"), email: val("email"), description: val("description") }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setErr(j.error ?? "Fehler"); return; }
    window.location.reload();
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-[color:var(--color-ink-soft)]">Weitere Portale durchsuchen:</span>
        {portalSearchLinks(was, wo).map((p) => <a key={p.key} href={p.href} target="_blank" rel="noreferrer" className="btn-ghost py-1 underline">{p.label} ↗</a>)}
        {!open && <button className="btn-outline py-1" onClick={() => setOpen(true)}>+ Stelle übernehmen</button>}
      </div>
      {open && (
        <form onSubmit={submit} className="card grid gap-3 md:grid-cols-2">
          <h3 className="font-semibold md:col-span-2">Stelle aus einem Portal übernehmen</h3>
          <select name="portal" className="input" defaultValue="KLEINANZEIGEN">{Object.entries(PORTALS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <input name="url" type="url" className="input" placeholder="Link zur Anzeige (https://…)" />
          <input name="title" className="input" placeholder="Stellentitel" required />
          <input name="company" className="input" placeholder="Firma bzw. Anbieter" required />
          <input name="city" className="input" placeholder="Ort" />
          <input name="email" type="email" className="input" placeholder="Bewerbungs-E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="md:col-span-2">
            <textarea name="description" className="input min-h-28" maxLength={20000} placeholder="Anzeigentext hier einfügen (für ein passendes Anschreiben; E-Mail-Adressen werden erkannt)" onChange={(e) => { if (!email) { const m = mails(e.target.value); if (m[0]) setEmail(m[0]); } }} />
            <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">Bei Kleinanzeigen steht oft keine E-Mail in der Anzeige. Dann über das Kontaktformular des Portals bewerben und die Stelle als „Über Firmenseite beworben“ markieren.</p>
          </div>
          {err && <p className="md:col-span-2 text-sm text-rose-700">{err}</p>}
          <div className="md:col-span-2 flex gap-2"><button className="btn-primary" disabled={busy}>{busy ? "…" : "Übernehmen"}</button><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Abbrechen</button></div>
        </form>
      )}
    </div>
  );
}
