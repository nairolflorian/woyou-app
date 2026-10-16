"use client";

import { useState } from "react";

type Purchase = { id: string; kind: string; label: string; status: string; createdAt: string };

// Guthaben, Käufe und „Jetzt bewerben“ (freigegebene Stellen automatisch per Mail bewerben)
export function ApplyPanel(p: { bookingId: string; balance: number; unlimited: boolean; until: string | null; ready: number; readyNoEmail: number; canSend: boolean; reason: string | null; isAdmin: boolean; purchases: Purchase[] }) {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);

  async function apply() {
    const n = p.unlimited ? p.ready : Math.min(p.ready, p.balance);
    if (!confirm(`Jetzt ${n} Bewerbung${n === 1 ? "" : "en"} per Mail verschicken? Jede Firma bekommt Anschreiben und Lebenslauf, der Kunde eine Kopie.`)) return;
    setBusy(true); setMsg({ ok: true, t: "Bewerbungen werden verschickt …" });
    const r = await fetch(`/api/admin/bookings/${p.bookingId}/apply`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? "Fehler" }); return; }
    const parts = [`${j.sent} verschickt.`];
    if (j.stoppedNoCredit) parts.push("Gestoppt: Guthaben aufgebraucht.");
    if (j.noEmail?.length) parts.push(`${j.noEmail.length} ohne E-Mail übersprungen (über Firmenseite bewerben).`);
    if (j.failed?.length) parts.push(`Fehler: ${j.failed.map((f: { title: string; error: string }) => `${f.title}: ${f.error}`).join("; ")}`);
    setMsg({ ok: !j.failed?.length, t: parts.join(" ") });
    setTimeout(() => window.location.reload(), 2500);
  }
  async function grant() {
    const n = Number(prompt("Wie viele Bewerbungen gutschreiben? (negativ = abziehen)", "25"));
    const note = n ? prompt("Grund (z. B. Überweisung, Kulanz)") : null;
    if (!n || !note) return;
    const r = await fetch(`/api/admin/bookings/${p.bookingId}/credits`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ delta: n, note }) });
    if (r.ok) window.location.reload(); else setMsg({ ok: false, t: "Gutschrift nicht möglich." });
  }
  async function paid(id: string) {
    if (!confirm("Zahlung eingegangen? Dann wird das Guthaben bzw. Abo freigeschaltet.")) return;
    const r = await fetch(`/api/admin/purchases/${id}/paid`, { method: "POST" });
    if (r.ok) window.location.reload();
  }

  return (
    <section className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-[color:var(--color-ink-soft)]">Guthaben</div>
          <div className="text-2xl font-bold">{p.unlimited ? "Unbegrenzt (Abo)" : `${p.balance} Bewerbung${p.balance === 1 ? "" : "en"}`}</div>
          {p.unlimited && p.until && <div className="text-xs text-[color:var(--color-ink-soft)]">bezahlt bis {p.until}</div>}
        </div>
        <div className="text-right">
          <button className="btn-primary" disabled={busy || !p.canSend || p.ready === 0 || (!p.unlimited && p.balance < 1)} onClick={apply} title={p.reason ?? ""}>
            {busy ? "Sende …" : `Jetzt bewerben (${p.ready} freigegeben)`}
          </button>
          <div className="mt-1 text-xs text-[color:var(--color-ink-soft)]">
            {p.reason ?? (p.ready === 0 ? "Erst Stellen übernehmen, Anschreiben prüfen und „Freigeben“ klicken." : !p.unlimited && p.balance < p.ready ? `Guthaben reicht für ${p.balance}.` : "Geht an die E-Mail aus der Ausschreibung, Kopie an den Kunden.")}
            {p.readyNoEmail > 0 && ` ${p.readyNoEmail} freigegebene ohne E-Mail: bitte über die Firmenseite bewerben.`}
          </div>
        </div>
      </div>
      {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
      {(p.purchases.length > 0 || p.isAdmin) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {p.purchases.map((x) => (
            <span key={x.id} className="rounded-full bg-slate-100 px-2.5 py-1">
              {x.label} · {x.createdAt} · {x.status}
              {p.isAdmin && (x.status === "REQUESTED" || x.status === "PENDING_PAYMENT") && <button className="ml-2 underline" onClick={() => paid(x.id)}>als bezahlt markieren</button>}
            </span>
          ))}
          {p.isAdmin && <button className="btn-ghost py-0.5 text-xs" onClick={grant}>Gutschrift / Korrektur</button>}
        </div>
      )}
    </section>
  );
}
