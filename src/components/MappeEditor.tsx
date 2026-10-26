"use client";

import { useState } from "react";
import type { ProfileData, Station } from "@/lib/application";
import { mappeText, localizeMissing, qualText, type MappeText } from "@/lib/mappe-i18n";
import { LICENSE_CLASSES, EMPTY_QUAL, zielgruppen, type Qualifications } from "@/lib/qualifikation";
import { DESIGN_TEMPLATES, DESIGN_COLORS, DEFAULT_DESIGN, type DesignTemplate } from "@/lib/design";

const EMPTY: Station = { from: "", to: "", title: "", place: "", city: "", details: "" };

type Props = {
  initial: ProfileData;
  status: string; // DRAFT | SUBMITTED | APPROVED
  hasPhoto: boolean;
  ownCv: { has: boolean; use: boolean };
  missing: string[];
  bookingId?: string; // nur Admin
  lang?: "en"; // nur Admin: englische Fassung bearbeiten
  locale?: string;
};

function Sketch({ t, c }: { t: DesignTemplate; c: string }) {
  const bar = (w: string, op = 0.25) => <div className="h-1 rounded-sm" style={{ width: w, background: "#1f1f1f", opacity: op }} />;
  const body = <div className="space-y-1">{bar("40%", 0.6)}{bar("90%")}{bar("80%")}{bar("40%", 0.6)}{bar("85%")}{bar("70%")}</div>;
  return (
    <div className="relative h-24 w-[68px] overflow-hidden rounded border bg-white shadow-sm">
      {t === "modern" ? (
        <div className="flex h-full"><div className="w-5" style={{ background: c }} /><div className="flex-1 space-y-1 p-1.5"><div className="h-1.5 w-3/4 rounded-sm" style={{ background: c }} />{body}</div></div>
      ) : t === "kompakt" ? (
        <><div className="h-5 px-1.5 pt-1.5" style={{ background: c }}><div className="h-1.5 w-3/4 rounded-sm bg-white/90" /></div><div className="p-1.5">{body}</div></>
      ) : t === "elegant" ? (
        <div className="p-1.5"><div className="mx-auto mb-1 h-1.5 w-2/3 rounded-sm" style={{ background: "#1f1f1f" }} /><div className="mb-1.5 h-px w-full" style={{ background: c }} />{body}</div>
      ) : (
        <div className="p-1.5"><div className="mb-1.5 h-1.5 w-2/3 rounded-sm" style={{ background: c }} />{body}</div>
      )}
    </div>
  );
}

export function MappeEditor(p: Props) {
  const tx: MappeText = mappeText(p.bookingId ? "de" : p.locale ?? "de");
  const qt = qualText(p.bookingId ? "de" : p.locale ?? "de");
  const [d, setD] = useState<ProfileData>(p.initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [missing, setMissing] = useState(p.missing);
  const [status, setStatus] = useState(p.status);
  const [hasPhoto, setHasPhoto] = useState(p.hasPhoto);
  const [ownCv, setOwnCv] = useState(p.ownCv);
  const [v, setV] = useState(0); // erzwingt Neuladen der Vorschau-Links
  const en = !!p.bookingId && p.lang === "en";
  const q = p.bookingId ? `bookingId=${p.bookingId}&${en ? "lang=en&" : ""}` : "";
  const locked = !p.bookingId && status === "APPROVED";

  const set = <K extends keyof ProfileData>(k: K, val: ProfileData[K]) => setD((x) => ({ ...x, [k]: val }));
  const ql: Qualifications = d.qualifications ?? EMPTY_QUAL;
  const setQ = <K extends keyof Qualifications>(k: K, val: Qualifications[K]) => setD((x) => ({ ...x, qualifications: { ...(x.qualifications ?? EMPTY_QUAL), [k]: val } }));
  const gruppen = zielgruppen(d);
  const setStation = (k: "experience" | "education", i: number, f: keyof Station, val: string) =>
    setD((x) => ({ ...x, [k]: x[k].map((s, j) => (j === i ? { ...s, [f]: val } : s)) }));
  const move = (k: "experience" | "education", i: number, dir: -1 | 1) =>
    setD((x) => { const a = [...x[k]]; const j = i + dir; if (j < 0 || j >= a.length) return x; [a[i], a[j]] = [a[j], a[i]]; return { ...x, [k]: a }; });

  async function save() {
    setBusy(true); setMsg(null);
    const r = await fetch(`/api/mappe?${q}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setMissing(j.missing ?? []); setV((n) => n + 1); setMsg({ ok: true, text: tx.saved }); }
    else setMsg({ ok: false, text: j.error ?? tx.saveFail });
    return r.ok;
  }

  async function submit() {
    if (!(await save())) return;
    setBusy(true);
    const r = await fetch(`/api/mappe/freigeben?${q}`, { method: "POST" });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (r.ok) { setStatus(j.status); setMsg({ ok: true, text: p.bookingId ? "Mappe freigegeben." : tx.submittedMsg }); }
    else if (r.status === 400 && j.missing?.length) { setMissing(j.missing); setMsg({ ok: false, text: `${tx.missing} ${localizeMissing(tx, j.missing).join(", ")}.` }); }
    else setMsg({ ok: false, text: j.error ?? tx.error });
  }

  async function upload(kind: "foto" | "lebenslauf", file: File | undefined) {
    if (!file) return;
    setBusy(true); setMsg(null);
    const fd = new FormData(); fd.append("file", file);
    const r = await fetch(`/api/mappe/${kind}?${q}`, { method: "POST", body: fd });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { setMsg({ ok: false, text: j.error ?? tx.uploadFail }); return; }
    if (kind === "foto") setHasPhoto(true); else setOwnCv({ has: true, use: true });
    setV((n) => n + 1);
    setMsg({ ok: true, text: kind === "foto" ? tx.photoSaved : tx.cvSaved });
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
  const yesNo = (k: "driverCard" | "code95" | "adr" | "forklift", label: string) => (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={ql[k]} disabled={locked} onChange={(e) => setQ(k, e.target.value as Qualifications[typeof k])}>
        <option value="">{qt.none}</option><option value="yes">{qt.yes}</option><option value="no">{qt.no}</option>
      </select>
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
        {!locked && <button type="button" className="btn-outline py-1" onClick={() => set(k, [...d[k], { ...EMPTY }])}>{tx.addEntry}</button>}
      </div>
      <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{tx.newestFirst}</p>
      {d[k].length === 0 && <p className="mt-3 text-sm text-[color:var(--color-ink-soft)]">{tx.noEntries}</p>}
      <div className="mt-3 space-y-4">
        {d[k].map((s, i) => (
          <div key={i} className="rounded-xl border border-[color:var(--color-border)] p-4 grid gap-3 md:grid-cols-4">
            <div><label className="label">{tx.from}</label><input className="input" placeholder="03/2021" maxLength={20} value={s.from} disabled={locked} onChange={(e) => setStation(k, i, "from", e.target.value)} /></div>
            <div><label className="label">{tx.to}</label><input className="input" placeholder={tx.toPh} maxLength={20} value={s.to} disabled={locked} onChange={(e) => setStation(k, i, "to", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">{labels.title}</label><input className="input" maxLength={120} value={s.title} disabled={locked} onChange={(e) => setStation(k, i, "title", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">{labels.place}</label><input className="input" maxLength={120} value={s.place} disabled={locked} onChange={(e) => setStation(k, i, "place", e.target.value)} /></div>
            <div className="md:col-span-2"><label className="label">{tx.cityCountry}</label><input className="input" maxLength={80} value={s.city} disabled={locked} onChange={(e) => setStation(k, i, "city", e.target.value)} /></div>
            <div className="md:col-span-4"><label className="label">{labels.details}</label><textarea className="input min-h-20" maxLength={800} value={s.details} disabled={locked} onChange={(e) => setStation(k, i, "details", e.target.value)} /><p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{tx.onePerLine}</p></div>
            {!locked && (
              <div className="md:col-span-4 flex gap-2 text-sm">
                <button type="button" className="btn-ghost py-1" onClick={() => move(k, i, -1)}>↑</button>
                <button type="button" className="btn-ghost py-1" onClick={() => move(k, i, 1)}>↓</button>
                <button type="button" className="btn-ghost py-1 text-rose-700" onClick={() => set(k, d[k].filter((_, j) => j !== i))}>{tx.remove}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="space-y-6">
      {locked && <div className="card bg-emerald-50 border-emerald-200 text-sm text-emerald-900">{tx.locked}</div>}

      <section className="card">
        <h2 className="font-semibold">{tx.preview}</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{tx.previewHint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a className="btn-outline" href={`/api/mappe/pdf?${q}type=cv&v=${v}`} target="_blank">{tx.pdfCv}</a>
          <a className="btn-outline" href={`/api/mappe/pdf?${q}type=anschreiben&v=${v}`} target="_blank">{tx.pdfLetter}</a>
          {ownCv.has && <a className="btn-outline" href={`/api/mappe/lebenslauf?${q}v=${v}`} target="_blank">{tx.ownCvLink}</a>}
        </div>
      </section>

      {en && <div className="card bg-blue-50 border-blue-200 text-sm text-blue-900">Englische Fassung: Texte hier auf Englisch eintragen bzw. übersetzen. Sie wird für Stellen verwendet, die auf „Englisch“ stehen. Foto und eigener Lebenslauf gelten für beide Fassungen.</div>}

      {!en && <section className="card">
        <h2 className="font-semibold">{tx.ownTitle}</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{tx.ownHint}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {!locked && <label className="btn-outline cursor-pointer">{tx.ownUpload}<input type="file" accept="application/pdf" className="hidden" onChange={(e) => upload("lebenslauf", e.target.files?.[0])} /></label>}
          {ownCv.has && (
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ownCv.use} disabled={locked} onChange={(e) => useOwn(e.target.checked)} />{tx.ownUse}</label>
          )}
        </div>
      </section>}

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">{tx.personal}</h2>
        {input("firstName", tx.firstName)}
        {input("lastName", tx.lastName)}
        {input("street", tx.street)}
        {input("zipCity", tx.zipCity)}
        {input("country", tx.country)}
        {input("phone", tx.phone, { max: 40 })}
        {input("email", tx.email)}
        {input("birthDate", tx.birthDate, { ph: tx.birthDatePh, max: 20 })}
        {input("nationality", tx.nationality, { max: 60 })}
        {input("targetJob", tx.targetJob, { ph: tx.targetJobPh })}
        <div className="md:col-span-2">
          <label className="label">{tx.photo}</label>
          <div className="flex flex-wrap items-center gap-4">
            {hasPhoto && <img src={`/api/mappe/foto?${q}v=${v}`} alt="Bewerbungsfoto" className="h-28 w-[88px] rounded object-cover border" />}
            {!locked && <label className="btn-outline cursor-pointer">{hasPhoto ? tx.photoReplace : tx.photoUpload}<input type="file" accept="image/jpeg,image/png" className="hidden" onChange={(e) => upload("foto", e.target.files?.[0])} /></label>}
            {hasPhoto && !locked && <button type="button" className="btn-ghost text-rose-700" onClick={removePhoto}>{tx.remove}</button>}
            {hasPhoto && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={d.showPhoto} disabled={locked} onChange={(e) => set("showPhoto", e.target.checked)} />{tx.showPhoto}</label>}
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-ink-soft)]">{tx.photoHint}</p>
        </div>
      </section>

      <section className="card">
        <h2 className="font-semibold">{tx.designTitle}</h2>
        <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{tx.designLead}</p>
        <div className="mt-4 flex flex-wrap gap-3" role="radiogroup" aria-label={tx.designTitle}>
          {DESIGN_TEMPLATES.map((t) => {
            const on = (d.design?.template ?? DEFAULT_DESIGN.template) === t;
            return (
              <button key={t} type="button" role="radio" aria-checked={on} disabled={locked} onClick={() => set("design", { ...(d.design ?? DEFAULT_DESIGN), template: t })}
                className={`flex w-32 flex-col items-center gap-2 rounded-xl border-2 p-3 text-center transition ${on ? "border-[color:var(--color-brand-deep)] bg-[color:var(--color-brand-soft)]" : "border-transparent hover:border-slate-200"}`}>
                <Sketch t={t} c={d.design?.color ?? DEFAULT_DESIGN.color} />
                <span className="text-sm font-medium">{tx.designs[t]}</span>
                <span className="text-xs text-[color:var(--color-ink-soft)]">{tx.designHints[t]}</span>
              </button>
            );
          })}
        </div>
        <label className="label mt-4">{tx.color}</label>
        <div className="flex flex-wrap gap-3" role="radiogroup" aria-label={tx.color}>
          {DESIGN_COLORS.map((c, i) => {
            const on = (d.design?.color ?? DEFAULT_DESIGN.color) === c.value;
            return (
              <button key={c.value} type="button" role="radio" aria-checked={on} disabled={locked} title={tx.colors[i]} onClick={() => set("design", { ...(d.design ?? DEFAULT_DESIGN), color: c.value })}
                className={`flex flex-col items-center gap-1 text-xs ${on ? "font-semibold" : "text-[color:var(--color-ink-soft)]"}`}>
                <span className={`block h-9 w-9 rounded-full ring-offset-2 ${on ? "ring-2 ring-[color:var(--color-ink)]" : ""}`} style={{ background: c.value }} />
                {tx.colors[i]}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[color:var(--color-ink-soft)]">{tx.saveToPreview}</p>
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">{tx.about}</h2>
        {area("summary", tx.summary, tx.summaryHint, 700)}
        {area("motivation", tx.motivation, tx.motivationHint, 1200)}
        {area("strengths", tx.strengths, tx.strengthsHint, 600)}
      </section>

      {stations("experience", tx.experience, { title: tx.position, place: tx.employer, details: tx.tasks })}
      {stations("education", tx.education, { title: tx.degree, place: tx.school, details: tx.focus })}

      <section className="card grid gap-4 md:grid-cols-2">
        <h2 className="font-semibold md:col-span-2">{tx.langSkills}</h2>
        <div className="md:col-span-2 space-y-2">
          {d.languages.map((l, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input className="input flex-1 min-w-32" placeholder={tx.langPh} maxLength={40} value={l.name} disabled={locked} onChange={(e) => set("languages", d.languages.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
              <input className="input flex-1 min-w-32" placeholder={tx.levelPh} maxLength={40} value={l.level} disabled={locked} onChange={(e) => set("languages", d.languages.map((x, j) => (j === i ? { ...x, level: e.target.value } : x)))} />
              {!locked && <button type="button" className="btn-ghost text-rose-700" onClick={() => set("languages", d.languages.filter((_, j) => j !== i))}>×</button>}
            </div>
          ))}
          {!locked && <button type="button" className="btn-outline py-1" onClick={() => set("languages", [...d.languages, { name: "", level: "" }])}>{tx.addLang}</button>}
        </div>
        {area("skills", tx.skills, tx.skillsHint, 800)}
        {input("drivingLicense", tx.driving, { ph: tx.drivingPh, max: 40 })}
        {input("availableFrom", tx.available, { ph: tx.availablePh, max: 40 })}
      </section>

      <section className="card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h2 className="font-semibold">{qt.title}</h2>
          <p className="mt-1 text-sm text-[color:var(--color-ink-soft)]">{qt.lead}</p>
        </div>
        <fieldset className="md:col-span-2">
          <legend className="label">{qt.licenses}</legend>
          <div className="flex flex-wrap gap-4">
            {LICENSE_CLASSES.map((c) => (
              <label key={c} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={ql.licenses.includes(c)} disabled={locked}
                  onChange={(e) => setQ("licenses", LICENSE_CLASSES.filter((x) => (x === c ? e.target.checked : ql.licenses.includes(x))))} />
                {c}
              </label>
            ))}
          </div>
        </fieldset>
        <div><label className="label">{qt.since}</label><input className="input" inputMode="numeric" maxLength={4} placeholder={qt.sincePh} value={ql.licenseSince} disabled={locked} onChange={(e) => setQ("licenseSince", e.target.value.replace(/\D/g, ""))} /></div>
        {yesNo("driverCard", qt.driverCard)}
        {yesNo("code95", qt.code95)}
        {ql.code95 === "yes" ? <div><label className="label">{qt.code95Until}</label><input className="input" maxLength={7} placeholder={qt.code95UntilPh} value={ql.code95Until} disabled={locked} onChange={(e) => setQ("code95Until", e.target.value)} /></div> : <div className="hidden md:block" />}
        {yesNo("adr", qt.adr)}
        {ql.adr === "yes" ? <div><label className="label">{qt.adrClasses}</label><input className="input" maxLength={60} placeholder={qt.adrClassesPh} value={ql.adrClasses} disabled={locked} onChange={(e) => setQ("adrClasses", e.target.value)} /></div> : <div className="hidden md:block" />}
        {yesNo("forklift", qt.forklift)}
        <div className="md:col-span-2"><label className="label">{qt.countries}</label><input className="input" maxLength={300} placeholder={qt.countriesPh} value={ql.countries} disabled={locked} onChange={(e) => setQ("countries", e.target.value)} /></div>
        <div className="md:col-span-2"><label className="label">{qt.systems}</label><input className="input" maxLength={300} placeholder={qt.systemsPh} value={ql.systems} disabled={locked} onChange={(e) => setQ("systems", e.target.value)} /></div>
        {gruppen.length > 0 && !en && (
          <div className="md:col-span-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-brand-soft)] p-4 text-sm">
            <h3 className="font-semibold">{qt.checkTitle}</h3>
            {gruppen.map((g) => (
              <div key={g} className="mt-2">
                <div className="font-medium">{qt.groups[g]}</div>
                <ul className="mt-1 list-disc ps-5 space-y-0.5">{qt.docs[g].map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            ))}
            <p className="mt-3 text-xs text-[color:var(--color-ink-soft)]">{qt.checkLead} {!p.bookingId && <a className="underline" href="/profil#dokumente">{qt.checkLink}</a>}</p>
          </div>
        )}
      </section>

      {missing.length > 0 && <div className="card bg-amber-50 border-amber-200 text-sm text-amber-900">{tx.missing} {localizeMissing(tx, missing).join(", ")}.</div>}
      {msg && <div className={`card text-sm ${msg.ok ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-800"}`}>{msg.text}</div>}

      {!locked && (
        <div className="flex flex-wrap gap-3 sticky bottom-4 bg-white/90 backdrop-blur rounded-full p-2 shadow">
          <button type="button" className="btn-outline" disabled={busy} onClick={save}>{busy ? "…" : tx.save}</button>
          {en ? null : p.bookingId
            ? <button type="button" className="btn-primary" disabled={busy} onClick={submit}>Speichern und freigeben</button>
            : status === "DRAFT" && <button type="button" className="btn-primary" disabled={busy} onClick={submit}>{tx.submit}</button>}
          {!p.bookingId && status === "SUBMITTED" && <span className="self-center text-sm text-[color:var(--color-ink-soft)]">{tx.submittedNote}</span>}
        </div>
      )}
    </div>
  );
}
