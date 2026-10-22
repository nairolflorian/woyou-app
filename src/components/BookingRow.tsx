"use client";

import Link from "next/link";
import { useState } from "react";
import { BOOKING_STATUS_LABEL, type BookingStatus } from "@/lib/services";

type Props = {
  id: string; status: string; packageLabel: string; toolUntil: string | null; mappe: string; adminNote: string | null;
  candidateId: string; candidateName: string; email: string | null; phone: string | null;
  jobs: string | null; regions: string | null; notes: string | null; price: string; createdAt: string; paidAt: string | null;
};

export function BookingRow(p: Props) {
  const [status, setStatus] = useState(p.status);
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

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/admin/buchungen/${p.id}`} className="font-semibold text-[color:var(--color-brand)]">{p.candidateName} → Bearbeiten</Link>
          <div className="text-xs text-[color:var(--color-ink-soft)]">{p.email ?? "–"} · {p.phone ?? "–"}</div>
          <div className="text-xs text-[color:var(--color-ink-soft)]">Gebucht {p.createdAt}{p.paidAt ? ` · bezahlt ${p.paidAt}` : ""} · {p.price}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${label?.color ?? ""}`}>{label?.de ?? status}</span>
      </div>
      <div className="text-sm"><strong>Berufe:</strong> {p.jobs || "–"} · <strong>Region:</strong> {p.regions || "–"}{p.notes ? <><br /><strong>Hinweis:</strong> {p.notes}</> : null}</div>
      <div className="text-xs text-[color:var(--color-ink-soft)]">{p.packageLabel} · Mappe: {p.mappe} · Werkzeug: {p.toolUntil ? `bis ${p.toolUntil}` : "nicht freigeschaltet"}</div>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs">Status<br />
          <select className="input py-1" value={status} disabled={busy} onChange={(e) => { setStatus(e.target.value); save({ status: e.target.value }); }}>
            {Object.entries(BOOKING_STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v.de}</option>)}
          </select>
        </label>
      </div>
      <label className="block text-xs">Interne Notiz
        <textarea className="input min-h-16" value={note} maxLength={2000} onChange={(e) => setNote(e.target.value)} onBlur={() => note !== (p.adminNote ?? "") && save({ adminNote: note })} />
      </label>
      {msg && <div className="text-xs text-[color:var(--color-ink-soft)]">{msg}</div>}
    </div>
  );
}
