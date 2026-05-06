"use client";

import { useEffect, useState } from "react";

const KEY = "woyou_cookie_choice_v1";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* ignore */
    }
  }, []);

  function decide(value: "essential-only" | "all") {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  }

  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--color-border)] bg-white shadow-xl">
      <div className="mx-auto max-w-5xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-[color:var(--color-ink)] max-w-3xl">
          <strong>Cookies & Datenschutz.</strong> WoYou nutzt nur technisch
          notwendige Cookies (Login-Session, Sprachwahl). Wir tracken nicht
          und betten keine Drittanbieter-Skripte ein. Mehr in unserer{" "}
          <a href="/datenschutz" className="text-[color:var(--color-brand)] underline">
            Datenschutzerklärung
          </a>.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => decide("essential-only")}
            className="btn-primary text-sm"
          >
            Verstanden
          </button>
        </div>
      </div>
    </div>
  );
}
