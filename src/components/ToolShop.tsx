"use client";

import { useState } from "react";
import { accountText, fill } from "@/lib/account-text";

type Kind = "TOOL_MONTH" | "TOOL_SUBSCRIPTION";

// Werkzeug verlängern (1 Monat einmalig) oder Monatsabo; Kündigungsknopf fürs Abo (§ 312k BGB)
export function ToolShop(p: { abo: "ACTIVE" | "CANCELLING" | null; until: string | null; monthPrice: string; aboPrice: string; stripe: boolean; locale: string }) {
  const a = accountText(p.locale);
  const [kind, setKind] = useState<Kind | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function buy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setMsg(null);
    const r = await fetch("/api/werkzeug/kaufen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, acceptTerms: f.get("terms") === "on", acceptWaiver: f.get("waiver") === "on" }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? a.failed }); return; }
    if (j.url) { window.location.href = j.url; return; }
    setKind(null); setMsg({ ok: true, t: a.ordered });
  }
  async function cancel() {
    setBusy(true);
    const r = await fetch("/api/werkzeug/kuendigen", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false); setConfirmCancel(false);
    setMsg(r.ok ? { ok: true, t: fill(a.cancelled, { date: j.until }) } : { ok: false, t: j.error ?? a.failed });
    if (r.ok) setTimeout(() => window.location.reload(), 1500);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button className="btn-outline" onClick={() => setKind("TOOL_MONTH")}>{a.month} · {p.monthPrice}</button>
        {!p.abo && <button className="btn-primary" onClick={() => setKind("TOOL_SUBSCRIPTION")}>{a.abo} · {p.aboPrice} {a.perMonth}</button>}
      </div>
      {kind && (
        <form onSubmit={buy} className="rounded-xl border border-[color:var(--color-border)] p-4 space-y-2 text-sm">
          <div className="font-semibold">{kind === "TOOL_MONTH" ? fill(a.monthTitle, { price: p.monthPrice }) : fill(a.aboTitle, { price: p.aboPrice })}</div>
          <label className="flex gap-2"><input type="checkbox" name="terms" required className="mt-1" /><span>{a.terms[0]}<a href="/agb" target="_blank" className="underline">{a.terms[1]}</a>{a.terms[2]}<a href="/datenschutz" target="_blank" className="underline">{a.terms[3]}</a>{a.terms[4]}</span></label>
          <label className="flex gap-2"><input type="checkbox" name="waiver" required className="mt-1" /><span>{a.waiver}</span></label>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>{busy ? "…" : p.stripe ? a.order : a.orderNoPay}</button>
            <button type="button" className="btn-ghost" onClick={() => setKind(null)}>{a.cancel}</button>
          </div>
        </form>
      )}
      {p.abo === "ACTIVE" && (
        confirmCancel ? (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>{fill(a.cancelAsk, { date: p.until ?? "" })}</span>
            <button className="btn-primary" disabled={busy} onClick={cancel}>{a.cancelNow}</button>
            <button className="btn-ghost" onClick={() => setConfirmCancel(false)}>{a.no}</button>
          </div>
        ) : <button className="btn-outline" onClick={() => setConfirmCancel(true)}>{a.cancelBtn}</button>
      )}
      {p.abo === "CANCELLING" && <p className="text-sm text-[color:var(--color-ink-soft)]">{fill(a.cancelling, { date: p.until ?? "" })}</p>}
      {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
    </div>
  );
}
