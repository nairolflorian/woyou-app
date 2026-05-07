"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/TranslationProvider";

type Doc = { id: string; kind: string; filename: string };

export function AvatarUpload({
  candidateId,
  initialFilename,
  initials,
}: {
  candidateId: string;
  initialFilename: string | null;
  initials: string;
}) {
  const { t } = useT();
  const [filename, setFilename] = useState<string | null>(initialFilename);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cache-bust on change so the new avatar shows immediately.
  const [version, setVersion] = useState(0);
  useEffect(() => {
    if (filename !== initialFilename) setVersion((v) => v + 1);
  }, [filename, initialFilename]);

  async function upload(file: File) {
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("kind", "avatar");
    const r = await fetch("/api/candidate/documents", { method: "POST", body: fd });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.message ?? t("doc.upload_failed"));
      return;
    }
    setFilename((d.document as Doc).filename);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex items-center gap-4">
      <div
        className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[color:var(--color-border)] bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] text-2xl font-bold flex items-center justify-center"
      >
        {filename ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/documents/${candidateId}/${filename}?v=${version}`}
            alt={t("doc.kind_avatar")}
            className="w-full h-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div>
        <label className="btn-outline cursor-pointer text-sm">
          {busy ? t("avatar.uploading") : filename ? t("avatar.replace") : t("avatar.upload")}
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            disabled={busy}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </label>
        <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">
          {t("avatar.hint")}
        </p>
        {err && <p className="mt-1 text-xs text-rose-700">{err}</p>}
      </div>
    </div>
  );
}

export function AvatarBubble({
  candidateId,
  filename,
  initials,
  size = 40,
}: {
  candidateId: string;
  filename: string | null;
  initials: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden flex-shrink-0 border border-[color:var(--color-border)] bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] font-bold flex items-center justify-center"
      style={{ width: size, height: size, fontSize: Math.round(size / 2.4) }}
    >
      {filename ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/documents/${candidateId}/${filename}`}
          alt=""
          className="w-full h-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initials}</span>
      )}
    </div>
  );
}
