"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { LOCALE_META, LOCALES, type Locale } from "@/lib/i18n-meta";

type Item = { href: string; label: string };

// Sprache wählen wie im LangSwitcher: Cookie setzen und neu laden
function waehleSprache(l: Locale) {
  document.cookie = `woyou_locale=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
  window.location.reload();
}

export function MobileMenu({
  items,
  isLoggedIn,
  loginLabel,
  registerLabel,
  logoutLabel,
  dashboardLabel,
  dashboardHref,
  locale,
  languageLabel,
}: {
  items: Item[];
  isLoggedIn: boolean;
  loginLabel: string;
  registerLabel: string;
  logoutLabel: string;
  dashboardLabel: string;
  dashboardHref: string;
  locale: Locale;
  languageLabel: string;
}) {
  const [open, setOpen] = useState(false);
  // Das Menü hängt direkt an <body>: Im Kopfbereich (backdrop-blur) würde „fixed“ nur die Kopfzeile füllen
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Menü öffnen"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[color:var(--color-brand-soft)]"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && mounted && createPortal(
        <div
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 h-16 border-b border-[color:var(--color-border)]">
              <span className="text-lg font-bold text-[color:var(--color-brand)]">
                Wo<span className="text-[color:var(--color-ink)]">You</span>
              </span>
              <button
                type="button"
                aria-label="Menü schließen"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[color:var(--color-brand-soft)]"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" d="M6 6l12 12M6 18L18 6" />
                </svg>
              </button>
            </div>

            <div className="px-4 pt-4">
              <div className="px-3 text-xs font-semibold uppercase tracking-wide text-[color:var(--color-ink-soft)]">{languageLabel}</div>
              <div className="mt-2 grid grid-cols-2 gap-1">
                {LOCALES.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => waehleSprache(l)}
                    aria-current={l === locale ? "true" : undefined}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-start ${l === locale ? "bg-[color:var(--color-brand-soft)] font-semibold text-[color:var(--color-brand)]" : "text-[color:var(--color-ink)] hover:bg-[color:var(--color-brand-soft)]"}`}
                  >
                    <span className="text-base">{LOCALE_META[l].flag}</span>
                    <span>{LOCALE_META[l].label}</span>
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
              {items.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-[color:var(--color-ink)] hover:bg-[color:var(--color-brand-soft)] hover:text-[color:var(--color-brand)]"
                >
                  {it.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t border-[color:var(--color-border)] flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    href={dashboardHref}
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full"
                  >
                    {dashboardLabel}
                  </Link>
                  <form action="/api/auth/logout" method="post">
                    <button className="btn-outline w-full" type="submit">
                      {logoutLabel}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/bewerbungsservice/buchen"
                    onClick={() => setOpen(false)}
                    className="btn-primary w-full"
                  >
                    {registerLabel}
                  </Link>
                  <Link
                    href="/anmelden"
                    onClick={() => setOpen(false)}
                    className="btn-outline w-full"
                  >
                    {loginLabel}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
