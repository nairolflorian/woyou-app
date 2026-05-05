"use client";

import { useState } from "react";
import { CANDIDATE_STATUS, CANDIDATE_STATUS_LABEL } from "@/lib/enums";

const STATUSES = Object.values(CANDIDATE_STATUS);

export function CandidateAdminActions({
  candidateId,
  currentStatus,
}: {
  candidateId: string;
  currentStatus: string;
}) {
  const [status, setStatus] = useState(currentStatus);
  const [busy, setBusy] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskKind, setTaskKind] = useState("VISA");

  async function changeStatus(next: string) {
    setBusy(true);
    const res = await fetch(`/api/admin/candidates/${candidateId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setBusy(false);
    if (res.ok) {
      setStatus(next);
      window.location.reload();
    }
  }

  async function addTask() {
    setBusy(true);
    const res = await fetch(`/api/admin/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, title: taskTitle, kind: taskKind }),
    });
    setBusy(false);
    if (res.ok) {
      setTaskOpen(false);
      setTaskTitle("");
      window.location.reload();
    }
  }

  return (
    <div className="mt-3 space-y-3 text-sm">
      <div>
        <label className="label">Status setzen</label>
        <select
          className="select"
          value={status}
          onChange={(e) => changeStatus(e.target.value)}
          disabled={busy}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {CANDIDATE_STATUS_LABEL[s].de}
            </option>
          ))}
        </select>
      </div>

      {!taskOpen ? (
        <button onClick={() => setTaskOpen(true)} className="btn-outline w-full">
          + Aufgabe anlegen
        </button>
      ) : (
        <div className="space-y-2">
          <input
            className="input"
            placeholder="Titel"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          <select
            className="select"
            value={taskKind}
            onChange={(e) => setTaskKind(e.target.value)}
          >
            <option value="VISA">Visum</option>
            <option value="DOCUMENT_CHECK">Dokumente prüfen</option>
            <option value="VERIFICATION">Identität verifizieren</option>
            <option value="CONTACT">Kontakt aufnehmen</option>
            <option value="OTHER">Sonstiges</option>
          </select>
          <div className="flex gap-2">
            <button
              onClick={addTask}
              disabled={busy || !taskTitle.trim()}
              className="btn-primary flex-1"
            >
              Speichern
            </button>
            <button
              onClick={() => setTaskOpen(false)}
              className="btn-outline"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
