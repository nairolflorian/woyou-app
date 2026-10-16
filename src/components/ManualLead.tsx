"use client";

import { useState } from "react";

// Stelle von Hand erfassen (z. B. aus StepStone/Indeed, von Partnern oder Initiativbewerbung)
export function ManualLead({ bookingId }: { bookingId: string }) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const val = (k: string) => (String(f.get(k) || "").trim() || null);
    const r = await fetch(`/api/admin/bookings/${bookingId}/leads`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source: "MANUAL", title: val("title"), company: val("company"), city: val("city"), url: val("url"), email: val("email") }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error ?? "Fehler"); return; }
    window.location.reload();
  }
  if (!open) return <button className="btn-outline" onClick={() => setOpen(true)}>+ Stelle manuell hinzufügen</button>;
  return (
    <form onSubmit={submit} className="card grid gap-3 md:grid-cols-2">
      <h3 className="font-semibold md:col-span-2">Stelle manuell hinzufügen</h3>
      <input name="title" className="input" placeholder="Stellentitel" required />
      <input name="company" className="input" placeholder="Firma" required />
      <input name="city" className="input" placeholder="Ort" />
      <input name="email" type="email" className="input" placeholder="Bewerbungs-E-Mail (falls vorhanden)" />
      <input name="url" type="url" className="input md:col-span-2" placeholder="Link zur Ausschreibung (https://…)" />
      {err && <p className="md:col-span-2 text-sm text-rose-700">{err}</p>}
      <div className="md:col-span-2 flex gap-2"><button className="btn-primary">Hinzufügen</button><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Abbrechen</button></div>
    </form>
  );
}
