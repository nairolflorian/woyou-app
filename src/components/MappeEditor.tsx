"use client";

import { useState } from "react";
import type { ProfileData, Station } from "@/lib/application";

const EMPTY: Station = { from: "", to: "", title: "", place: "", city: "", details: "" };

type Props = {
  initial: ProfileData;
  status: string; // DRAFT | SUBMITTED | APPROVED
  hasPhoto: boolean;
  ownCv: { has: boolean; use: boolean };
  missing: string[];
  bookingId?: string; // nur Admin
};

export function MappeEditor(p: Props) {
  const [d, setD] = useState<ProfileData>(p.initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [missing, setMissing] = useState(p.missing);
  const [status, setStatus] = useState(p.status);
  const [hasPhoto, setHasPhoto] = useState(p.hasPhoto);
  const [ownCv, setOwnCv] = useState(p.ownCv);
  const [v, setV] = useState(0); // erzwingt Neuladen der Vorschau-Links
  const q = p.bookingId ? `bookingId=${p.bookingId}&` : "";
  const locked = !p.bookingId && status === "APPROVED";

  const set = <K extends keyof ProfileData>(k: K, val: ProfileData[K]) => setD((x) => ({ ...x, [k]: val }));
  const setStation = (k: "experience" | "education", i: number, f: keyof Station, val: string) =>
    setD((x) => ({ ...x, [k]: x[k].map((s, j) => (j === i ? { ...s, [f]: val } : s)) }));
  const move = (k: "experience" | "education", i: number, dir: -1 | 1) =>
    setD((x) => { const a = [...x[k]]; const j = i + dir; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, [k]: a }; });

  async function save() {
    setBusy(true); setMsg(null);
    const r = await fetch(`/api/mappe?${q}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMissing(j.missing ?? []); setV((n) => n + 1); setMsg({ ok: true, text: "Gespeichert." }); }
    else setMsg({ ok: false, text: j.error ?? "Speichern fehlgeschlagen." });
    return r.ok;
  }

  async function submit() {
    if (!(await save())) return;
    setBusy(true);
    const r = await fetch(`/api/mappe/freigeben?${q}`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setStatus(j.status); setMsg({ ok: true, text: p.bookingId ? "Mappe freigegeben." : "Danke! Deine Mappe ist bei uns. Wir melden uns, sobald die Bewerbungen starten." }); }
    else setMsg({ ok: false, text: j.error ?? "Fehler" });
  }

  async function upload(kind: "foto" | "lebenslauf", file: File | undefined) {
    if (!file) return;
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`/api/mappe/${kind}?${q}`, { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: j.error ?? "Hochladen fehlgeschlagen." }); return; }
    if (kind === "foto") setHasPhoto(true); else setOwnCv({ has: true, use: true });
    setV((n) => n + 1);
    setMsg({ ok: true, text: kind === "foto" ? "Foto gespeichert." : "Lebenslauf gespeichert. Er wird für deine Bewerbungen verwendet." });
  }

  async function removePhoto() { await fetch(`/api/mappe/foto?${q}`, { method: "DELETE" }); setHasPhoto(false); setV((n) => n + 1); }
  async function useOwn(use: boolean) {
    const r = await fetch(`/api/mappe/lebenslauf?${q}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ useOwnCv: use }) });
    if (r.ok) setOwnCv((x) => ({ ...x, use }));
  }

  const input = (k: keyof ProfileData, label: string, opts: { ph?: string; max?: number; wide?: boolean } = {}) => (
    <div className={opts.wide ? "md:col-span-2" : ""}>
      <label className="label">{label}</label>
      <input className="input" value={String(d[k] ?? "")} placeholder={opts.ph} maxLength={opts.max ?? 120} disabled={locked} onChange={(e) => set(k, e.target.value as never)} />
    </div>
  );
  const area = (k: keyof ProfileData, label: string, hint: string, max: number) => (
    <div className="md:col-span-2">
      <label className="label">{label}</label>
      <textarea className="input min-h-24" value={String(d[k] ?? "")} maxLength={max} disabled={locked} onChange={(e) => set(k, e.target.value as never)} />
      <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{hint}</p>
    </div>
  );

  const stations = (k: "experience" | "education", title: string, labels: { title: string; place: string; details: string }) => (
    <section className="card">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {!locked && <button type="button" className="btn-outline py-1" onClick={() => set(k, [...d[k], { ...EMPTY }])}>+ Eintrag</button>}
      </div>
      <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">Neuester Eintrag zuerst.</p>
      {d[k].length === 0 && <p className="mt-3 text-sm text-[color:var(--color-ink-soft)]">Noch keine Einträge.</p>}
      <div className="mt-3 space-y-4">
        {d[k].map((s, i) => (
          <div key={i} className="rounded-xl border border-[color:var(--color-border)] p-4 grid gap-3 md:grid-cols-4">
            <div><label className="label">von</label><input className="input" placeholder="03/2021" maxLength={20} value={s.from} disabled={locked} onChange={(e) => setStation(k, i, "from", e.target.value)} /></div>
            <div><label className="label">bis</label><input className="input" placeholder="heute" maxLength={20} value={s.to} disabled={locked} onChange={(e) => setStation(k, i, "to", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">{labels.title}</label><input className="input" maxLength={120} value={s.title} disabled={locked} onChange={(e) => setStation(k, i, "title", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">{labels.place}</label><input className="input" maxLength={120} value={s.place} disabled={locked} onChange={(e) => setStation(k, i, "place", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">Ort, Land</label><input className="input" maxLength={80} value={s.city} disabled={locked} onChange={(e) => setStation(k, i, "city", e.target.value)} /></div>
            <div className="md:col-span-4"><label className="label">{labels.details}</label><textarea className="input min-h-20" maxLength={800} value={s.details} disabled={locked} onChange={(e) => setStation(k, i, "details", e.target.value)} /><p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">Eine Angabe pro Zeile.</p></div>
            {!locked && (
              <div className="md:col-span-4 flex gap-2 text-sm">
                <button type="button" className="btn-ghost py-1" onClick={() => move(k, i, -1)}>↑</button>
                <button type="button" className="btn-ghost py-1" onClick={() => move(k, i, 1)}>↓</button>
                <button type="button" className="btn-ghost py-1 text-rose-700" onClick={() => set(k, d[k].filter((_, j) => j !== i))}>Entfernen</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {locked && <div className="card bg-emerald-50 border-emerald-200 text-sm text-emerald-900">Deine Mappe ist freigegeben. Für Änderungen schreib uns bitte kurz.</div>}

      <section className="card">
        <h2 className="font-semibold">Vorschau</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">So sehen deine Unterlagen aus. Erst speichern, dann neu öffnen.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn-outline" href={`/api/mappe/pdf?${q}type=cv&v=${v}`} target="_blank">Lebenslauf (PDF)</a>
          <a className="btn-outline" href={`/api/mappe/pdf?${q}type=anschreiben&v=${v}`} target="_blank">Anschreiben-Vorlage (PDF)</a>
          {ownCv.has && <a className="btn-outline" href={`/api/mappe/lebenslauf?${q}v=${v}`} target="_blank">Eigener Lebenslauf</a>}
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">Du hast schon einen Lebenslauf?</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">Lade ihn als PDF hoch. Dann schicken wir deinen eigenen Lebenslauf mit. Die Angaben unten brauchen wir trotzdem für die Anschreiben.</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!locked && <label className="btn-outline cursor-pointer">PDF hochladen<input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload("lebenslauf", e.target.files?.[0])} /></label>}
          {ownCv.has && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ownCv.use} disabled={locked} onChange={(e) => useOwn(e.target.checked)} />Meinen eigenen Lebenslauf verwenden</label>
          )}
        </div>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Persönliche Angaben</h2>
        {input("firstName", "Vorname")}
        {input("lastName", "Nachname")}
        {input("street", "Straße, Hausnummer")}
        {input("zipCity", "PLZ, Ort")}
        {input("country", "Land")}
        {input("phone", "Telefon / WhatsApp", { max: 40 })}
        {input("email", "E-Mail")}
        {input("birthDate", "Geburtsdatum (freiwillig)", { ph: "TT.MM.JJJJ", max: 20 })}
        {input("nationality", "Staatsangehörigkeit (freiwillig)", { max: 60 })}
        {input("targetJob", "Wunschberuf (Überschrift im Lebenslauf)", { ph: "z. B. Pflegefachkraft" })}
        <div className="md:col-span-2">
          <label className="label">Bewerbungsfoto (freiwillig)</label>
          <div className="flex flex-wrap items-center gap-4">
            {hasPhoto && <img src={`/api/mappe/foto?${q}v=${v}`} alt="Bewerbungsfoto" className="h-28 w-[88px] rounded object-cover border" />}
            {!locked && <label className="btn-outline cursor-pointer">{hasPhoto ? "Foto ersetzen" : "Foto hochladen"}<input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => upload("foto", e.target.files?.[0])} /></label>}
            {hasPhoto && !locked && <button type="button" className="btn-ghost text-rose-700" onClick={removePhoto}>Entfernen</button>}
            {hasPhoto && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.showPhoto} disabled={locked} onChange={(e) => set("showPhoto", e.target.checked)} />Foto im Lebenslauf zeigen</label>}
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">In Deutschland ist ein Foto üblich, aber nicht Pflicht. Am besten ein helles Porträt vor neutralem Hintergrund.</p>
        </div>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Über dich</h2>
        {area("summary", "Kurzprofil", "2 bis 4 Sätze: Beruf, Erfahrung, wichtigste Stärke. Steht oben im Lebenslauf.", 700)}
        {area("motivation", "Warum Deutschland, warum dieser Beruf?", "In deinen eigenen Worten. Daraus entstehen deine Anschreiben, deshalb bitte ehrlich und konkret.", 1200)}
        {area("strengths", "Was kannst du besonders gut? (optional)", "Zum Beispiel Erfahrungen mit bestimmten Geräten, Patientengruppen oder Abläufen.", 600)}
      </section>

      {stations("experience", "Berufserfahrung", { title: "Position", place: "Arbeitgeber", details: "Aufgaben" })}
      {stations("education", "Ausbildung und Schule", { title: "Abschluss bzw. Ausbildung", place: "Schule / Hochschule", details: "Schwerpunkte (optional)" })}

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">Sprachen und Kenntnisse</h2>
        <div className="md:col-span-2 space-y-2">
          {d.languages.map((l, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input className="input flex-1 min-w-32" placeholder="Sprache" maxLength={40} value={l.name} disabled={locked} onChange={(e) => set("languages", d.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input className="input flex-1 min-w-32" placeholder="Niveau, z. B. B2 oder Muttersprache" maxLength={40} value={l.level} disabled={locked} onChange={(e) => set("languages", d.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))} />
              {!locked && <button type="button" className="btn-ghost text-rose-700" onClick={() => set("languages", d.languages.filter((_, j) => j !== i))}>×</button>}
            </div>
          ))}
          {!locked && <button type="button" className="btn-outline py-1" onClick={() => set("languages", [...d.languages, { name: "", level: "" }])}>+ Sprache</button>}
        </div>
        {area("skills", "Fachliche Kenntnisse", "Eine Kenntnis pro Zeile, z. B. Wundversorgung, Gabelstaplerschein, MS Office.", 800)}
        {input("drivingLicense", "Führerschein", { ph: "z. B. Klasse B", max: 40 })}
        {input("availableFrom", "Verfügbar ab", { ph: "sofort oder MM/JJJJ", max: 40 })}
      </section>

      {missing.length > 0 && <div className="card bg-amber-50 border-amber-200 text-sm text-amber-900">Noch offen: {missing.join(", ")}.</div>}
      {msg && <div className={`card text-sm ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-800"}`}>{msg.text}</div>}

      {!locked && (
        <div className="flex flex-wrap gap-3 sticky bottom-4 bg-white/90 backdrop-blur rounded-full p-2 shadow">
          <button type="button" className="btn-outline" disabled={busy} onClick={save}>{busy ? "…" : "Speichern"}</button>
          {p.bookingId
            ? <button type="button" className="btn-primary" disabled={busy} onClick={submit}>Speichern und freigeben</button>
            : status === "DRAFT" && <button type="button" className="btn-primary" disabled={busy} onClick={submit}>Mappe abschicken</button>}
          {!p.bookingId && status === "SUBMITTED" && <span className="self-center text-sm text-[color:var(--color-ink-soft)]">Abgeschickt. Änderungen kannst du weiter speichern.</span>}
        </div>
      )}
    </div>
  );
}
