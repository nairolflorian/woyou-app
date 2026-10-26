"use client";

import { LOCALE_META, type Locale } from "@/lib/i18n-meta";

// Schnellwahl der Sprache auf Länderseiten (z. B. Indien: Englisch, Hindi, Telugu). Gleicher Cookie wie LangSwitcher.
export function SprachKnoepfe({ sprachen, current, label }: { sprachen: Locale[]; current: Locale; label: string }) {
  function pick(l: Locale) {
    document.cookie = `woyou_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    window.location.reload();
  }
  return (
    <p className="mt-4 flex flex-wrap items-center gap-2 text-sm">
      <span className="text-[color:var(--color-ink-soft)]">{label}</span>
      {sprachen.map((l) => (
        <button key={l} type="button" onClick={() => pick(l)} aria-pressed={l === current}
          className={`rounded-full border px-3 py-1 font-semibold ${l === current ? "border-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-deep)]" : "border-[color:var(--color-border)] bg-white text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-brand)]"}`}>
          {LOCALE_META[l].label}
        </button>
      ))}
    </p>
  );
}
