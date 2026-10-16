"use client";

import { useState } from "react";

export type LeadView = { id: string; title: string; company: string; city: string | null; url: string | null; applyUrl: string | null; email: string | null; contactName: string | null; coverLetter: string | null; status: string; sentAt: string | null; response: string | null; source: string; hasDescription: boolean };

const LABEL: Record<string, [string, string]> = {
  SELECTED: ["ausgewählt", "bg-slate-100 text-slate-700"], READY: ["geprüft", "bg-blue-100 text-blue-800"],
  SENT: ["per Mail verschickt", "bg-emerald-100 text-emerald-800"], APPLIED_MANUALLY: ["über Firmenseite beworben", "bg-emerald-100 text-emerald-800"], DISCARDED: ["verworfen", "bg-slate-200 text-slate-600"],
};

export function LeadCard({ lead, canSend, n }: { lead: LeadView; canSend: boolean; n: number }) {
  const [l, setL] = useState(lead);
  const [open, setOpen] = useState(lead.status === "SELECTED" || lead.status === "READY");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const done = l.status === "SENT" || l.status === "APPLIED_MANUALLY";

  async function patch(data: Partial<LeadView>, okText = "Gespeichert") {
    setBusy(true); setMsg(null);
    const r = await fetch(`/api/admin/leads/${l.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setL((x) => ({ ...x, ...data, sentAt: j.lead?.sentAt ?? x.sentAt })); setMsg({ ok: true, t: okText }); } else setMsg({ ok: false, t: j.error ?? "Fehler" });
    return r.ok;
  }
  async function generate() {
    if (l.coverLetter && !confirm("Anschreiben neu erstellen? Eigene Änderungen gehen verloren.")) return;
    setBusy(true);
    const r = await fetch(`/api/admin/leads/${l.id}/generate`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setL((x) => ({ ...x, coverLetter: j.coverLetter })); setMsg({ ok: true, t: j.ai ? "Neu formuliert (KI) – bitte gegenlesen." : "Aus der Vorlage neu erstellt." }); }
  }
  async function send() {
    if (!(await patch({ email: l.email ?? "", contactName: l.contactName ?? "", coverLetter: l.coverLetter ?? "" }, "Gespeichert"))) return;
    if (!confirm(`Bewerbung jetzt an ${l.email} senden? Eine Kopie geht an den Kunden.`)) return;
    setBusy(true);
    const r = await fetch(`/api/admin/leads/${l.id}/send`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setL((x) => ({ ...x, status: "SENT", sentAt: new Date().toISOString() })); setMsg({ ok: true, t: `Verschickt (${j.sent} insgesamt).` }); } else setMsg({ ok: false, t: j.error ?? "Fehler" });
  }

  const [label, color] = LABEL[l.status] ?? [l.status, ""];
  return (
    <div className={`card ${l.status === "DISCARDED" ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <button type="button" className="text-left min-w-0 flex-1" onClick={() => setOpen((o) => !o)}>
          <div className="text-xs text-[color:var(--color-ink-soft)]">#{n} · {l.source === "BA" ? "Bundesagentur" : "manuell"}</div>
          <div className="font-semibold">{l.title}</div>
          <div className="text-sm">{l.company}{l.city ? ` · ${l.city}` : ""}</div>
        </button>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{label}{l.sentAt ? ` · ${new Date(l.sentAt).toLocaleDateString("de-DE")}` : ""}</span>
      </div>
      {open && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-3 text-sm">
            {l.url && <a className="text-[color:var(--color-brand)] underline" href={l.url} target="_blank" rel="noreferrer">Ausschreibung öffnen</a>}
            {l.applyUrl && <a className="text-[color:var(--color-brand)] underline" href={l.applyUrl} target="_blank" rel="noreferrer">Bewerbungsseite der Firma</a>}
            <a className="text-[color:var(--color-brand)] underline" href={`/api/admin/leads/${l.id}/pdf?doc=letter`} target="_blank">Anschreiben (PDF)</a>
            <a className="text-[color:var(--color-brand)] underline" href={`/api/admin/leads/${l.id}/pdf?doc=cv`} target="_blank">Lebenslauf (PDF)</a>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><label className="label">Bewerbungs-E-Mail {l.email ? "" : "(aus der Ausschreibung übernehmen)"}</label><input className="input" type="email" value={l.email ?? ""} disabled={done} onChange={(e) => setL({ ...l, email: e.target.value })} /></div>
            <div><label className="label">Ansprechperson (z. B. „Frau Müller“)</label><input className="input" value={l.contactName ?? ""} disabled={done} onChange={(e) => setL({ ...l, contactName: e.target.value })} /></div>
          </div>
          <div>
            <label className="label">Anschreiben</label>
            <textarea className="input min-h-72 font-[inherit]" value={l.coverLetter ?? ""} maxLength={6000} disabled={done} onChange={(e) => setL({ ...l, coverLetter: e.target.value })} />
            <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">Vor dem Versand bitte gegenlesen: Stimmen Firma, Stelle, Anrede? Keine erfundenen Angaben.</p>
          </div>
          {done && <div><label className="label">Rückmeldung der Firma</label><textarea className="input min-h-16" value={l.response ?? ""} onChange={(e) => setL({ ...l, response: e.target.value })} onBlur={() => patch({ response: l.response ?? "" })} /></div>}
          {msg && <p className={`text-sm rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
          {!done && l.status !== "DISCARDED" && (
            <div className="flex flex-wrap gap-2">
              <button className="btn-outline py-1" disabled={busy} onClick={() => patch({ email: l.email ?? "", contactName: l.contactName ?? "", coverLetter: l.coverLetter ?? "", status: "READY" }, "Gespeichert und als geprüft markiert")}>Speichern · geprüft</button>
              <button className="btn-ghost py-1" disabled={busy} onClick={generate}>Anschreiben neu erstellen</button>
              <button className="btn-primary py-1" disabled={busy || !canSend || !l.email} title={!canSend ? "Erst Mappe freigeben und SMTP einrichten" : !l.email ? "E-Mail fehlt" : ""} onClick={send}>Per Mail bewerben</button>
              <button className="btn-outline py-1" disabled={busy} onClick={() => confirm("Auf der Firmenseite beworben? Dann zählt die Bewerbung.") && patch({ status: "APPLIED_MANUALLY" }, "Als beworben markiert")}>Über Firmenseite beworben</button>
              <button className="btn-ghost py-1 text-rose-700" disabled={busy} onClick={() => patch({ status: "DISCARDED" }, "Verworfen")}>Verwerfen</button>
            </div>
          )}
          {l.status === "DISCARDED" && <button className="btn-ghost py-1" onClick={() => patch({ status: "SELECTED" }, "Wieder aufgenommen")}>Wieder aufnehmen</button>}
        </div>
      )}
    </div>
  );
}
