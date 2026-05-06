"use client";

import { useEffect, useRef, useState } from "react";

type Doc = {
  id: string;
  kind: string;
  filename: string;
  originalName: string;
  size: number;
  mime: string;
  uploadedAt: string;
};

const KIND_LABEL: Record<string, string> = {
  cv: "Lebenslauf",
  passport: "Reisepass",
  diploma: "Diplom / Abschluss",
  certificate: "Zertifikat",
  other: "Sonstiges",
};

export function DocumentUpload({ candidateId }: { candidateId: string }) {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [kind, setKind] = useState("cv");
  const inputRef = useRef<HTMLInputElement>(null);

  async function refresh() {
    const r = await fetch("/api/candidate/documents");
    const d = await r.json();
    if (d.ok) setDocs(d.documents);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", kind);
    const r = await fetch("/api/candidate/documents", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.message ?? d.error ?? "Upload fehlgeschlagen");
      return;
    }
    setDocs((cur) => [...cur, d.document]);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function remove(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    const r = await fetch(`/api/candidate/documents?id=${id}`, { method: "DELETE" });
    if (r.ok) setDocs((cur) => cur.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="label">Dokumenttyp</label>
          <select
            className="select"
            value={kind}
            onChange={(e) => setKind(e.target.value)}
          >
            {Object.entries(KIND_LABEL).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[220px]">
          <label className="label">Datei (PDF / JPG / PNG, max. 5 MB)</label>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            disabled={busy}
            className="input"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </div>
      </div>
      {err && (
        <p className="mt-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded p-2">
          {err}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {docs.length === 0 ? (
          <p className="text-sm text-[color:var(--color-ink-soft)]">
            Noch keine Dokumente hochgeladen.
          </p>
        ) : (
          docs.map((d) => (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[color:var(--color-border)] p-3 text-sm"
            >
              <div>
                <div className="font-semibold">
                  {KIND_LABEL[d.kind] ?? d.kind} — {d.originalName}
                </div>
                <div className="text-xs text-[color:var(--color-ink-soft)]">
                  {(d.size / 1024).toFixed(0)} KB · hochgeladen{" "}
                  {new Date(d.uploadedAt).toLocaleString("de-DE")}
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  className="btn-outline text-xs"
                  href={`/api/documents/${candidateId}/${d.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ansehen
                </a>
                <button
                  onClick={() => remove(d.id)}
                  className="rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 font-semibold px-3 py-1 text-xs"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
