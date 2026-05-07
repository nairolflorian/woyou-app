"use client";

import { useState } from "react";
import type { DemoAccount } from "@/lib/demo-accounts";

export function DemoModeBarClient({
  accounts,
  currentEmail,
}: {
  accounts: DemoAccount[];
  currentEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const current = accounts.find((a) => a.email === currentEmail) ?? null;

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-3 rounded-full bg-[#1a1a1a]/95 text-white pl-3 pr-5 py-2 shadow-2xl backdrop-blur border border-white/10 hover:bg-[#1a1a1a] transition"
        >
          <span className="rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 tracking-widest">
            DEMO
          </span>
          <span className="text-sm">
            {current ? (
              <>
                <span className="opacity-60">Eingeloggt als </span>
                <strong>{current.emoji} {current.name}</strong>
              </>
            ) : (
              <span>Rolle wählen …</span>
            )}
          </span>
          <span className="text-xs opacity-60">{open ? "▾" : "▸"}</span>
        </button>

        {open && (
          <div
            className="absolute bottom-full right-0 mb-3 w-[min(320px,calc(100vw-2rem))] max-h-[60vh] overflow-y-auto rounded-2xl bg-white border border-[color:var(--color-border)] shadow-2xl"
            role="menu"
          >
            <div className="p-3 border-b border-[color:var(--color-border)]">
              <div className="text-xs font-bold uppercase tracking-widest text-[color:var(--color-ink-soft)]">
                Rolle wechseln
              </div>
              <div className="text-xs text-[color:var(--color-ink-soft)] mt-1">
                Klick logt dich automatisch ein.
              </div>
            </div>
            <div className="p-2 space-y-1">
              {accounts.map((acc) => {
                const isCurrent = acc.email === currentEmail;
                return (
                  <a
                    key={acc.email}
                    href={`/api/auth/demo-login?email=${encodeURIComponent(acc.email)}`}
                    className={`flex items-center gap-3 rounded-xl p-2.5 text-sm transition ${
                      isCurrent
                        ? "bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand)] font-semibold"
                        : "hover:bg-[color:var(--color-surface)]"
                    }`}
                  >
                    <span className="text-xl">{acc.emoji}</span>
                    <span className="flex-1">
                      <div className="font-semibold">{acc.name}</div>
                      <div className="text-[11px] text-[color:var(--color-ink-soft)] line-clamp-1">
                        {acc.role.replace("_", "-")}
                      </div>
                    </span>
                    {isCurrent && <span className="text-xs">✓</span>}
                  </a>
                );
              })}
            </div>
            <div className="p-3 border-t border-[color:var(--color-border)] flex justify-between gap-2">
              <a href="/demo" className="btn-ghost text-xs">
                🎬 Test-Übersicht
              </a>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="btn-ghost text-xs">
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
