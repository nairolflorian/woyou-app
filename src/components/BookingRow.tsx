"use client";

import Link from "next/link";
import { useState } from "react";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/services";

type Props = {
  id: string; status: string; applicationsSent: number; applicationsGoal: number; adminNote: string | null;
  candidateId: string; candidateName: string; email: string | null; phone: string | null;
  jobs: string | null; regions: string | null; notes: string | null; price: string; createdAt: string; paidAt: string | null;
};

export function BookingRow(p: Props) {
  const [status, setStatus] = useState(p.status);
  const [sent, setSent] = useState(p.applicationsSent);
  const [note, setNote] = useState(p.adminNote ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(patch: Record<string, unknown>) {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: p.id, ...patch }) });
    setBusy(false);
    setMsg(res.ok ? "Gespeichert" : "Fehler beim Speichern");
  }

  const label = BOOKING_STATUS_LABEL[status as BookingStatus];
  const pct = Math.min(100, Math.round((sent / p.applicationsGoal) * 100));

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/admin/kandidaten/${p.candidateId}`} className="font-semibold text-[color:var(--color-brand)]">{p.candidateName}</Link>
          <div className="text-xs text-[color:var(--color-ink-soft)]">{p.email ?? "–"} · {p.phone ?? "–"}</div>
          <div className="text-xs text-[color:var(--color-ink-soft)]">Gebucht {p.createdAt}{p.paidAt ? ` · bezahlt ${p.paidAt}` : ""} · {p.price}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label?.color ?? ""}`}>{label?.de ?? status}</span>
      </div>
      <div className="text-sm"><strong>Berufe:</strong> {p.jobs || "–"} · <strong>Region:</strong> {p.regions || "–"}{p.notes ? <><br /><strong>Hinweis:</strong> {p.notes}</> : null}</div>
      <div>
        <div className="flex justify-between text-xs mb-1"><span>Bewerbungen verschickt</span><span>{sent} / {p.applicationsGoal}</span></div>
        <div className="h-2 rounded bg-slate-100 overflow-hidden"><div className="h-full bg-[color:var(--color-brand)]" style={{ width: `${pct}%` }} /></div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs">Status<br />
          <select className="input py-1" value={status} disabled={busy} onChange={(e) => { setStatus(e.target.value); save({ status: e.target.value }); }}>
            {Object.entries(BOOKING_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v.de}</option>)}
          </select>
        </label>
        <label className="text-xs">Verschickt<br />
          <input type="number" min={0} max={500} className="input py-1 w-24" value={sent} disabled={busy} onChange={(e) => setSent(Number(e.target.value))} onBlur={() => save({ applicationsSent: sent })} />
        </label>
        <button type="button" className="btn-outline py-1" disabled={busy || sent >= p.applicationsGoal} onClick={() => { const n = sent + 1; setSent(n); save({ applicationsSent: n }); }}>+1 verschickt</button>
      </div>
      <label className="block text-xs">Interne Notiz
        <textarea className="input min-h-16" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (p.adminNote ?? "") && save({ adminNote: note })} />
      </label>
      {msg && <div className="text-xs text-[color:var(--color-ink-soft)]">{msg}</div>}
    </div>
  );
}
