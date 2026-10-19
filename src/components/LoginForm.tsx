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
    const want = new URLSearchParams(window.location.search).get("next");
    window.location.href = want && want.startsWith("/") && !want.startsWith("//") ? want : data.next ?? "/profil";
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

    </form>
  );
}
