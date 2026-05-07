"use client";

import { useState } from "react";
import { useT } from "@/components/TranslationProvider";

export function LoginEditForm({
  initialEmail,
  initialPhone,
}: {
  initialEmail: string | null;
  initialPhone: string | null;
}) {
  const { t } = useT();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const payload: Record<string, string> = {};
    if (email && email !== initialEmail) payload.email = email;
    if (phone && phone !== initialPhone) payload.phone = phone;
    if (newPassword) {
      payload.newPassword = newPassword;
      payload.currentPassword = currentPassword;
    }
    if (Object.keys(payload).length === 0) {
      setBusy(false);
      return;
    }
    const r = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (r.ok) {
      setMsg({ kind: "ok", text: t("edit.saved") });
      setCurrentPassword("");
      setNewPassword("");
      return;
    }
    const d = await r.json().catch(() => ({}));
    const errorMap: Record<string, string> = {
      WRONG_CURRENT_PASSWORD: t("edit.err_wrong_password"),
      ALREADY_TAKEN: t("edit.err_taken"),
      NO_PASSWORD_SET: t("edit.err_no_password"),
      RATE_LIMITED: t("common.error_generic"),
    };
    setMsg({
      kind: "err",
      text: errorMap[d.error] ?? d.error ?? t("common.error_generic"),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <h3 className="font-semibold">{t("edit.h_login")}</h3>
      <p className="text-xs text-[color:var(--color-ink-soft)]">{t("edit.hint")}</p>

      <div>
        <label className="label">{t("edit.email")}</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div>
        <label className="label">{t("edit.phone")}</label>
        <input
          className="input"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className="label">{t("edit.current_password")}</label>
          <input
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="label">{t("edit.new_password")}</label>
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
      </div>
      <button className="btn-outline" disabled={busy}>
        {busy ? t("edit.saving") : t("edit.save")}
      </button>
      {msg && (
        <p
          className={`text-sm rounded p-2 ${
            msg.kind === "ok"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
