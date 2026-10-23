"use client";

import { useState } from "react";
import { fillIn } from "@/lib/werkzeug-text";
import { versandText } from "@/lib/versand-text";

// Eigene E-Mail-Adresse für Bewerbungen (Standard: Login-Mail). Nur die Adresse, kein Passwort, kein Postfach-Zugang.
export function VersandAdresse({ locale, initial, loginEmail }: { locale: string; initial: string | null; loginEmail: string | null }) {
  const v = versandText(locale);
  const [email, setEmail] = useState(initial ?? "");
  const [current, setCurrent] = useState(initial || loginEmail || "");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await fetch("/api/account/bewerbungsmail", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Fehler" }); return; }
    setCurrent(j.email); setMsg({ ok: true, t: v.profileSaved });
  }

  return (
    <form onSubmit={save} className="space-y-2 text-sm">
      <p className="text-[color:var(--color-ink-soft)]">{v.profileLead}</p>
      <div className="flex flex-wrap gap-2">
        <input type="email" inputMode="email" autoComplete="email" className="input flex-1 min-w-56" value={email} maxLength={200}
          placeholder={loginEmail ? fillIn(v.profilePh, { email: loginEmail }) : ""} onChange={(e) => setEmail(e.target.value.trim())} aria-label={v.profileHead} />
        <button className="btn-primary" disabled={busy}>{v.profileSave}</button>
      </div>
      {current && <p className="text-xs text-[color:var(--color-ink-soft)]">{fillIn(v.profileNow, { email: current })}</p>}
      {msg && <p className={`text-xs rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
    </form>
  );
}
