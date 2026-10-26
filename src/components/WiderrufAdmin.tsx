"use client";

import Link from "next/link";
import { useState } from "react";

type Buchung = { id: string; nummer: string; kunde: string; email: string | null; preis: string; amountCents: number; gebucht: string; bezahlt: string | null; status: string; mappe: string; stripe: boolean };
type Props = {
  id: string; status: string; adminNote: string | null; eingang: string; name: string; email: string; bookingRef: string; message: string | null;
  frist: string; fristUeberschritten: boolean; tageBisFrist: number;
  buchung: Buchung | null; vorschlag: { erstattungCents: number; anteilCents: number; regel: string } | null; stripeBereit: boolean;
  erstattet: { cents: number; betrag: string; am: string; refundId: string | null } | null;
};

const euro = (c: number) => (c / 100).toFixed(2).replace(".", ",");
const cents = (s: string) => { const n = Number(s.replace(/\s|€/g, "").replace(",", ".")); return Number.isFinite(n) ? Math.round(n * 100) : NaN; };

export function WiderrufAdminRow(p: Props) {
  const [betrag, setBetrag] = useState(p.vorschlag ? euro(p.vorschlag.erstattungCents) : "");
  const [note, setNote] = useState(p.adminNote ?? "");
  const [ref, setRef] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function call(method: "POST" | "PATCH", body: Record<string, unknown>, ok: string) {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/widerrufe/${p.id}`, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(data.error ?? "Fehler"); return; }
    setMsg(ok);
    window.location.reload();
  }
  function erstatten() {
    const c = cents(betrag);
    if (!Number.isInteger(c) || c < 0) { setMsg("Bitte einen gültigen Betrag eintragen."); return; }
    if (!window.confirm(c > 0 ? `${euro(c)} € über Stripe erstatten und die Buchung stornieren?` : "Nichts erstatten und die Buchung stornieren?")) return;
    void call("POST", { cents: c }, "Erstattet");
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{p.name}</div>
          <div className="text-xs text-[color:var(--color-ink-soft)]">Eingang {p.eingang} · Bestätigung an {p.email} · Angabe zur Buchung: {p.bookingRef}</div>
          {p.message && <div className="mt-1 text-sm">Nachricht: {p.message}</div>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.erstattet || p.status === "ERLEDIGT" ? "bg-emerald-100 text-emerald-800" : p.fristUeberschritten ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
          {p.erstattet ? "erstattet" : p.status === "ERLEDIGT" ? "erledigt" : p.fristUeberschritten ? `Frist überschritten (${p.frist})` : `Erstattung bis ${p.frist} (noch ${p.tageBisFrist} Tage)`}
        </span>
      </div>

      {p.buchung ? (
        <div className="text-sm rounded-lg bg-[color:var(--color-surface)] p-3">
          <Link href={`/admin/buchungen/${p.buchung.id}`} className="font-semibold text-[color:var(--color-brand)]">{p.buchung.nummer} · {p.buchung.kunde}</Link>
          <div className="text-xs text-[color:var(--color-ink-soft)]">{p.buchung.email ?? "ohne E-Mail"} · gebucht {p.buchung.gebucht} · {p.buchung.bezahlt ? `bezahlt ${p.buchung.bezahlt}` : "nicht bezahlt"} · {p.buchung.preis} · Status {p.buchung.status} · Mappe {p.buchung.mappe}{p.buchung.stripe ? " · Stripe-Zahlung" : ""}</div>
        </div>
      ) : (
        <div className="text-sm rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-900">
          Keine Buchung zugeordnet. Buchungsnummer oder E-Mail der Buchung eintragen:
          <div className="mt-2 flex flex-wrap gap-2"><input className="input max-w-xs" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="WY-… oder E-Mail" /><button type="button" className="btn-outline" disabled={busy || !ref} onClick={() => call("PATCH", { bookingRef: ref }, "Zugeordnet")}>Zuordnen</button></div>
        </div>
      )}

      {p.erstattet ? (
        <p className="text-sm">Erstattet: <strong>{p.erstattet.betrag}</strong> am {p.erstattet.am}{p.erstattet.refundId ? ` (Stripe ${p.erstattet.refundId})` : " (ohne Stripe)"}. Buchung storniert, Werkzeug beendet.</p>
      ) : p.buchung && p.vorschlag && (
        <div className="space-y-2">
          <p className="text-sm">Vorschlag: <strong>{euro(p.vorschlag.erstattungCents)} €</strong> erstatten{p.vorschlag.anteilCents ? `, ${euro(p.vorschlag.anteilCents)} € anteilig behalten` : ""}. <span className="text-[color:var(--color-ink-soft)]">{p.vorschlag.regel}</span></p>
          <div className="flex flex-wrap items-end gap-3">
            <div><label className="label" htmlFor={`b-${p.id}`}>Erstattung in €</label><input id={`b-${p.id}`} className="input w-32" value={betrag} onChange={(e) => setBetrag(e.target.value)} inputMode="decimal" /></div>
            <button type="button" className="btn-primary" disabled={busy || (!p.stripeBereit && cents(betrag) > 0)} onClick={erstatten}>Über Stripe erstatten</button>
          </div>
          {!p.stripeBereit && <p className="text-xs text-amber-800">Stripe ist in dieser Umgebung nicht eingerichtet (oder der Schlüssel passt nicht zur Umgebung). Bitte im Stripe-Dashboard erstatten und hier „Als erledigt markieren“. Mit 0 € wird nur storniert.</p>}
          {p.stripeBereit && !p.buchung.stripe && cents(betrag) > 0 && <p className="text-xs text-amber-800">Zur Buchung gibt es keine Stripe-Zahlung. Bitte manuell erstatten und hier „Als erledigt markieren“.</p>}
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48"><label className="label" htmlFor={`n-${p.id}`}>Notiz</label><input id={`n-${p.id}`} className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} /></div>
        <button type="button" className="btn-outline" disabled={busy} onClick={() => call("PATCH", { adminNote: note }, "Gespeichert")}>Notiz speichern</button>
        {!p.erstattet && p.status !== "ERLEDIGT" && <button type="button" className="btn-ghost" disabled={busy} onClick={() => call("PATCH", { status: "ERLEDIGT", adminNote: note }, "Erledigt")}>Als erledigt markieren</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}

type KProps = {
  id: string; status: string; adminNote: string | null; eingang: string; art: string; grund: string | null; name: string; email: string; bookingRef: string | null;
  wunsch: string; vertragsende: string | null; bestaetigungEmail: string; buchung: string | null; buchungId: string | null;
};

export function KuendigungAdminRow(p: KProps) {
  const [note, setNote] = useState(p.adminNote ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  async function save(body: Record<string, unknown>) {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/kuendigungen/${p.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (res.ok && body.status) window.location.reload();
    setMsg(res.ok ? "Gespeichert" : "Fehler beim Speichern");
  }
  return (
    <div className="card space-y-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{p.name} · {p.art === "ausserordentlich" ? "außerordentliche Kündigung" : "ordentliche Kündigung"}</div>
          <div className="text-xs text-[color:var(--color-ink-soft)]">Eingang {p.eingang} · E-Mail der Buchung {p.email} · Bestätigung an {p.bestaetigungEmail} · Buchungsnummer {p.bookingRef || "keine"}</div>
          {p.grund && <div className="mt-1 text-sm">Grund: {p.grund}</div>}
          <div className="mt-1 text-sm">Gewünscht: {p.wunsch} · Vertragsende laut Bestätigung: <strong>{p.vertragsende ?? "nächstmöglich, bitte Datum mitteilen"}</strong></div>
          <div className="text-xs">{p.buchung && p.buchungId ? <Link href={`/admin/buchungen/${p.buchungId}`} className="underline">{p.buchung}</Link> : <span className="text-amber-800">Keine Buchung zugeordnet, bitte prüfen.</span>}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${p.status === "ERLEDIGT" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{p.status === "ERLEDIGT" ? "erledigt" : "offen"}</span>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48"><label className="label" htmlFor={`kn-${p.id}`}>Notiz</label><input id={`kn-${p.id}`} className="input" value={note} onChange={(e) => setNote(e.target.value)} maxLength={2000} /></div>
        <button type="button" className="btn-outline" disabled={busy} onClick={() => save({ adminNote: note })}>Notiz speichern</button>
        {p.status !== "ERLEDIGT" && <button type="button" className="btn-ghost" disabled={busy} onClick={() => save({ status: "ERLEDIGT", adminNote: note })}>Als erledigt markieren</button>}
      </div>
      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
