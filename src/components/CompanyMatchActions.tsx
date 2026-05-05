"use client";

import { useState } from "react";
import { MATCH_STATUS } from "@/lib/enums";

export function CompanyMatchActions({
  matchId,
  status,
}: {
  matchId: string;
  status: string;
}) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  async function decide(action: "interested" | "decline" | "hire", body?: string) {
    setBusy(true);
    const res = await fetch(`/api/company/matches/${matchId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, feedback: body ?? (feedback || undefined) }),
    });
    setBusy(false);
    if (res.ok) window.location.reload();
  }

  if (status === MATCH_STATUS.IN_CONVERSATION) {
    return (
      <a href={`/chat/${matchId}`} className="btn-primary text-sm">
        Chat öffnen
      </a>
    );
  }
  if (status === MATCH_STATUS.HIRED) {
    return <span className="text-sm text-emerald-700 font-semibold">Eingestellt ✓</span>;
  }
  if (status === MATCH_STATUS.COMPANY_DECLINED) {
    return <span className="text-sm text-rose-700">Abgelehnt</span>;
  }
  if (status === MATCH_STATUS.COMPANY_INTERESTED) {
    return (
      <div className="flex flex-wrap gap-2">
        <a href={`/chat/${matchId}`} className="btn-primary text-sm">
          Chat starten
        </a>
        <button
          onClick={() => decide("hire")}
          disabled={busy}
          className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 text-sm disabled:opacity-60"
        >
          Eingestellt markieren
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => decide("interested")}
          disabled={busy}
          className="btn-primary text-sm"
        >
          Interesse zeigen
        </button>
        <button
          onClick={() => setShowFeedback((v) => !v)}
          disabled={busy}
          className="btn-outline text-sm"
        >
          Ablehnen mit Feedback
        </button>
      </div>
      {showFeedback && (
        <div className="space-y-2">
          <textarea
            className="textarea text-sm"
            placeholder="Feedback (Pflicht): Warum passt es nicht?"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          <button
            onClick={() => decide("decline")}
            disabled={busy || !feedback.trim()}
            className="rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-2 text-sm disabled:opacity-60"
          >
            Ablehnen senden
          </button>
        </div>
      )}
    </div>
  );
}
