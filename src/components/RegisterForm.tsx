"use client";

import { useState } from "react";

type Method = "email" | "phone";

export function RegisterForm() {
  const [method, setMethod] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Passwort muss mind. 6 Zeichen haben.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: method === "email" ? email : undefined,
        phone: method === "phone" ? phone : undefined,
        password,
        role: "CANDIDATE",
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.error === "ALREADY_REGISTERED"
          ? "Diese Adresse ist schon registriert."
          : data.error ?? "Fehler"
      );
      return;
    }
    window.location.href = data.next ?? "/profil";
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMethod("email")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            method === "email"
              ? "bg-[color:var(--color-brand)] text-white"
              : "bg-white border border-[color:var(--color-border)] text-[color:var(--color-ink-soft)]"
          }`}
        >
          📧 E-Mail
        </button>
        <button
          type="button"
          onClick={() => setMethod("phone")}
          className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
            method === "phone"
              ? "bg-[color:var(--color-brand)] text-white"
              : "bg-white border border-[color:var(--color-border)] text-[color:var(--color-ink-soft)]"
          }`}
        >
          📱 Telefon
        </button>
      </div>

      {method === "email" ? (
        <div>
          <label className="label">E-Mail</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
      ) : (
        <div>
          <label className="label">Telefonnummer (mit Ländercode)</label>
          <input
            className="input"
            type="tel"
            placeholder="+212 …"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            autoComplete="tel"
          />
        </div>
      )}

      <div>
        <label className="label">Passwort wählen (min. 6 Zeichen)</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "…" : "Konto anlegen & weiter zum Profil"}
      </button>

      <p className="text-xs text-[color:var(--color-ink-soft)] text-center">
        Mit „Konto anlegen" akzeptierst du die Demo-Bedingungen.
      </p>
    </form>
  );
}
