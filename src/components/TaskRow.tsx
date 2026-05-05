"use client";

import Link from "next/link";
import { useState } from "react";

const KIND_LABEL: Record<string, string> = {
  VISA: "Visum",
  DOCUMENT_CHECK: "Dokumente prüfen",
  VERIFICATION: "Identität verifizieren",
  CONTACT: "Kontakt aufnehmen",
  OTHER: "Sonstiges",
};

export function TaskRow({
  id,
  kind,
  title,
  status,
  candidateName,
  candidateId,
  companyName,
  companyId,
}: {
  id: string;
  kind: string;
  title: string;
  status: string;
  candidateName: string | null;
  candidateId: string | null;
  companyName: string | null;
  companyId: string | null;
}) {
  const [s, setS] = useState(status);
  const [busy, setBusy] = useState(false);

  async function update(next: string) {
    setBusy(true);
    const res = await fetch("/api/admin/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: next }),
    });
    setBusy(false);
    if (res.ok) setS(next);
  }

  return (
    <div className="card flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xs uppercase font-bold text-[color:var(--color-brand)] tracking-widest">
          {KIND_LABEL[kind] ?? kind}
        </div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-[color:var(--color-ink-soft)]">
          {candidateName && (
            <>
              Kandidat:{" "}
              <Link href={`/admin/kandidaten/${candidateId}`} className="text-[color:var(--color-brand)]">
                {candidateName}
              </Link>
            </>
          )}
          {candidateName && companyName && " · "}
          {companyName && (
            <>
              Firma:{" "}
              <Link href={`/admin/firmen/${companyId}`} className="text-[color:var(--color-brand)]">
                {companyName}
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={s}
          disabled={busy}
          onChange={(e) => update(e.target.value)}
          className="select max-w-[160px]"
        >
          <option value="OPEN">Offen</option>
          <option value="IN_PROGRESS">In Arbeit</option>
          <option value="DONE">Erledigt</option>
        </select>
      </div>
    </div>
  );
}
