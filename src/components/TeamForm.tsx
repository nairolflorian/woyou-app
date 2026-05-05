"use client";

import { useState } from "react";

export function TeamForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("ADMIN");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg(data.error ?? "Fehler");
      return;
    }
    setMsg("Angelegt ✓");
    setEmail("");
    setPassword("");
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">E-Mail</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label">Passwort</label>
        <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label className="label">Rolle</label>
        <select className="select" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="ADMIN">Vermittler</option>
          <option value="SUPER_ADMIN">Super-Admin</option>
        </select>
      </div>
      <button className="btn-primary w-full" disabled={busy}>
        {busy ? "…" : "Anlegen"}
      </button>
      {msg && <p className="text-sm">{msg}</p>}
    </form>
  );
}
