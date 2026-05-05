"use client";

import { useState } from "react";

export function LoginForm() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Fehler");
      return;
    }
    window.location.href = data.next ?? "/profil";
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div>
        <label className="label">E-Mail / Telefon / Telegram-ID</label>
        <input
          className="input"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          autoComplete="username"
        />
      </div>
      <div>
        <label className="label">Passwort</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error === "NOT_FOUND" && "Kein Konto gefunden."}
          {error === "WRONG_PASSWORD" && "Falsches Passwort."}
          {error === "INVALID" && "Eingabe unvollständig."}
          {!["NOT_FOUND", "WRONG_PASSWORD", "INVALID"].includes(error) && error}
        </div>
      )}
      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "…" : "Anmelden"}
      </button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[color:var(--color-border)]"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-3 text-[color:var(--color-ink-soft)]">
            oder demo-weise
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled
          className="btn-outline opacity-60 cursor-not-allowed"
          title="Demo-Button"
        >
          🔵 Google
        </button>
        <button
          type="button"
          disabled
          className="btn-outline opacity-60 cursor-not-allowed"
          title="Demo-Button"
        >
          📘 Facebook
        </button>
        <button
          type="button"
          disabled
          className="btn-outline opacity-60 cursor-not-allowed col-span-2"
          title="Demo-Button"
        >
          ✈️ Telegram-Login
        </button>
      </div>
      <p className="text-xs text-[color:var(--color-ink-soft)] text-center">
        OAuth-Buttons sind Demo-Platzhalter (Phase 2). Telegram-Login funktioniert
        bereits über den Bot — siehe Startseite.
      </p>
    </form>
  );
}
