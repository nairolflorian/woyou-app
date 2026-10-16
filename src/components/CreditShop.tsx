"use client";

import { useState } from "react";

// Nachkauf (25 für 149 €) oder Abo (unbegrenzt für 50 €/Monat); Kündigungsknopf fürs Abo
export function CreditShop(p: { unlimited: boolean; until: string | null; cancelling: boolean; packPrice: string; aboPrice: string; stripe: boolean }) {
  const [kind, setKind] = useState<"PACK_25" | "SUBSCRIPTION" | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    const r = await fetch("/api/credits/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, acceptTerms: f.get("terms") === "on", acceptWaiver: f.get("waiver") === "on" }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Das hat nicht geklappt." }); return; }
    if (j.url) { window.location.href = j.url; return; }
    setKind(null); setMsg({ ok: true, t: "Danke! Wir haben deine Bestellung erhalten und schicken dir den Link zur Zahlung." });
  }
  async function cancel() {
    setBusy(true);
    const r = await fetch("/api/credits/cancel", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false); setConfirmCancel(false);
    setMsg(r.ok ? { ok: true, t: `Dein Abo ist gekündigt. Du kannst bis ${j.until} weiter unbegrenzt bewerben lassen.` } : { ok: false, t: j.error ?? "Fehler" });
  }

  return (
    <div className="space-y-3">
      {!p.unlimited && (
        <div className="flex flex-wrap gap-2">
          <button className="btn-outline" onClick={() => setKind("PACK_25")}>25 weitere Bewerbungen · {p.packPrice}</button>
          <button className="btn-primary" onClick={() => setKind("SUBSCRIPTION")}>Unbegrenzt bewerben · {p.aboPrice} im Monat</button>
        </div>
      )}
      {kind && (
        <form onSubmit={buy} className="rounded-xl border border-[color:var(--color-border)] p-4 space-y-2 text-sm">
          <div className="font-semibold">{kind === "PACK_25" ? `25 weitere Bewerbungen für ${p.packPrice} (einmalig)` : `Unbegrenzt bewerben für ${p.aboPrice} im Monat (monatlich kündbar)`}</div>
          <label className="flex gap-2"><input type="checkbox" name="terms" required className="mt-1" /><span>Ich akzeptiere die <a href="/agb" target="_blank" className="underline">AGB</a> und habe die <a href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</a> gelesen.</span></label>
          <label className="flex gap-2"><input type="checkbox" name="waiver" required className="mt-1" /><span>Ich möchte, dass WoYou sofort weiter für mich bewirbt. Mir ist bekannt, dass ich bei einem Widerruf die bis dahin erbrachten Leistungen anteilig bezahle.</span></label>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{busy ? "…" : p.stripe ? "Zahlungspflichtig bestellen" : "Zahlungspflichtig bestellen (Zahlungslink folgt)"}</button>
            <button type="button" className="btn-ghost" onClick={() => setKind(null)}>Abbrechen</button>
          </div>
        </form>
      )}
      {p.unlimited && !p.cancelling && (
        confirmCancel ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Abo wirklich kündigen? Es läuft bis {p.until}.</span>
            <button className="btn-primary" disabled={busy} onClick={cancel}>Jetzt kündigen</button>
            <button className="btn-ghost" onClick={() => setConfirmCancel(false)}>Nein</button>
          </div>
        ) : <button className="btn-outline" onClick={() => setConfirmCancel(true)}>Verträge hier kündigen</button>
      )}
      {p.unlimited && p.cancelling && <p className="text-sm text-[color:var(--color-ink-soft)]">Abo gekündigt, läuft bis {p.until}.</p>}
      {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
    </div>
  );
}
