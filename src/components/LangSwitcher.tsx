"use client";

import { useState, useTransition } from "react";
import { LOCALE_META, type Locale, LOCALES } from "@/lib/i18n-meta";

export function LangSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  function pick(l: Locale) {
    document.cookie = `woyou_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
    setOpen(false);
    startTransition(() => {
      window.location.reload();
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span>{LOCALE_META[current].flag}</span>
        <span className="hidden sm:inline">{LOCALE_META[current].label}</span>
        <span className="text-xs">▼</span>
      </button>
      {open && (
        <div
          className="absolute right-0 mt-2 min-w-[160px] rounded-xl border border-[color:var(--color-border)] bg-white shadow-lg z-50 py-1"
          role="menu"
        >
          {LOCALES.map((l) => (
            <button
              key={l}
              onClick={() => pick(l)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-[color:var(--color-brand-soft)] hover:text-[color:var(--color-brand)] ${
                l === current
                  ? "text-[color:var(--color-brand)] font-semibold"
                  : "text-[color:var(--color-ink-soft)]"
              }`}
            >
              <span className="text-base">{LOCALE_META[l].flag}</span>
              <span>{LOCALE_META[l].label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
