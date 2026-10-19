"use client";

import { useState } from "react";
import { evaluate, type Answer, type Verdict } from "@/lib/selfcheck";

const L = {
  de: { title: "Passt WoYou zu dir?", lead: "Vier kurze Fragen, kostenlos. Danach sagen wir dir offen, ob sich eine Buchung für dich lohnt.", job: "Dein Beruf", jobPh: "z. B. Elektriker, Köchin, Buchhalter", degree: "Dein Abschluss", degrees: { none: "kein Abschluss", school: "Schulabschluss", vocational: "Berufsausbildung", university: "Studium" }, german: "Dein Deutschniveau", levels: { none: "keine Kenntnisse", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1 oder besser" }, rec: "Ist dein Abschluss in Deutschland anerkannt?", recs: { yes: "ja", pending: "beantragt", no: "nein", unknown: "weiß ich nicht" }, country: "Dein Land", countryPh: "z. B. Marokko", go: "Ergebnis anzeigen", green: "Buchung sinnvoll", yellow: "Möglich, aber mit Einschränkungen", red: "Wir raten dir ab. Bitte nicht bezahlen.", book: "Jetzt starten · 199 €", contact: "Fragen? Schreib uns: info@woyou.de" },
  en: { title: "Is WoYou right for you?", lead: "Four short questions, free. Then we tell you openly whether booking makes sense for you.", job: "Your profession", jobPh: "e.g. electrician, cook, accountant", degree: "Your qualification", degrees: { none: "none", school: "school leaving certificate", vocational: "vocational training", university: "university degree" }, german: "Your German level", levels: { none: "no German", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1 or better" }, rec: "Is your qualification recognised in Germany?", recs: { yes: "yes", pending: "applied for", no: "no", unknown: "don't know" }, country: "Your country", countryPh: "e.g. Morocco", go: "Show result", green: "Booking makes sense", yellow: "Possible, but with limits", red: "We advise against it. Please don't pay.", book: "Start now · €199", contact: "Questions? Write to us: info@woyou.de" },
  fr: { title: "WoYou vous convient-il ?", lead: "60 secondes, gratuit. Nous vous disons honnêtement si une réservation vaut la peine pour votre profil.", job: "Votre métier", jobPh: "p. ex. électricien, cuisinière, comptable", degree: "Votre diplôme", degrees: { none: "aucun", school: "diplôme scolaire", vocational: "formation professionnelle", university: "études supérieures" }, german: "Votre niveau d'allemand", levels: { none: "aucune connaissance", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1 ou plus" }, rec: "Votre diplôme est-il reconnu en Allemagne ?", recs: { yes: "oui", pending: "demandé", no: "non", unknown: "je ne sais pas" }, country: "Votre pays", countryPh: "p. ex. Maroc", go: "Voir le résultat", green: "Réservation pertinente", yellow: "Possible, avec des limites", red: "Nous vous le déconseillons. Ne payez pas.", book: "Commencer · 199 €", contact: "Des questions ? info@woyou.de" },
  ar: { title: "هل تناسبك WoYou؟", lead: "60 ثانية، مجانًا. نخبرك بصدق إن كان الحجز مفيدًا لملفك.", job: "مهنتك", jobPh: "مثلًا: كهربائي، طباخة، محاسب", degree: "مؤهلك", degrees: { none: "بدون مؤهل", school: "شهادة مدرسية", vocational: "تكوين مهني", university: "دراسة جامعية" }, german: "مستواك في الألمانية", levels: { none: "لا معرفة", A1: "A1", A2: "A2", B1: "B1", B2: "B2", C1: "C1 أو أعلى" }, rec: "هل شهادتك معترف بها في ألمانيا؟", recs: { yes: "نعم", pending: "قيد الطلب", no: "لا", unknown: "لا أعرف" }, country: "بلدك", countryPh: "مثلًا: المغرب", go: "عرض النتيجة", green: "الحجز مفيد", yellow: "ممكن مع قيود", red: "ننصحك بعدم الحجز. لا تدفع.", book: "ابدأ الآن · 199 €", contact: "أسئلة؟ info@woyou.de" },
};

const TONE = { green: "border-emerald-300 bg-emerald-50 text-emerald-900", yellow: "border-amber-300 bg-amber-50 text-amber-900", red: "border-rose-300 bg-rose-50 text-rose-900" };

export function SelfCheck({ locale, bookHref, block }: { locale: string; bookHref: string; block: boolean }) {
  const t = L[(locale in L ? locale : "en") as keyof typeof L];
  const [a, setA] = useState<Answer>({ job: "", degree: "vocational", german: "B1", recognition: "unknown", country: "" });
  const [v, setV] = useState<Verdict | null>(null);
  const set = <K extends keyof Answer>(k: K, val: Answer[K]) => { setA((x) => ({ ...x, [k]: val })); setV(null); };
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <form className="card space-y-3" onSubmit={(e) => { e.preventDefault(); setV(evaluate(a, locale === "de" ? "de" : "en")); }}>
        <div><label className="label">{t.job}</label><input className="input" required maxLength={80} placeholder={t.jobPh} value={a.job} onChange={(e) => set("job", e.target.value)} /></div>
        <div><label className="label">{t.degree}</label><select className="input" value={a.degree} onChange={(e) => set("degree", e.target.value as Answer["degree"])}>{Object.entries(t.degrees).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="label">{t.german}</label><select className="input" value={a.german} onChange={(e) => set("german", e.target.value as Answer["german"])}>{Object.entries(t.levels).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="label">{t.rec}</label><select className="input" value={a.recognition} onChange={(e) => set("recognition", e.target.value as Answer["recognition"])}>{Object.entries(t.recs).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        <div><label className="label">{t.country}</label><input className="input" maxLength={60} placeholder={t.countryPh} value={a.country} onChange={(e) => set("country", e.target.value)} /></div>
        <button className="btn-primary w-full justify-center">{t.go}</button>
      </form>
      <div aria-live="polite">
        {v && (
          <div className={`rounded-2xl border-2 p-6 ${TONE[v.level]}`}>
            <div className="text-lg font-bold">{v.level === "green" ? "✓ " : v.level === "red" ? "✕ " : "! "}{t[v.level]}</div>
            <ul className="mt-3 space-y-2 text-sm">{v.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            {(v.level !== "red" || !block) && <a href={bookHref} className={v.level === "red" ? "btn-outline mt-5 inline-flex" : "btn-primary mt-5 inline-flex"}>{t.book}</a>}
            <p className="mt-4 text-xs opacity-80">{t.contact}</p>
          </div>
        )}
      </div>
    </div>
  );
}
