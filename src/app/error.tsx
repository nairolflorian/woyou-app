"use client";

// Catches errors inside any route segment under /. Rendered INSIDE the
// root layout, so we don't render <html>/<body> here.

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[error.tsx]", error.digest ?? "no-digest", error.message);
  }, [error]);

  return (
    <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="text-7xl" aria-hidden="true">⚠️</div>
        <h1 className="mt-4 text-3xl font-bold">Etwas ist schiefgegangen.</h1>
        <p className="mt-3 text-[color:var(--color-ink-soft)] max-w-md mx-auto">
          Wir haben den Fehler protokolliert und schauen es uns an. Versuche es
          gleich noch einmal oder geh zurück zur Startseite.
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-[color:var(--color-ink-soft)]">
            Fehler-ID: <code className="font-mono">{error.digest}</code>
          </p>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => reset()} className="btn-primary">
            Nochmal versuchen
          </button>
          <Link href="/" className="btn-outline">
            Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  );
}
