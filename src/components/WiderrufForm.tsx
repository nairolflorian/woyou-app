"use client";

import { useState } from "react";
import { RechtBestaetigung } from "@/components/RechtBestaetigung";

type Antwort = { betreff: string; zeilen: string[]; eingang: string };
const FELD: Record<string, string> = { name: "name", bookingRef: "bookingRef", email: "email", message: "message" };

// Formular „Vertrag widerrufen“ (ohne Anmeldung). Knopf genau: „Widerruf bestätigen“.
export function WiderrufForm({ knopf, defaults }: { knopf: string; defaults?: { name?: string; email?: string; bookingRef?: string } }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Antwort | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null); setFehler({});
    const res = await fetch("/api/recht/widerruf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(Object.keys(FELD).map((k) => [k, f.get(k) ?? ""]))),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Das hat nicht geklappt."); setFehler(data.fehler ?? {}); return; }
    setDone(data);
    window.scrollTo({ top: 0 });
  }

  if (done) return <RechtBestaetigung betreff={done.betreff} zeilen={done.zeilen} datei={`WoYou_Widerruf_${done.eingang.slice(0, 10)}.txt`} />;

  const err = (k: string) => fehler[k] ? <p className="mt-1 text-sm text-rose-700">{fehler[k]}</p> : null;
  return (
    <form onSubmit={submit} className="card mt-6 space-y-4" noValidate>
      <div><label className="label" htmlFor="name">Dein Name</label><input id="name" name="name" className="input" required maxLength={120} autoComplete="name" defaultValue={defaults?.name} />{err("name")}</div>
      <div><label className="label" htmlFor="bookingRef">Buchungsnummer oder E-Mail-Adresse deiner Buchung</label><input id="bookingRef" name="bookingRef" className="input" required maxLength={200} placeholder="z. B. WY-1A2B3C4D oder name@beispiel.de" defaultValue={defaults?.bookingRef} />{err("bookingRef")}</div>
      <div><label className="label" htmlFor="email">E-Mail-Adresse für die Bestätigung</label><input id="email" name="email" type="email" className="input" required maxLength={200} autoComplete="email" defaultValue={defaults?.email} />{err("email")}</div>
      <div><label className="label" htmlFor="message">Nachricht (optional)</label><textarea id="message" name="message" className="input min-h-24" maxLength={2000} />{err("message")}</div>
      {error && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "…" : knopf}</button>
    </form>
  );
}
