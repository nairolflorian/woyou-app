"use client";

import { useState } from "react";

export function RestoreButton({ userId }: { userId: string }) {
  const [busy, setBusy] = useState(false);
  async function go() {
    if (!confirm("Wirklich wiederherstellen?")) return;
    setBusy(true);
    const r = await fetch(`/api/admin/users/${userId}/restore`, { method: "POST" });
    setBusy(false);
    if (r.ok) window.location.reload();
  }
  return (
    <button
      type="button"
      disabled={busy}
      onClick={go}
      className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1 text-xs disabled:opacity-60"
    >
      {busy ? "…" : "Wiederherstellen"}
    </button>
  );
}
