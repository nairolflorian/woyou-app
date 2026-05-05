"use client";

import { useState } from "react";

export function ConsentButtons({ matchId }: { matchId: string }) {
  const [busy, setBusy] = useState(false);

  async function decide(action: "approve" | "decline") {
    setBusy(true);
    const res = await fetch(`/api/candidate/matches/${matchId}/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (res.ok) window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => decide("approve")}
        disabled={busy}
        className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-sm disabled:opacity-60"
      >
        Zustimmen
      </button>
      <button
        onClick={() => decide("decline")}
        disabled={busy}
        className="rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold px-4 py-2 text-sm disabled:opacity-60"
      >
        Ablehnen
      </button>
    </div>
  );
}
