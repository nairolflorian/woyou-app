"use client";

import { useEffect, useState } from "react";
import { CANDIDATE_STATUS, CANDIDATE_STATUS_LABEL } from "@/lib/enums";

const STATUSES = Object.values(CANDIDATE_STATUS);

export function CandidateBulkBar() {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  const [showNotify, setShowNotify] = useState(false);
  const [status, setStatus] = useState<string>(CANDIDATE_STATUS.PAID_PLACEABLE);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyBody, setNotifyBody] = useState("");

  function selected(): string[] {
    return Array.from(
      document.querySelectorAll<HTMLInputElement>(
        'input[type="checkbox"][data-bulk-id]:checked'
      )
    ).map((el) => el.dataset.bulkId!);
  }

  function recount() {
    setCount(selected().length);
  }

  useEffect(() => {
    document.addEventListener("change", recount);
    return () => document.removeEventListener("change", recount);
  }, []);

  function selectAll(check: boolean) {
    document
      .querySelectorAll<HTMLInputElement>('input[type="checkbox"][data-bulk-id]')
      .forEach((el) => (el.checked = check));
    recount();
  }

  async function applyStatus() {
    const ids = selected();
    if (ids.length === 0) return;
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/admin/candidates/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "STATUS_SET", ids, status }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "Fehler");
      return;
    }
    window.location.reload();
  }

  async function applyNotify() {
    const ids = selected();
    if (ids.length === 0 || !notifyTitle.trim()) return;
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/admin/candidates/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "NOTIFY",
        ids,
        title: notifyTitle,
        body: notifyBody || undefined,
      }),
    });
    setBusy(false);
    if (!r.ok) {
      const d = await r.json().catch(() => ({}));
      setErr(d.error ?? "Fehler");
      return;
    }
    setShowNotify(false);
    setNotifyTitle("");
    setNotifyBody("");
    alert(`${ids.length} Kandidat:innen benachrichtigt.`);
  }

  return (
    <div className="sticky top-16 z-20 mt-4">
      <div
        className={`card flex flex-wrap items-center gap-3 transition ${
          count === 0 ? "opacity-60" : "border-[color:var(--color-brand)]"
        }`}
      >
        <span className="text-sm">
          <strong>{count}</strong> Kandidat:in{count === 1 ? "" : "nen"} ausgewählt
        </span>
        <button
          type="button"
          onClick={() => selectAll(true)}
          className="btn-ghost text-xs"
        >
          Alle auf der Seite
        </button>
        <button
          type="button"
          onClick={() => selectAll(false)}
          className="btn-ghost text-xs"
        >
          Keine
        </button>

        {count > 0 && (
          <>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowStatus((v) => !v);
                setShowNotify(false);
              }}
              className="btn-outline text-xs"
            >
              Status setzen
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setShowNotify((v) => !v);
                setShowStatus(false);
              }}
              className="btn-outline text-xs"
            >
              Benachrichtigung senden
            </button>
          </>
        )}

        {err && (
          <span className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded p-1">
            {err}
          </span>
        )}
      </div>

      {showStatus && count > 0 && (
        <div className="card mt-2 flex flex-wrap items-center gap-3">
          <select
            className="select max-w-[200px]"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {CANDIDATE_STATUS_LABEL[s].de}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={busy}
            onClick={applyStatus}
            className="btn-primary text-xs"
          >
            {busy ? "…" : `Auf ${count} anwenden`}
          </button>
        </div>
      )}

      {showNotify && count > 0 && (
        <div className="card mt-2 space-y-2">
          <input
            className="input"
            placeholder="Titel der Nachricht"
            value={notifyTitle}
            onChange={(e) => setNotifyTitle(e.target.value)}
          />
          <textarea
            className="textarea"
            placeholder="Text (optional)"
            value={notifyBody}
            onChange={(e) => setNotifyBody(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              disabled={busy || !notifyTitle.trim()}
              onClick={applyNotify}
              className="btn-primary text-xs"
            >
              {busy ? "…" : `An ${count} senden`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BulkCheckbox({ id }: { id: string }) {
  return (
    <input
      type="checkbox"
      data-bulk-id={id}
      className="w-4 h-4 cursor-pointer accent-[color:var(--color-brand)]"
      aria-label={`Auswählen ${id}`}
    />
  );
}
