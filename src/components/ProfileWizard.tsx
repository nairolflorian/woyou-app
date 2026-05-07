"use client";

import { useState } from "react";
import type { JobCategory } from "@/lib/jobs";
import { useT } from "@/components/TranslationProvider";

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
  const { t, locale } = useT();
  const [data, setData] = useState<ProfileData>(initial);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localizedGroup = (g: { de: string; en: string; fr: string; ar: string }) =>
    (g as Record<string, string>)[locale] ?? g.de;
  const localizedJob = (j: JobCategory) =>
    (j as Record<string, string>)[locale] ?? j.de;

  const steps = [
    t("reg.section_personal"),
    t("reg.section_contact"),
    t("reg.section_job"),
    t("reg.section_languages"),
    t("reg.section_situation"),
    t("reg.section_consent"),
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
      setError(err.error ?? t("common.error_generic"));
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
          <span>
            {t("reg.step")} {step + 1} {t("reg.of")} {steps.length}
          </span>
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
          <Section title={t("reg.section_personal_h")}>
            <Row>
              <Field label={t("reg.first_name_required")}>
                <input className="input" value={data.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </Field>
              <Field label={t("reg.last_name_required")}>
                <input className="input" value={data.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.dob_required")}>
                <input className="input" type="date" value={data.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} />
              </Field>
              <Field label={t("reg.gender")}>
                <select className="select" value={data.gender} onChange={(e) => update("gender", e.target.value)}>
                  <option value="">{t("common.please_choose")}</option>
                  <option value="male">{t("common.male")}</option>
                  <option value="female">{t("common.female")}</option>
                  <option value="diverse">{t("common.diverse")}</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.nationality_required")}>
                <input className="input" value={data.nationality} onChange={(e) => update("nationality", e.target.value)} />
              </Field>
              <Field label={t("reg.country_residence_required")}>
                <input className="input" value={data.countryOfResidence} onChange={(e) => update("countryOfResidence", e.target.value)} />
              </Field>
            </Row>
            <Field label={t("reg.city_required")}>
              <input className="input" value={data.city} onChange={(e) => update("city", e.target.value)} />
            </Field>
          </Section>
        )}

        {step === 1 && (
          <Section title={t("reg.section_contact_h")}>
            <Field label={t("reg.preferred_channel")}>
              <select className="select" value={data.preferredChannel} onChange={(e) => update("preferredChannel", e.target.value)}>
                <option value="EMAIL">{t("auth.email")}</option>
                <option value="TELEGRAM">Telegram</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">{t("auth.phone")}</option>
              </select>
            </Field>
            <Row>
              <Field label={t("reg.telegram_handle")}>
                <input className="input" placeholder="@meinhandle" value={data.telegramHandle} onChange={(e) => update("telegramHandle", e.target.value)} />
              </Field>
              <Field label={t("reg.whatsapp_number")}>
                <input className="input" placeholder="+212 …" value={data.whatsappNumber} onChange={(e) => update("whatsappNumber", e.target.value)} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 2 && (
          <Section title={t("reg.section_job_h")}>
            <Field label={t("reg.desired_category_required")}>
              <select className="select" value={data.desiredJobCategory} onChange={(e) => update("desiredJobCategory", e.target.value)}>
                <option value="">{t("common.please_choose")}</option>
                {Object.entries(jobGroups).map(([slug, g]) => (
                  <optgroup key={slug} label={`${g.icon}  ${localizedGroup(g)}`}>
                    {jobCategories.filter((j) => j.group === slug).map((j) => (
                      <option key={j.slug} value={j.slug}>{localizedJob(j)}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label={t("reg.desired_title")}>
              <input className="input" value={data.desiredJobTitle} onChange={(e) => update("desiredJobTitle", e.target.value)} />
            </Field>
            <Field label={t("reg.alternative_jobs_csv")}>
              <input
                className="input"
                value={data.alternativeJobs.join(", ")}
                onChange={(e) => update("alternativeJobs", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              />
            </Field>
            <Row>
              <Field label={t("reg.education")}>
                <select className="select" value={data.educationLevel} onChange={(e) => update("educationLevel", e.target.value)}>
                  <option value="">—</option>
                  <option value="none">{t("reg.education_options.none")}</option>
                  <option value="school">{t("reg.education_options.school")}</option>
                  <option value="apprenticeship">{t("reg.education_options.apprenticeship")}</option>
                  <option value="bachelor">{t("reg.education_options.bachelor")}</option>
                  <option value="master">{t("reg.education_options.master")}</option>
                  <option value="phd">{t("reg.education_options.phd")}</option>
                </select>
              </Field>
              <Field label={t("reg.experience_required")}>
                <input className="input" type="number" min={0} value={data.yearsExperience} onChange={(e) => update("yearsExperience", parseInt(e.target.value || "0"))} />
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.current_job")}>
                <input className="input" value={data.currentJob} onChange={(e) => update("currentJob", e.target.value)} />
              </Field>
              <Field label={t("reg.current_employer")}>
                <input className="input" value={data.currentEmployer} onChange={(e) => update("currentEmployer", e.target.value)} />
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.earliest_start_required")}>
                <input className="input" type="date" value={data.earliestStart} onChange={(e) => update("earliestStart", e.target.value)} />
              </Field>
              <Field label={t("reg.driving_license")}>
                <select className="select" value={data.drivingLicense ? "yes" : "no"} onChange={(e) => update("drivingLicense", e.target.value === "yes")}>
                  <option value="no">{t("common.no")}</option>
                  <option value="yes">{t("common.yes")}</option>
                </select>
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.salary_min")}>
                <input className="input" type="number" min={0} value={data.expectedSalaryMin ?? ""} onChange={(e) => update("expectedSalaryMin", e.target.value ? parseInt(e.target.value) : undefined)} />
              </Field>
              <Field label={t("reg.salary_max")}>
                <input className="input" type="number" min={0} value={data.expectedSalaryMax ?? ""} onChange={(e) => update("expectedSalaryMax", e.target.value ? parseInt(e.target.value) : undefined)} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 3 && (
          <Section title={t("reg.section_languages_h")}>
            <Row>
              <Field label={t("reg.german_level") + " *"}>
                <select className="select" value={data.germanLevel} onChange={(e) => update("germanLevel", e.target.value)}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
              <Field label={t("reg.english_level")}>
                <select className="select" value={data.englishLevel} onChange={(e) => update("englishLevel", e.target.value)}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
              </Field>
            </Row>
            <Field label={t("reg.other_languages")}>
              {data.otherLanguages.map((l, i) => (
                <Row key={i}>
                  <input className="input" value={l.lang} onChange={(e) => {
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
                {t("reg.add_language")}
              </button>
            </Field>
            <div className="mt-4 rounded-lg bg-[color:var(--color-brand-soft)] p-4 text-sm">
              {(() => {
                const raw = t("reg.test_hint");
                const m = raw.match(/^(.*)<a>(.*)<\/a>(.*)$/);
                if (!m) return raw;
                return (
                  <>
                    {m[1]}
                    <a href="/sprachtest" className="text-[color:var(--color-brand)] font-semibold underline">
                      {m[2]}
                    </a>
                    {m[3]}
                  </>
                );
              })()}
            </div>
          </Section>
        )}

        {step === 4 && (
          <Section title={t("reg.section_situation_h")}>
            <Row>
              <Field label={t("reg.relocate")}>
                <select className="select" value={data.willingnessToRelocate ? "yes" : "no"} onChange={(e) => update("willingnessToRelocate", e.target.value === "yes")}>
                  <option value="yes">{t("reg.relocate_yes_de")}</option>
                  <option value="no">{t("reg.relocate_no")}</option>
                </select>
              </Field>
              <Field label={t("reg.preferred_cities_csv")}>
                <input
                  className="input"
                  placeholder="Berlin, München, Hamburg"
                  value={data.preferredCities.join(", ")}
                  onChange={(e) => update("preferredCities", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                />
              </Field>
            </Row>
            <Row>
              <Field label={t("reg.family_status")}>
                <select className="select" value={data.familyStatus} onChange={(e) => update("familyStatus", e.target.value)}>
                  <option value="">—</option>
                  <option value="single">{t("common.single")}</option>
                  <option value="married">{t("common.married")}</option>
                  <option value="other">{t("common.other")}</option>
                </select>
              </Field>
              <Field label={t("reg.dependents")}>
                <input className="input" type="number" min={0} value={data.dependents} onChange={(e) => update("dependents", parseInt(e.target.value || "0"))} />
              </Field>
            </Row>
          </Section>
        )}

        {step === 5 && (
          <Section title={t("reg.section_consent_h")}>
            <Field label={t("reg.about_me_required")}>
              <textarea className="textarea" value={data.aboutMe} onChange={(e) => update("aboutMe", e.target.value)} />
            </Field>
            <Field label={t("reg.motivation_required")}>
              <textarea className="textarea" value={data.motivation} onChange={(e) => update("motivation", e.target.value)} />
            </Field>
            <Field label={t("reg.consent_mode")}>
              <div className="space-y-2 text-sm">
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${data.consentMode === "BLANKET" ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`}>
                  <input type="radio" name="consent" value="BLANKET" checked={data.consentMode === "BLANKET"} onChange={() => update("consentMode", "BLANKET")} />
                  <span>
                    <strong>{t("reg.consent_blanket_strong")}</strong>{" "}
                    {t("reg.consent_blanket_text")}
                  </span>
                </label>
                <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${data.consentMode === "PER_COMPANY" ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]" : "border-[color:var(--color-border)]"}`}>
                  <input type="radio" name="consent" value="PER_COMPANY" checked={data.consentMode === "PER_COMPANY"} onChange={() => update("consentMode", "PER_COMPANY")} />
                  <span>
                    <strong>{t("reg.consent_per_company_strong")}</strong>{" "}
                    {t("reg.consent_per_company_text")}
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
            {t("reg.back")}
          </button>
          <div className="text-xs text-[color:var(--color-ink-soft)]">
            {savedAt && t("reg.cached_at", { time: savedAt })}
          </div>
          {step < steps.length - 1 ? (
            <button type="button" onClick={() => save({ advance: true })} disabled={saving} className="btn-primary">
              {saving ? t("reg.saving") : t("reg.save_continue")}
            </button>
          ) : (
            <button type="button" onClick={() => save({ finish: true })} disabled={saving} className="btn-primary">
              {saving ? t("reg.saving") : t("reg.finish")}
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
