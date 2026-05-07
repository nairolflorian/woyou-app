"use client";

import { useState } from "react";
import { useT } from "@/components/TranslationProvider";

const CONFIRM_WORDS: Record<string, string> = {
  de: "LÖSCHEN",
  en: "DELETE",
  fr: "SUPPRIMER",
  ar: "حذف",
  es: "ELIMINAR",
  ru: "УДАЛИТЬ",
  uk: "ВИДАЛИТИ",
};

export function AccountControls() {
  const { t, locale } = useT();
  const confirmWord = CONFIRM_WORDS[locale] ?? CONFIRM_WORDS.de;
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setErr(null);
    const r = await fetch("/api/account/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    setBusy(false);
    if (r.ok) {
      window.location.href = "/?deleted=1";
      return;
    }
    const d = await r.json().catch(() => ({}));
    setErr(d.error ?? t("common.error_generic"));
  }

  return (
    <div className="space-y-4">
      <div>
        <a href="/api/account/export" className="btn-outline" download>
          {t("acc.export_btn")}
        </a>
        <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
          {t("acc.export_hint")}
        </p>
      </div>

      <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
        <h3 className="font-semibold text-rose-900">{t("acc.delete_h")}</h3>
        <p className="text-sm text-rose-900 mt-1">{t("acc.delete_desc")}</p>
        <p className="mt-3 text-sm text-rose-900">
          {t("acc.delete_confirm_prefix")}{" "}
          <code className="bg-white px-1.5 py-0.5 rounded font-mono">{confirmWord}</code>{" "}
          {t("acc.delete_confirm_suffix")}
        </p>
        <input
          className="input mt-2 max-w-xs"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder={confirmWord}
        />
        <button
          onClick={deleteAccount}
          disabled={busy || confirm !== confirmWord}
          className="mt-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-semibold px-5 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? t("acc.deleting") : t("acc.delete_btn")}
        </button>
        {err && <p className="mt-2 text-sm text-rose-700">{err}</p>}
      </div>
    </div>
  );
}
