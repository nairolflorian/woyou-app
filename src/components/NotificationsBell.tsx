"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/components/TranslationProvider";

type Notif = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationsBell() {
  const { t, locale } = useT();
  const [items, setItems] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const r = await fetch("/api/notifications", { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json();
      if (d.ok) {
        setItems(d.items);
        setUnread(d.unread);
      }
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function markAll() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    load();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t("bell.aria")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[color:var(--color-brand-soft)]"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .53-.21 1.04-.59 1.41L4 17h5m6 0a3 3 0 1 1-6 0"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[340px] max-h-[70vh] overflow-y-auto rounded-2xl bg-white border border-[color:var(--color-border)] shadow-2xl z-50"
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--color-border)]">
            <span className="font-semibold text-sm">{t("bell.title")}</span>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs text-[color:var(--color-brand)] font-semibold hover:underline"
              >
                {t("bell.mark_all")}
              </button>
            )}
          </div>
          {items.length === 0 ? (
            <div className="p-6 text-center text-sm text-[color:var(--color-ink-soft)]">
              {t("bell.empty")}
            </div>
          ) : (
            <ul>
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-[color:var(--color-border)] last:border-b-0 ${n.read ? "" : "bg-[color:var(--color-brand-soft)]"}`}
                >
                  <a
                    href={n.link ?? "#"}
                    className="block px-4 py-3 hover:bg-[color:var(--color-surface)]"
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 inline-block w-2 h-2 rounded-full bg-[color:var(--color-brand)] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold">{n.title}</div>
                        {n.body && (
                          <div className="text-xs text-[color:var(--color-ink-soft)] line-clamp-2 mt-0.5">
                            {n.body}
                          </div>
                        )}
                        <div className="text-[10px] text-[color:var(--color-ink-soft)] mt-1">
                          {new Date(n.createdAt).toLocaleString(locale)}
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
