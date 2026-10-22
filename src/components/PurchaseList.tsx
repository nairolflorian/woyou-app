"use client";

import { useState } from "react";

type Purchase = { id: string; label: string; status: string; open: boolean; createdAt: string };

// Käufe nach dem Startpaket (Verlängerung, Abo) mit „als bezahlt markieren“ für Admins (z. B. Überweisung)
export function PurchaseList(p: { purchases: Purchase[]; isAdmin: boolean }) {
  const [msg, setMsg] = useState<string | null>(null);
  async function paid(id: string) {
    if (!confirm("Zahlung eingegangen? Dann wird das Werkzeug verlängert bzw. das Abo aktiv.")) return;
    const r = await fetch(`/api/admin/purchases/${id}/paid`, { method: "POST" });
    if (r.ok) window.location.reload(); else setMsg("Das hat nicht geklappt.");
  }
  if (!p.purchases.length) return <p className="text-sm text-[color:var(--color-ink-soft)]">Keine weiteren Käufe.</p>;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {p.purchases.map((x) => (
        <span key={x.id} className="rounded-full bg-slate-100 px-2.5 py-1">
          {x.label} · {x.createdAt} · {x.status}
          {p.isAdmin && x.open && <button className="ml-2 underline" onClick={() => paid(x.id)}>als bezahlt markieren</button>}
        </span>
      ))}
      {msg && <span className="text-rose-700">{msg}</span>}
    </div>
  );
}
