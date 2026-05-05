"use client";

import { useState } from "react";

export function ProposeButton({
  candidateId,
  jobRequestId,
}: {
  candidateId: string;
  jobRequestId: string;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/matches/propose", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, jobRequestId }),
    });
    setBusy(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Fehler");
      return;
    }
    setDone(true);
    setTimeout(() => window.location.reload(), 800);
  }

  if (done) return <span className="text-xs text-emerald-700 font-semibold">Vorgeschlagen ✓</span>;

  return (
    <div>
      <button
        onClick={go}
        disabled={busy}
        className="mt-2 rounded-full bg-[color:var(--color-brand)] hover:bg-[color:var(--color-brand-dark)] text-white font-semibold px-4 py-1.5 text-xs disabled:opacity-60"
      >
        {busy ? "…" : "Vorschlagen"}
      </button>
      {error && <p className="text-[10px] text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
