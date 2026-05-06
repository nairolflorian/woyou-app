"use client";

import { useState } from "react";

export function AccountControls() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    setBusy(false);
    if (r.ok) {
      window.location.href = "/?deleted=1";
      return;
    }
    const d = await r.json().catch(() => ({}));
    setErr(d.error ?? "Fehler beim Löschen.");
  }

  return (
    <div className="space-y-4">
      <div>
        <a
          href="/api/account/export"
          className="btn-outline"
          download
        >
          📥 Meine Daten als JSON herunterladen
        </a>
        <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
          DSGVO Art. 15 / Art. 20 — vollständiger Export aller über dich gespeicherten Daten.
        </p>
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <h3 className="font-semibold text-rose-900">Account dauerhaft löschen</h3>
        <p className="text-sm text-rose-900 mt-1">
          DSGVO Art. 17 — alle deine Daten und Dokumente werden unwiderruflich
          entfernt. Aktive Vorschläge gehen verloren.
        </p>
        <p className="mt-3 text-sm text-rose-900">
          Tipp das Wort <code className="bg-white px-1.5 py-0.5 rounded font-mono">LÖSCHEN</code> um zu bestätigen:
        </p>
        <input
          className="input mt-2 max-w-xs"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="LÖSCHEN"
        />
        <button
          onClick={deleteAccount}
          disabled={busy || confirm !== "LÖSCHEN"}
          className="mt-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? "Lösche…" : "Account löschen"}
        </button>
        {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      </div>
    </div>
  );
}
