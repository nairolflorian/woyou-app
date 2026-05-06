import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Seite nicht gefunden" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="text-7xl" aria-hidden="true">🧭</div>
          <h1 className="mt-4 text-3xl font-bold">404 — Seite nicht gefunden</h1>
          <p className="mt-3 text-[color:var(--color-ink-soft)]">
            Die Seite existiert nicht (mehr) oder du hast dich vertippt.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">
              Zur Startseite
            </Link>
            <Link href="/demo" className="btn-outline">
              Test-Seite
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
