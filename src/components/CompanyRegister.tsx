"use client";

import { useState } from "react";
import type { JobCategory } from "@/lib/jobs";

export function CompanyRegister({
  jobCategories,
  jobGroups,
  isLoggedIn,
}: {
  jobCategories: JobCategory[];
  jobGroups: Record<
    string,
    { de: string; en: string; fr: string; ar: string; icon: string }
  >;
  isLoggedIn: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [industry, setIndustry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [customJobTitle, setCustomJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [requiredGermanLevel, setRequiredGermanLevel] = useState("B1");
  const [minYearsExperience, setMinYearsExperience] = useState(0);
  const [salaryMin, setSalaryMin] = useState<number | "">("");
  const [salaryMax, setSalaryMax] = useState<number | "">("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/company/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account: isLoggedIn ? null : { email, password },
        company: { companyName, contactName, industry, city, website, description },
        jobRequest: {
          jobCategory: jobCategory || "__custom__",
          customJobTitle: customJobTitle || null,
          description: jobDescription,
          requiredGermanLevel,
          minYearsExperience,
          salaryMin: salaryMin === "" ? null : Number(salaryMin),
          salaryMax: salaryMax === "" ? null : Number(salaryMax),
          location,
        },
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(
        data.error === "ALREADY_REGISTERED"
          ? "Diese E-Mail ist bereits registriert."
          : data.error ?? "Fehler"
      );
      return;
    }
    window.location.href = data.next ?? "/firmen/dashboard";
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-6">
      {!isLoggedIn && (
        <fieldset className="space-y-3">
          <legend className="font-semibold">Account</legend>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="label">Geschäftliche E-Mail *</label>
              <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label">Passwort *</label>
              <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
        </fieldset>
      )}

      <fieldset className="space-y-3">
        <legend className="font-semibold">Unternehmen</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="label">Firmenname *</label>
            <input className="input" required value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <label className="label">Ansprechpartner:in</label>
            <input className="input" value={contactName} onChange={(e) => setContactName(e.target.value)} />
          </div>
          <div>
            <label className="label">Branche</label>
            <input className="input" placeholder="z.B. Pflege" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>
          <div>
            <label className="label">Stadt</label>
            <input className="input" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Webseite</label>
          <input className="input" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
        <div>
          <label className="label">Kurzbeschreibung</label>
          <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-semibold">Erste Stellenanfrage</legend>
        <div>
          <label className="label">Berufsgruppe *</label>
          <select className="select" required value={jobCategory} onChange={(e) => setJobCategory(e.target.value)}>
            <option value="">— bitte wählen —</option>
            {Object.entries(jobGroups).map(([slug, g]) => (
              <optgroup key={slug} label={`${g.icon}  ${g.de}`}>
                {jobCategories.filter((j) => j.group === slug).map((j) => (
                  <option key={j.slug} value={j.slug}>{j.de}</option>
                ))}
              </optgroup>
            ))}
            <option value="__custom__">⚙ Sonderanfrage / anderer Beruf …</option>
          </select>
        </div>
        <div>
          <label className="label">
            {jobCategory === "__custom__" ? "Bitte Beruf benennen *" : "Genauer Jobtitel (optional)"}
          </label>
          <input
            className="input"
            placeholder="z.B. Pflegefachkraft Stationsleitung"
            value={customJobTitle}
            onChange={(e) => setCustomJobTitle(e.target.value)}
            required={jobCategory === "__custom__"}
          />
          {jobCategory === "__custom__" && (
            <p className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
              Sonderanfrage — landet direkt bei der Vermittlung, die Sie binnen 1 Werktag kontaktiert.
            </p>
          )}
        </div>
        <div>
          <label className="label">Beschreibung der Stelle</label>
          <textarea className="textarea" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="label">Mind. Deutschniveau</label>
            <select className="select" value={requiredGermanLevel} onChange={(e) => setRequiredGermanLevel(e.target.value)}>
              {["NONE", "A1", "A2", "B1", "B2", "C1"].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mind. Berufserfahrung (J.)</label>
            <input className="input" type="number" min={0} value={minYearsExperience} onChange={(e) => setMinYearsExperience(parseInt(e.target.value || "0"))} />
          </div>
          <div>
            <label className="label">Standort</label>
            <input className="input" placeholder="Stadt" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <div>
            <label className="label">Gehalt min. (€/Mon.)</label>
            <input className="input" type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value === "" ? "" : parseInt(e.target.value))} />
          </div>
          <div>
            <label className="label">Gehalt max. (€/Mon.)</label>
            <input className="input" type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value === "" ? "" : parseInt(e.target.value))} />
          </div>
        </div>
      </fieldset>

      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}

      <button className="btn-primary w-full" disabled={loading}>
        {loading ? "Speichere…" : "Registrieren & Anfrage senden"}
      </button>
    </form>
  );
}
