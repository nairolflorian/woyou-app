"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { fillIn, dateLocaleOf, wLang, type werkzeugText } from "@/lib/werkzeug-text";
import { LEVELS, SOURCE_NAME, hatHinweise, type Treffer, type Hours, type GermanFit } from "@/lib/stellensuche-core";
import { portalSearchLinks } from "@/lib/portals";

type T = ReturnType<typeof werkzeugText>;
type Defaults = { was: string; wo: string; umkreis: number; deutsch: string };

const FIT_CLASS: Record<GermanFit, string> = {
  ok: "bg-emerald-100 text-emerald-800", close: "bg-amber-100 text-amber-800", high: "bg-rose-100 text-rose-800", req: "bg-slate-100 text-slate-700", none: "bg-slate-100 text-slate-600",
};

// Stellensuche der Kundin bzw. des Kunden: vorbelegt aus dem eigenen Profil, Filter und Auswahl liegen ganz bei der Person.
export function StellenSuche({ t, locale, defaults, suggestions, savedKeys, trackerCount }: { t: T; locale: string; defaults: Defaults; suggestions: string[]; savedKeys: string[]; trackerCount: number }) {
  const [was, setWas] = useState(defaults.was);
  const [wo, setWo] = useState(defaults.wo);
  const [umkreis, setUmkreis] = useState(defaults.umkreis);
  const [hours, setHours] = useState<Hours>("alle");
  const [deutsch, setDeutsch] = useState(defaults.deutsch);
  const [onlyFitting, setOnlyFitting] = useState(false);
  const [onlyGq, setOnlyGq] = useState(false);
  const [treffer, setTreffer] = useState<Treffer[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set(savedKeys));
  const [saving, setSaving] = useState<string | null>(null);
  const [count, setCount] = useState(trackerCount);
  const started = useRef(false);
  const dl = dateLocaleOf(wLang(locale));

  const search = useCallback(async (p = 1, overrideWas?: string) => {
    const q = overrideWas ?? was;
    if (q.trim().length < 2) return;
    setBusy(true); setErr(null);
    const params = new URLSearchParams({ was: q, wo, umkreis: String(umkreis), arbeitszeit: hours, deutsch, nurPassend: onlyFitting ? "1" : "0", nurGq: onlyGq ? "1" : "0", seite: String(p) });
    const r = await fetch(`/api/stellensuche?${params}`).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (!r || !r.ok) { setErr(j.error ?? t.searchError); return; }
    setTreffer((xs) => (p === 1 ? j.treffer : [...xs, ...j.treffer.filter((n: Treffer) => !xs.some((x) => x.key === n.key))]));
    setTotal(j.total); setPage(p); setMore(!!j.mehr);
  }, [was, wo, umkreis, hours, deutsch, onlyFitting, onlyGq, t.searchError]);

  // Beim Öffnen direkt mit dem Profil-Vorschlag suchen
  useEffect(() => {
    if (started.current || !defaults.was) return;
    started.current = true;
    void search(1);
  }, [defaults.was, search]);

  async function save(x: Treffer) {
    setSaving(x.key); setErr(null);
    const r = await fetch("/api/stellen", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: x.key }) });
    const j = await r.json().catch(() => ({}));
    setSaving(null);
    if (!r.ok) { setErr(j.error ?? t.failed); return; }
    setSaved((s) => new Set(s).add(x.key));
    setCount((c) => c + 1);
  }

  const fitText = (x: Treffer) => (x.fit === "none" ? t.germanNone : fillIn({ ok: t.germanOk, close: t.germanClose, high: t.germanHigh, req: t.germanReq }[x.fit], { req: x.germanRequired ?? "" }));

  return (
    <div className="space-y-6">
      <form className="card space-y-4" onSubmit={(e) => { e.preventDefault(); void search(1); }}>
        <div className="grid gap-3 md:grid-cols-[2fr_2fr_1fr]">
          <label className="block text-sm"><span className="label">{t.was}</span><input className="input" value={was} onChange={(e) => setWas(e.target.value)} placeholder={t.wasPh} required minLength={2} maxLength={100} /></label>
          <label className="block text-sm"><span className="label">{t.wo}</span><input className="input" value={wo} onChange={(e) => setWo(e.target.value)} placeholder={t.woPh} maxLength={80} /></label>
          <label className="block text-sm"><span className="label">{t.radius}</span>
            <select className="input" value={umkreis} onChange={(e) => setUmkreis(Number(e.target.value))} disabled={!wo}>{[10, 25, 50, 100, 200].map((k) => <option key={k} value={k}>{fillIn(t.km, { n: k })}</option>)}</select>
          </label>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_2fr_auto] md:items-end">
          <label className="block text-sm"><span className="label">{t.hours}</span>
            <select className="input" value={hours} onChange={(e) => setHours(e.target.value as Hours)}>
              <option value="alle">{t.hoursAll}</option><option value="vollzeit">{t.fulltime}</option><option value="teilzeit">{t.parttime}</option>
            </select>
          </label>
          <label className="block text-sm"><span className="label">{t.myGerman}</span>
            <select className="input" value={deutsch} onChange={(e) => setDeutsch(e.target.value)}>
              <option value="">{t.germanUnknown}</option>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={onlyFitting} onChange={(e) => setOnlyFitting(e.target.checked)} disabled={!deutsch} /><span>{t.onlyFitting}</span></label>
          <button className="btn-primary" disabled={busy}>{busy ? t.searching : t.search}</button>
        </div>
        <label className="flex items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={onlyGq} onChange={(e) => setOnlyGq(e.target.checked)} /><span>{t.onlyGq}</span></label>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-[color:var(--color-ink-soft)]">{t.fromProfile}</span>
            {suggestions.map((s) => (
              <button key={s} type="button" className={`rounded-full border px-3 py-1 ${s === was ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`} onClick={() => { setWas(s); void search(1, s); }}>{s}</button>
            ))}
          </div>
        )}
      </form>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[color:var(--color-ink-soft)]" aria-live="polite">{busy ? t.searching : total !== null ? fillIn(t.results, { n: Math.max(total, treffer.length).toLocaleString(dl) }) : ""}</p>
        <Link href="/meine-bewerbungen" className="btn-outline">{fillIn(t.toTracker, { n: count })}</Link>
      </div>
      {err && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{err}</p>}
      {total !== null && !busy && treffer.length === 0 && <p className="card text-sm text-[color:var(--color-ink-soft)]">{t.noResults}</p>}

      <ul className="space-y-3">
        {treffer.map((x) => (
          <li key={x.key} className="card flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <a href={x.url} target="_blank" rel="noreferrer noopener" className="font-semibold text-[color:var(--color-brand-deep)]">{x.title}</a>
              <div className="text-sm">{x.company}{x.city ? ` · ${x.city}` : ""}{x.distanceKm != null ? ` (${fillIn(t.km, { n: x.distanceKm })})` : ""}</div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                <span className={`rounded-full px-2 py-0.5 ${FIT_CLASS[x.fit]}`}>{fitText(x)}</span>
                {x.fulltime && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.fulltime}</span>}
                {x.parttime && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.parttime}</span>}
                {x.publishedAt && <span className="rounded-full bg-slate-100 px-2 py-0.5">{fillIn(t.published, { date: new Date(x.publishedAt).toLocaleDateString(dl) })}</span>}
                <span className="rounded-full bg-slate-100 px-2 py-0.5">{x.email ? t.withEmail : t.viaEmployerSite}</span>
                {x.hinweise?.gqGestellt && <span className="rounded-full bg-[color:var(--color-brand-soft)] px-2 py-0.5 text-[color:var(--color-brand-deep)]">{t.hintGqProvided}</span>}
                {x.hinweise?.code95 && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.hintCode95}</span>}
                {!!x.hinweise?.klassen.length && <span className="rounded-full bg-slate-100 px-2 py-0.5">{fillIn(t.hintLicence, { cls: x.hinweise.klassen.join(", ") })}</span>}
                {x.hinweise?.adr && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.hintAdr}</span>}
                {x.hinweise?.stapler && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.hintForklift}</span>}
                {x.hinweise?.westbalkan && <span className="rounded-full bg-slate-100 px-2 py-0.5">{t.hintWestbalkan}</span>}
                <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[color:var(--color-ink-soft)]">{fillIn(t.source, { src: SOURCE_NAME[x.source] ?? x.source })}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className={saved.has(x.key) ? "btn-ghost" : "btn-primary"} disabled={saved.has(x.key) || saving === x.key} onClick={() => save(x)}>{saved.has(x.key) ? `✓ ${t.saved}` : saving === x.key ? "…" : t.save}</button>
              <a href={x.url} target="_blank" rel="noreferrer noopener" className="text-xs underline">{t.openAd}</a>
            </div>
          </li>
        ))}
      </ul>
      {treffer.some((x) => hatHinweise(x.hinweise)) && <p className="text-xs text-[color:var(--color-ink-soft)]">{t.hintsNote}</p>}
      {more && !busy && <button className="btn-outline" onClick={() => search(page + 1)}>{t.more}</button>}

      {was.trim().length > 1 && (
        <div className="card text-sm">
          <div className="font-semibold">{t.alsoSearch}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {portalSearchLinks(was.trim(), wo.trim()).map((l) => <a key={l.key} href={l.href} target="_blank" rel="noreferrer noopener" className="btn-outline py-1">{l.label} ↗</a>)}
          </div>
          <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">{t.alsoHint}</p>
        </div>
      )}
    </div>
  );
}
