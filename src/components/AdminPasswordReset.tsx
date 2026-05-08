"use client";

import { useState } from "react";

export function AdminPasswordReset({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false);
  const [pwd, setPwd] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    if (
      !confirm(
        "Wirklich Passwort zurücksetzen? Das aktuelle Passwort wird sofort ungültig."
      )
    )
      return;
    setBusy(true);
    setErr(null);
    setPwd(null);
    const r = await fetch(`/api/admin/users/${userId}/reset-password`, {
      method: "POST",
    });
    const d = await r.json();
    setBusy(false);
    if (!r.ok) {
      setErr(d.error ?? "Fehler");
      return;
    }
    setPwd(d.password);
  }

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={go}
        className="btn-outline w-full text-xs"
      >
        {busy ? "…" : "🔑 Passwort zurücksetzen"}
      </button>
      {pwd && (
        <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm">
          <div className="font-semibold text-emerald-900">Neues Passwort:</div>
          <code className="mt-1 block bg-white px-2 py-1 rounded font-mono select-all break-all">
            {pwd}
          </code>
          <p className="mt-2 text-xs text-emerald-900">
            Kopiere es jetzt — es wird nicht erneut angezeigt.
          </p>
        </div>
      )}
      {err && (
        <p className="mt-2 text-xs text-rose-700">{err}</p>
      )}
    </div>
  );
}
