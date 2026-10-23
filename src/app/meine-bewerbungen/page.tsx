import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BewerbungsTracker } from "@/components/BewerbungsTracker";
import { ToolGate } from "@/components/ToolGate";
import { getT } from "@/lib/i18n";
import { toolSession } from "@/lib/werkzeug";
import { trackerItems } from "@/lib/tracker";
import { werkzeugText } from "@/lib/werkzeug-text";

export const metadata: Metadata = { title: "Meine Bewerbungen", robots: { index: false } };
export const dynamic = "force-dynamic";

// Weg 1: eigener Bewerbungs-Tracker. Nur die Person selbst sieht und pflegt ihn.
export default async function MeineBewerbungenPage() {
  const s = await toolSession();
  if (!s) redirect(`/anmelden?next=${encodeURIComponent("/meine-bewerbungen")}`);
  const { locale } = await getT();
  const t = werkzeugText(locale);
  const { items, ctx, ownCv } = await trackerItems(s.candidate.id);
  const neverActive = !s.access.active && !s.access.until && items.length === 0;

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-5xl px-6 py-12 space-y-6">
          <div>
            <Link href="/profil" className="text-sm text-[color:var(--color-brand)]">{locale === "ar" ? "→" : "←"} {t.back}</Link>
            <h1 className="mt-2 text-3xl font-bold">{t.trackerTitle}</h1>
            <p className="mt-2 max-w-3xl text-[color:var(--color-ink-soft)]">{t.trackerLead}</p>
          </div>
          {neverActive ? <ToolGate t={t} expired={false} /> : (
            <>
              {!s.access.active && <ToolGate t={t} expired />}
              <BewerbungsTracker t={t} locale={locale} initial={items} active={s.access.active} fromEmail={ctx.email} ownCv={ownCv} />
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
