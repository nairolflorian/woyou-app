"use client";

import { useEffect, useState } from "react";

export function VerifyPayment({ sessionId }: { sessionId: string }) {
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");

  useEffect(() => {
    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then((r) => r.json())
      .then((d) => setStatus(d.ok ? "ok" : "error"))
      .catch(() => setStatus("error"));
  }, [sessionId]);

  if (status === "pending")
    return <p className="mt-4 text-sm text-[color:var(--color-ink-soft)]">Zahlung wird geprüft…</p>;
  if (status === "error")
    return (
      <p className="mt-4 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-3">
        Wir konnten die Zahlung nicht verifizieren. Bitte kontaktiere uns.
      </p>
    );
  return <p className="mt-4 text-sm text-emerald-700">Zahlung bestätigt ✓</p>;
}
