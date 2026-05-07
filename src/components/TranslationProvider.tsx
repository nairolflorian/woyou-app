"use client";

// Ships the current-locale dictionary to client components via React Context.
// Server components keep using getT() from src/lib/i18n.ts. Both layers are
// fed from the same dict files in src/i18n/*, so server and client output
// stay in sync.

import { createContext, useContext, type ReactNode } from "react";

export type Dict = Record<string, string>;
const Ctx = createContext<{ dict: Dict; locale: string; isRTL: boolean }>({
  dict: {},
  locale: "de",
  isRTL: false,
});

export function TranslationProvider({
  dict,
  locale,
  isRTL,
  children,
}: {
  dict: Dict;
  locale: string;
  isRTL: boolean;
  children: ReactNode;
}) {
  return (
    <Ctx.Provider value={{ dict, locale, isRTL }}>{children}</Ctx.Provider>
  );
}

export function useT() {
  const { dict, locale, isRTL } = useContext(Ctx);
  const t = (key: string, vars?: Record<string, string | number>) => {
    const raw = dict[key] ?? key;
    if (!vars) return raw;
    return raw.replace(/\{(\w+)\}/g, (_, name) =>
      vars[name] != null ? String(vars[name]) : `{${name}}`
    );
  };
  return { t, locale, isRTL };
}
