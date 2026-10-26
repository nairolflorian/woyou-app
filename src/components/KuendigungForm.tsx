"use client";

import { useState } from "react";
import { RechtBestaetigung } from "@/components/RechtBestaetigung";

type Antwort = { betreff: string; zeilen: string[]; eingang: string };

// Bestätigungsseite nach § 312k BGB: Angaben eintragen, dann „jetzt kündigen“. Ohne Anmeldung.
export function KuendigungForm({ knopf, vertrag, heute, defaults }: { knopf: string; vertrag: string; heute: string; defaults?: { name?: string; email?: string; bookingRef?: string } }) {
  const [art, setArt] = useState<"ordentlich" | "ausserordentlich">("ordentlich");
  const [wirksam, setWirksam] = useState<"naechstmoeglich" | "datum">("naechstmoeglich");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fehler, setFehler] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Antwort | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true); setError(null); setFehler({});
    const body = { art, wirksam, grund: f.get("grund") ?? "", name: f.get("name") ?? "", email: f.get("email") ?? "", bookingRef: f.get("bookingRef") ?? "", vertrag: f.get("vertrag") ?? "", wirksamZu: f.get("wirksamZu") ?? "", bestaetigungEmail: f.get("bestaetigungEmail") ?? "" };
    const res = await fetch("/api/recht/kuendigung", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Das hat nicht geklappt."); setFehler(data.fehler ?? {}); return; }
    setDone(data);
    window.scrollTo({ top: 0 });
  }

  if (done) return <RechtBestaetigung betreff={done.betreff} zeilen={done.zeilen} datei={`WoYou_Kuendigung_${done.eingang.slice(0, 10)}.txt`} />;

  const err = (k: string) => fehler[k] ? <p className="mt-1 text-sm text-rose-700">{fehler[k]}</p> : null;
  return (
    <form onSubmit={submit} className="card mt-6 space-y-5" noValidate>
      <fieldset>
        <legend className="label">Art der Kündigung</legend>
        <label className="flex gap-3 text-sm"><input type="radio" name="art" value="ordentlich" checked={art === "ordentlich"} onChange={() => setArt("ordentlich")} /><span>Ordentliche Kündigung</span></label>
        <label className="mt-1 flex gap-3 text-sm"><input type="radio" name="art" value="ausserordentlich" checked={art === "ausserordentlich"} onChange={() => setArt("ausserordentlich")} /><span>Außerordentliche Kündigung (aus wichtigem Grund)</span></label>
        {err("art")}
      </fieldset>
      {art === "ausserordentlich" && (
        <div><label className="label" htmlFor="grund">Grund der außerordentlichen Kündigung</label><textarea id="grund" name="grund" className="input min-h-24" required maxLength={2000} />{err("grund")}</div>
      )}
      <div><label className="label" htmlFor="name">Dein Name</label><input id="name" name="name" className="input" required maxLength={120} autoComplete="name" defaultValue={defaults?.name} />{err("name")}</div>
      <div><label className="label" htmlFor="email">E-Mail-Adresse, mit der du gebucht hast</label><input id="email" name="email" type="email" className="input" required maxLength={200} autoComplete="email" defaultValue={defaults?.email} />{err("email")}</div>
      <div><label className="label" htmlFor="bookingRef">Buchungsnummer (optional)</label><input id="bookingRef" name="bookingRef" className="input" maxLength={60} placeholder="z. B. WY-1A2B3C4D" defaultValue={defaults?.bookingRef} />{err("bookingRef")}</div>
      <div><label className="label" htmlFor="vertrag">Welchen Vertrag möchtest du kündigen?</label><select id="vertrag" name="vertrag" className="input" defaultValue={vertrag}><option value={vertrag}>{vertrag}</option></select>{err("vertrag")}</div>
      <fieldset>
        <legend className="label">Wann soll die Kündigung wirken?</legend>
        <label className="flex gap-3 text-sm"><input type="radio" name="wirksam" value="naechstmoeglich" checked={wirksam === "naechstmoeglich"} onChange={() => setWirksam("naechstmoeglich")} /><span>Zum nächstmöglichen Zeitpunkt</span></label>
        <label className="mt-1 flex gap-3 text-sm"><input type="radio" name="wirksam" value="datum" checked={wirksam === "datum"} onChange={() => setWirksam("datum")} /><span>Zu einem bestimmten Datum</span></label>
        {wirksam === "datum" && <input name="wirksamZu" type="date" min={heute} className="input mt-2" required aria-label="Datum" />}
        {err("wirksam")}{err("wirksamZu")}
      </fieldset>
      <div><label className="label" htmlFor="bestaetigungEmail">E-Mail-Adresse für die Bestätigung</label><input id="bestaetigungEmail" name="bestaetigungEmail" type="email" className="input" required maxLength={200} defaultValue={defaults?.email} />{err("bestaetigungEmail")}</div>
      {error && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={busy}>{busy ? "…" : knopf}</button>
    </form>
  );
}
