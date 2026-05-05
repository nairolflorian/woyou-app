"use client";

import { useState } from "react";

export function UnlockButton({ fee }: { fee: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/payments/checkout", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Fehler beim Start der Bezahlung");
      setLoading(false);
      return;
    }
    if (data.demoMode) {
      window.location.href = data.url;
      return;
    }
    window.location.href = data.url;
  }

  return (
    <div className="mt-4">
      <button
        onClick={go}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-full bg-white text-[color:var(--color-brand)] font-semibold px-8 py-3 hover:bg-white/90 transition disabled:opacity-60"
      >
        {loading ? "…" : `Jetzt für ${fee} freischalten`}
      </button>
      {error && (
        <p className="mt-2 text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-white/80">
        Demo: Bezahlung läuft im <strong>Stripe-Testmodus</strong>. Falls kein
        Stripe-Key gesetzt ist, simulieren wir die Zahlung sofort.
      </p>
    </div>
  );
}
