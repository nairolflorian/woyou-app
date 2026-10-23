"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fillIn, type werkzeugText } from "@/lib/werkzeug-text";
import type { VersandUI } from "@/lib/versand-text";
import { mailtoLink, isEmail } from "@/lib/stellensuche-core";
import type { TrackerItem } from "@/lib/tracker";

type T = ReturnType<typeof werkzeugText>;
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const inDays = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return d; };

async function copyText(s: string) {
  try { await navigator.clipboard.writeText(s); return true; } catch { /* z. B. ohne Freigabe: alter Weg */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = s; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  } catch { return false; }
}

// Selbstversand je Stelle: 1. Anschreiben, Lebenslauf und E-Mail prüfen, 2. selbst aus dem eigenen Postfach senden
// (mailto, PDF, .eml, Kopieren), 3. „Ich habe gesendet“ eintragen. WoYou verschickt hier nichts.
export function VersandPanel({ x, t, v, dl, active, fromEmail, ownCv, onChange }: {
  x: TrackerItem; t: T; v: VersandUI; dl: string; active: boolean; fromEmail: string; ownCv: boolean; onChange: (x: TrackerItem) => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [letter, setLetter] = useState(x.coverLetter ?? "");
  const [lang, setLang] = useState(x.letterLang);
  const [to, setTo] = useState(x.mailTo);
  const [subject, setSubject] = useState(x.mailSubject);
  const [body, setBody] = useState(x.mailBody);
  const [sentOn, setSentOn] = useState(ymd(new Date()));
  const [remind, setRemind] = useState(true);
  const [followOn, setFollowOn] = useState(ymd(inDays(7)));
  const [copied, setCopied] = useState<string | null>(null);
  const tried = useRef(false);
  const base = `/api/stellen/${x.id}`;
  const mailto = useMemo(() => mailtoLink(to, subject, body), [to, subject, body]);
  const employer = x.applyUrl ?? x.url;

  async function patch(data: Record<string, unknown>, label: string) {
    setBusy(label); setMsg(null);
    const r = await fetch(base, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? t.failed }); return null; }
    onChange(j.item);
    return j.item as TrackerItem;
  }
  async function generate() {
    setBusy("generate"); setMsg(null);
    const r = await fetch(`${base}/anschreiben`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lang }) });
    const j = await r.json().catch(() => ({}));
    setBusy(null);
    if (!r.ok) { setMsg({ ok: false, t: j.error ?? t.failed }); return; }
    onChange(j.item); setLetter(j.item.coverLetter ?? "");
    // Sprache gewechselt und Entwurf noch nicht geändert: Vorschlag in der neuen Sprache übernehmen
    if (!j.item.draftEdited) { setSubject(j.item.mailSubject); setBody(j.item.mailBody); }
  }
  // Beim ersten Öffnen ohne Anschreiben: aus der Mappe vorbelegen
  useEffect(() => {
    if (open && active && x.coverLetter === null && !tried.current) { tried.current = true; void generate(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function saveDraft() {
    if (to.trim() && !isEmail(to)) { setMsg({ ok: false, t: t.failed }); return false; }
    const data: Record<string, unknown> = {};
    if (to !== x.mailTo) data.mailTo = to;
    if (subject !== x.mailSubject) data.mailSubject = subject;
    if (body !== x.mailBody) data.mailBody = body;
    if (letter !== (x.coverLetter ?? "") && x.coverLetter !== null) data.coverLetter = letter;
    if (!Object.keys(data).length) return true;
    return !!(await patch(data, "draft"));
  }
  async function resetDraft() {
    const it = await patch({ resetDraft: true }, "reset");
    if (it) { setSubject(it.mailSubject); setBody(it.mailBody); }
  }
  async function copy(key: string, s: string) {
    if (await copyText(s)) { setCopied(key); setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000); }
  }
  async function sent() {
    const it = await patch({ status: x.status === "SAVED" ? "APPLIED" : x.status, appliedAt: sentOn, followUpAt: remind ? followOn : null }, "sent");
    if (it) { setOpen(false); setStep(1); setMsg(null); }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn-primary" onClick={() => setOpen(true)}>{v.open}</button>
        {employer && <a className="btn-outline" href={employer} target="_blank" rel="noreferrer noopener">{t.openAd} ↗</a>}
      </div>
    );
  }

  const stepBtn = (n: 1 | 2 | 3, label: string) => (
    <button key={n} className={`rounded-full px-3 py-1 text-xs font-semibold ${step === n ? "bg-[color:var(--color-brand)] text-white" : "bg-[color:var(--color-surface)] text-[color:var(--color-ink-soft)]"}`}
      onClick={async () => { if (n > step && step === 1 && active && !(await saveDraft())) return; setStep(n); }} aria-current={step === n ? "step" : undefined}>{label}</button>
  );
  const hasLetter = x.coverLetter !== null;

  return (
    <div className="rounded-xl border border-[color:var(--color-border)] p-3 md:p-4 space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        {stepBtn(1, v.stepCheck)}{stepBtn(2, v.stepSend)}{stepBtn(3, v.stepDone)}
        <span className="flex-1" />
        <button className="btn-ghost text-xs" onClick={() => setOpen(false)} aria-label={v.back}>✕</button>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <section className="space-y-2">
            <h4 className="font-semibold">{v.letterHead}</h4>
            {!hasLetter && <p className="text-xs text-[color:var(--color-ink-soft)]">{busy === "generate" ? t.generating : v.needLetter}</p>}
            <div className="flex flex-wrap items-center gap-2">
              {x.hasEnglish && (
                <label className="text-xs">{t.letterLang}{" "}
                  <select className="input inline-block w-auto py-1" value={lang} disabled={!active || !!busy} onChange={(e) => setLang(e.target.value as "de" | "en")}><option value="de">Deutsch</option><option value="en">English</option></select>
                </label>
              )}
              {active && <button className="btn-outline py-1" disabled={!!busy} onClick={generate}>{busy === "generate" ? t.generating : hasLetter ? t.regenerate : t.generate}</button>}
              {hasLetter && <a className="btn-ghost py-1" href={`${base}/dokument?format=pdf&inline=1`} target="_blank" rel="noopener">{v.letterView} ↗</a>}
            </div>
            {hasLetter && (
              <>
                <p className="text-xs text-[color:var(--color-ink-soft)]">{v.letterHint}</p>
                <textarea className="input min-h-72 text-sm leading-relaxed" value={letter} disabled={!active} maxLength={6000} aria-label={v.letterHead}
                  onChange={(e) => setLetter(e.target.value)} onBlur={() => letter !== (x.coverLetter ?? "") && patch({ coverLetter: letter }, "letter")} />
              </>
            )}
          </section>

          <section className="space-y-2">
            <h4 className="font-semibold">{v.cvHead}</h4>
            <p className="text-xs text-[color:var(--color-ink-soft)]">{v.cvHint}</p>
            <div className="flex flex-wrap gap-2">
              {hasLetter && <a className="btn-ghost py-1" href={`${base}/dokument?format=cv&inline=1`} target="_blank" rel="noopener">{v.cvView} ↗</a>}
              <Link className="btn-ghost py-1" href="/bewerbungsmappe">{v.cvEdit}</Link>
            </div>
          </section>

          <section className="space-y-3">
            <h4 className="font-semibold">{v.mailHead}</h4>
            <label className="block text-xs">{v.to}
              <input type="email" inputMode="email" autoComplete="off" className="input mt-1" value={to} placeholder={v.toPh} disabled={!active} maxLength={200}
                onChange={(e) => setTo(e.target.value.trim())} onBlur={() => to !== x.mailTo && (!to || isEmail(to)) && patch({ mailTo: to }, "to")} />
            </label>
            {to && x.email && to === x.email && <p className="text-xs text-[color:var(--color-ink-soft)]">{v.toFromAd}</p>}
            {to && !isEmail(to) && <p className="text-xs text-rose-700">{t.failed}</p>}
            {!to && <p className="text-xs rounded bg-amber-50 border border-amber-200 text-amber-900 p-2">{v.toMissing}</p>}
            {employer && <a className="btn-ghost py-1 inline-flex" href={employer} target="_blank" rel="noreferrer noopener">{v.portal} ↗</a>}
            <label className="block text-xs">{v.subject}
              <input className="input mt-1" value={subject} disabled={!active} maxLength={300} onChange={(e) => setSubject(e.target.value)} onBlur={() => subject !== x.mailSubject && patch({ mailSubject: subject }, "subject")} />
            </label>
            <label className="block text-xs">{v.body}
              <textarea className="input mt-1 min-h-48 text-sm leading-relaxed" value={body} disabled={!active} maxLength={6000} onChange={(e) => setBody(e.target.value)} onBlur={() => body !== x.mailBody && patch({ mailBody: body }, "body")} />
            </label>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-ink-soft)]">
              <span>{fromEmail ? fillIn(v.from, { email: fromEmail }) : v.fromNone}</span>
              <Link href="/profil#bewerbungsmail" className="text-[color:var(--color-brand)]">{v.fromChange}</Link>
              {active && x.draftEdited && <button className="btn-ghost text-xs py-0" disabled={!!busy} onClick={resetDraft}>{v.reset}</button>}
            </div>
          </section>
          <div className="flex justify-end">
            <button className="btn-primary" disabled={busy === "generate" || !hasLetter} onClick={async () => { if (!active || (await saveDraft())) setStep(2); }}>{v.next}</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <p className="rounded bg-[color:var(--color-brand-soft)] p-3">{v.sendLead}</p>
          <section className="space-y-2">
            <a className="btn-primary inline-flex" href={mailto.href}>✉ {v.openMail}</a>
            <p className="text-xs text-[color:var(--color-ink-soft)]">{v.openMailHint}</p>
            {!isEmail(to) && <p className="text-xs text-[color:var(--color-ink-soft)]">{v.noRecipient}</p>}
            {mailto.truncated && <p className="text-xs rounded bg-amber-50 border border-amber-200 text-amber-900 p-2">{v.truncated}</p>}
          </section>
          <section className="space-y-2">
            <h4 className="font-semibold">{v.pdfHead}</h4>
            <div className="flex flex-wrap items-center gap-2">
              {!ownCv && <a className="btn-outline" href={`${base}/dokument?format=bundle`} download>⬇ {v.bundle}</a>}
              <a className={ownCv ? "btn-outline" : "btn-ghost py-1 text-xs"} href={`${base}/dokument?format=pdf`} download>⬇ {v.letterPdf}</a>
              <a className={ownCv ? "btn-outline" : "btn-ghost py-1 text-xs"} href={`${base}/dokument?format=cv`} download>⬇ {v.cvPdf}</a>
            </div>
            {ownCv && <p className="text-xs text-[color:var(--color-ink-soft)]">{v.twoFiles}</p>}
          </section>
          <section className="hidden md:block space-y-1">
            <a className="btn-outline inline-flex" href={`${base}/eml`} download>⬇ {v.eml}</a>
            <p className="text-xs text-[color:var(--color-ink-soft)]">{v.emlHint}</p>
          </section>
          <section className="space-y-2">
            <h4 className="font-semibold">{v.copyHead}</h4>
            <div className="flex flex-wrap gap-2">
              {isEmail(to) && <button className="btn-ghost py-1" onClick={() => copy("to", to)}>{copied === "to" ? `✓ ${v.copied}` : v.copyTo}</button>}
              <button className="btn-ghost py-1" onClick={() => copy("subject", subject)}>{copied === "subject" ? `✓ ${v.copied}` : v.copySubject}</button>
              <button className="btn-ghost py-1" onClick={() => copy("body", body)}>{copied === "body" ? `✓ ${v.copied}` : v.copyBody}</button>
            </div>
          </section>
          <details className="rounded-lg bg-[color:var(--color-surface)] p-3">
            <summary className="cursor-pointer font-semibold">{v.howTo}</summary>
            <dl className="mt-2 space-y-2 text-xs">
              {v.howToList.map((h) => <div key={h.title}><dt className="font-semibold">{h.title}</dt><dd className="text-[color:var(--color-ink-soft)]">{h.text}</dd></div>)}
            </dl>
          </details>
          <div className="flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(1)}>{v.back}</button>
            <button className="btn-primary" onClick={() => setStep(3)}>{v.next}</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold">{v.doneHead}</h4>
            <p className="text-xs text-[color:var(--color-ink-soft)]">{v.doneLead}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs">{v.sentOn}
              <input type="date" className="input mt-1" value={sentOn} max={ymd(new Date())} disabled={!active} onChange={(e) => setSentOn(e.target.value)} />
            </label>
            <div className="text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" checked={remind} disabled={!active} onChange={(e) => setRemind(e.target.checked)} /> {v.followUp}</label>
              <input type="date" className="input mt-1" value={followOn} disabled={!active || !remind} onChange={(e) => setFollowOn(e.target.value)} aria-label={v.followUp} />
            </div>
          </div>
          <div className="flex justify-between">
            <button className="btn-ghost" onClick={() => setStep(2)}>{v.back}</button>
            {active && <button className="btn-primary" disabled={!!busy || !sentOn} onClick={sent}>✓ {v.sentBtn}</button>}
          </div>
          {x.appliedAt && <p className="text-xs text-emerald-800">{fillIn(v.sentOk, { date: new Date(x.appliedAt).toLocaleDateString(dl) })}</p>}
        </div>
      )}
      {msg && <p className={`text-xs rounded p-2 ${msg.ok ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{msg.t}</p>}
    </div>
  );
}
