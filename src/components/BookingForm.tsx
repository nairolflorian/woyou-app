"use client";

import { useState } from "react";

type Copy = { phone: string; jobs: string; regions: string; notes: string; terms: string; waiver: string; submit: string };

export function BookingForm({ copy, defaults }: { copy: Copy; defaults: { phone: string; jobs: string; regions: string } }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageKey: "bewerbung-25",
        contactPhone: f.get("phone"),
        targetJobs: f.get("jobs"),
        targetRegions: f.get("regions"),
        notes: f.get("notes"),
        acceptTerms: f.get("terms") === "on",
        acceptWaiver: f.get("waiver") === "on",
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Die Buchung hat nicht geklappt. Bitte versuche es erneut.");
      setLoading(false);
      return;
    }
    window.location.href = data.url;
  }

  return (
    <form onSubmit={submit} className="card mt-6 space-y-4">
      <div><label className="label" htmlFor="phone">{copy.phone}</label><input id="phone" name="phone" className="input" defaultValue={defaults.phone} required maxLength={40} autoComplete="tel" /></div>
      <div><label className="label" htmlFor="jobs">{copy.jobs}</label><input id="jobs" name="jobs" className="input" defaultValue={defaults.jobs} required maxLength={200} /></div>
      <div><label className="label" htmlFor="regions">{copy.regions}</label><input id="regions" name="regions" className="input" defaultValue={defaults.regions} maxLength={200} /></div>
      <div><label className="label" htmlFor="notes">{copy.notes}</label><textarea id="notes" name="notes" className="input min-h-24" maxLength={1000} /></div>
      <label className="flex gap-3 text-sm"><input type="checkbox" name="terms" required className="mt-1" /><span>{copy.terms} <a href="/agb" target="_blank" className="underline">AGB</a> · <a href="/datenschutz" target="_blank" className="underline">Datenschutz</a></span></label>
      <label className="flex gap-3 text-sm"><input type="checkbox" name="waiver" required className="mt-1" /><span>{copy.waiver}</span></label>
      {error && <p className="text-sm bg-rose-50 border border-rose-200 text-rose-700 rounded p-2">{error}</p>}
      <button className="btn-primary w-full justify-center" disabled={loading}>{loading ? "…" : copy.submit}</button>
    </form>
  );
}
