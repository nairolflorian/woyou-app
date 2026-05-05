"use client";

import { useState } from "react";
import type { JobCategory } from "@/lib/jobs";

type LangPair = { lang: string; level: string };

export type ProfileData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  countryOfResidence: string;
  city: string;
  preferredChannel: string;
  telegramHandle: string;
  whatsappNumber: string;
  desiredJobCategory: string;
  desiredJobTitle: string;
  alternativeJobs: string[];
  educationLevel: string;
  yearsExperience: number;
  currentJob: string;
  currentEmployer: string;
  drivingLicense: boolean;
  willingnessToRelocate: boolean;
  preferredCities: string[];
  earliestStart: string;
  expectedSalaryMin?: number;
  expectedSalaryMax?: number;
  germanLevel: string;
  englishLevel: string;
  otherLanguages: LangPair[];
  aboutMe: string;
  motivation: string;
  familyStatus: string;
  dependents: number;
  consentMode: "BLANKET" | "PER_COMPANY";
};

const LEVELS = ["NONE", "A1", "A2", "B1", "B2", "C1", "C2"];

export function ProfileWizard({
  initial,
  jobCategories,
  jobGroups,
}: {
  initial: ProfileData;
  jobCategories: JobCategory[];
  jobGroups: Record<
    string,
    { de: string; en: string; fr: string; ar: string; icon: string }
  >;
}) {
  const [data, setData] = useState<ProfileData>(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    "Über dich",
    "Kontaktwege",
    "Wunschberuf",
    "Sprachen",
    "Situation",
    "Motivation & Einwilligung",
  ];

  function update<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  async function save(opts?: { advance?: boolean; finish?: boolean }) {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/candidate/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err.error ?? "Fehler beim Speichern");
      return;
    }
    setSavedAt(new Date().toLocaleTimeString());
    if (opts?.finish) {
      window.location.href = "/profil?saved=1";
    } else if (opts?.advance) {
      setStep((s) => Math.min(s + 1, steps.length - 1));
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-[color:var(--color-ink-soft)]">
          <span>Schritt {step + 1} von {steps.length}</span>
          <span>{steps[step]}</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[color:var(--color-border)] overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-brand)] transition-all"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="card">
        {step === 0 && (
          <Section title="Über dich">
            <Row>
              <Field label="Vorname *">
                <input className="input" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </Field>
              <Field label="Nachname *">
                <input className="input" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="Geburtsdatum *">
                <input className="input" type="date" value={data.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
              </Field>
              <Field label="Geschlecht">
                <select className="select" value={data.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="">— bitte wählen —</option>
                  <option value="male">männlich</option>
                  <option value="female">weiblich</option>
                  <option value="diverse">divers</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Staatsangehörigkeit *">
                <input className="input" placeholder="z.B. Marokkanisch" value={data.nationality} onChange={(e) => update("nationality", e.target.value)} />
              </Field>
              <Field label="Aktuelles Wohnland *">
                <input className="input" placeholder="z.B. Marokko" value={data.countryOfResidence} onChange={(e) => update("countryOfResidence", e.target.value)} />
              </Field>
            </Row>
            <Field label="Stadt *">
              <input className="input" value={data.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
          </Section>
        )}

        {step === 1 && (
          <Section title="Kontaktwege">
            <Field label="Bevorzugter Kontaktweg">
              <select className="select" value={data.preferredChannel} onChange={(e) => update("preferredChannel", e.target.value)}>
                <option value="EMAIL">E-Mail</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Telefon</option>
              </select>
            </Field>
            <Row>
              <Field label="Telegram-Benutzername">
                <input className="input" placeholder="@meinhandle" value={data.telegramHandle} onChange={(e) => update("telegramHandle", e.target.value)} />
              </Field>
              <Field label="WhatsApp-Nummer">
                <input className="input" placeholder="+212 …" value={data.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 2 && (
          <Section title="Wunschberuf">
            <Field label="Berufsgruppe *">
              <select className="select" value={data.desiredJobCategory} onChange={(e) => update("desiredJobCategory", e.target.value)}>
                <option value="">— bitte wählen —</option>
                {Object.entries(jobGroups).map(([slug, g]) => (
                  <optgroup key={slug} label={`${g.icon}  ${g.de}`}>
                    {jobCategories.filter((j) => j.group === slug).map((j) => (
                      <option key={j.slug} value={j.slug}>{j.de}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Genauer Berufswunsch">
              <input className="input" placeholder="z.B. Krankenpfleger:in mit OP-Erfahrung" value={data.desiredJobTitle} onChange={(e) => update("desiredJobTitle", e.target.value)} />
            </Field>
            <Field label="Welche anderen Berufe wären auch denkbar? (Komma-getrennt)">
              <input
                className="input"
                value={data.alternativeJobs.join(", ")}
                onChange={(e) => update("alternativeJobs", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
            <Row>
              <Field label="Höchster Abschluss">
                <select className="select" value={data.educationLevel} onChange={(e) => update("educationLevel", e.target.value)}>
                  <option value="">—</option>
                  <option value="none">Kein Abschluss</option>
                  <option value="school">Schulabschluss</option>
                  <option value="apprenticeship">Berufsausbildung</option>
                  <option value="bachelor">Bachelor</option>
                  <option value="master">Master</option>
                  <option value="phd">Promotion</option>
                </select>
              </Field>
              <Field label="Berufserfahrung (Jahre) *">
                <input className="input" type="number" min={0} value={data.yearsExperience} onChange={(e) => update("yearsExperience", parseInt(e.target.value || "0"))} />
              </Field>
            </Row>
            <Row>
              <Field label="Aktueller Beruf">
                <input className="input" value={data.currentJob} onChange={(e) => update("currentJob", e.target.value)} />
              </Field>
              <Field label="Aktueller Arbeitgeber">
                <input className="input" value={data.currentEmployer} onChange={(e) => update("currentEmployer", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label="Frühestmöglicher Start *">
                <input className="input" type="date" value={data.earliestStart} onChange={(e) => update("earliestStart", e.target.value)} />
              </Field>
              <Field label="Führerschein?">
                <select className="select" value={data.drivingLicense ? "yes" : "no"} onChange={(e) => update("drivingLicense", e.target.value === "yes")}>
                  <option value="no">Nein</option>
                  <option value="yes">Ja</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label="Gehaltsvorstellung min. (€/Monat)">
                <input className="input" type="number" min={0} value={data.expectedSalaryMin ?? ""} onChange={(e) => update("expectedSalaryMin", e.target.value ? parseInt(e.target.value) : undefined)} />
              </Field>
              <Field label="Gehaltsvorstellung max. (€/Monat)">
                <input className="input" type="number" min={0} value={data.expectedSalaryMax ?? ""} onChange={(e) => update("expectedSalaryMax", e.target.value ? parseInt(e.target.value) : undefined)} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 3 && (
          <Section title="Sprachen">
            <Row>
              <Field label="Deutsch *">
                <select className="select" value={data.germanLevel} onChange={(e) => update("germanLevel", e.target.value)}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label="Englisch">
                <select className="select" value={data.englishLevel} onChange={(e) => update("englishLevel", e.target.value)}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            </Row>
            <Field label="Weitere Sprachen">
              {data.otherLanguages.map((l, i) => (
                <Row key={i}>
                  <input className="input" placeholder="Sprache" value={l.lang} onChange={(e) => {
                    const next = [...data.otherLanguages]; next[i] = { ...l, lang: e.target.value }; update("otherLanguages", next);
                  }} />
                  <select className="select" value={l.level} onChange={(e) => {
                    const next = [...data.otherLanguages]; next[i] = { ...l, level: e.target.value }; update("otherLanguages", next);
                  }}>
                    {LEVELS.map((lv) => <option key={lv} value={lv}>{lv}</option>)}
                  </select>
                </Row>
              ))}
              <button
                type="button"
                onClick={() => update("otherLanguages", [...data.otherLanguages, { lang: "", level: "A1" }])}
                className="btn-ghost mt-2"
              >
                + Sprache hinzufügen
              </button>
            </Field>
            <div className="mt-4 rounded-lg bg-[color:var(--color-brand-soft)] p-4 text-sm">
              💡 Du kannst zusätzlich unseren <a href="/sprachtest" className="text-[color:var(--color-brand)] font-semibold underline">kurzen Sprachtest</a> machen, damit Unternehmen dein Niveau objektiv sehen.
            </div>
          </Section>
        )}

        {step === 4 && (
          <Section title="Deine Situation">
            <Row>
              <Field label="Bereit umzuziehen?">
                <select className="select" value={data.willingnessToRelocate ? "yes" : "no"} onChange={(e) => update("willingnessToRelocate", e.target.value === "yes")}>
                  <option value="yes">Ja, deutschlandweit</option>
                  <option value="no">Nein, nur in einer bestimmten Region</option>
                </select>
              </Field>
              <Field label="Wunschstädte (Komma-getrennt)">
                <input
                  className="input"
                  placeholder="Berlin, München, Hamburg"
                  value={data.preferredCities.join(", ")}
                  onChange={(e) => update("preferredCities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
              </Field>
            </Row>
            <Row>
              <Field label="Familienstand">
                <select className="select" value={data.familyStatus} onChange={(e) => update("familyStatus", e.target.value)}>
                  <option value="">—</option>
                  <option value="single">ledig</option>
                  <option value="married">verheiratet</option>
                  <option value="other">andere</option>
                </select>
              </Field>
              <Field label="Anzahl Kinder / Angehörige">
                <input className="input" type="number" min={0} value={data.dependents} onChange={(e) => update("dependents", parseInt(e.target.value || "0"))} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 5 && (
          <Section title="Motivation & Einwilligung">
            <Field label="Über dich (kurze Selbstbeschreibung) *">
              <textarea className="textarea" value={data.aboutMe} onChange={(e) => update("aboutMe", e.target.value)} />
            </Field>
            <Field label="Warum möchtest du in Deutschland arbeiten? *">
              <textarea className="textarea" value={data.motivation} onChange={(e) => update("motivation", e.target.value)} />
            </Field>
            <Field label="Wann dürfen wir dein Profil weitergeben?">
              <div className="space-y-2 text-sm">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${data.consentMode === "BLANKET" ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`}>
                  <input type="radio" name="consent" value="BLANKET" checked={data.consentMode === "BLANKET"} onChange={() => update("consentMode", "BLANKET")} />
                  <span>
                    <strong>Pauschal-Freigabe.</strong> WoYou darf mein Profil passenden Unternehmen direkt vorstellen.
                  </span>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${data.consentMode === "PER_COMPANY" ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`}>
                  <input type="radio" name="consent" value="PER_COMPANY" checked={data.consentMode === "PER_COMPANY"} onChange={() => update("consentMode", "PER_COMPANY")} />
                  <span>
                    <strong>Einzel-Freigabe.</strong> Ich möchte zuerst das Unternehmen sehen und einzeln zustimmen.
                  </span>
                </label>
              </div>
            </Field>
          </Section>
        )}

        {error && (
          <div className="mt-4 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
            {error}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-outline disabled:opacity-50"
          >
            Zurück
          </button>
          <div className="text-xs text-[color:var(--color-ink-soft)]">
            {savedAt && `Zwischengespeichert ${savedAt}`}
          </div>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => save({ advance: true })} disabled={saving} className="btn-primary">
              {saving ? "Speichere…" : "Speichern & weiter"}
            </button>
          ) : (
            <button type="button" onClick={() => save({ finish: true })} disabled={saving} className="btn-primary">
              {saving ? "Speichere…" : "Profil abschließen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  );
}
