"use client";

import { useState } from "react";

export function MarketingRun() {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function run() {
    if (!confirm("Alle heute fälligen Mails jetzt verschicken?")) return;
    setBusy(true);
    const r = await fetch("/api/admin/marketing/run", { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    setMsg(r.ok ? `${j.sent} verschickt, ${j.failed} fehlgeschlagen.` : "Fehler");
  }
  return <div className="flex items-center gap-3"><button className="btn-outline" disabled={busy} onClick={run}>{busy ? "…" : "Jetzt ausführen"}</button>{msg && <span className="text-sm">{msg}</span>}</div>;
}
