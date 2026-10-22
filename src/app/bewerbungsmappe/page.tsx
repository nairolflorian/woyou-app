import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MappeEditor } from "@/components/MappeEditor";
import { MyDocuments } from "@/components/MyDocuments";
import { getSession } from "@/lib/session";
import { mappeForSession } from "@/lib/mappe";
import { missingFields } from "@/lib/application";
import { getT } from "@/lib/i18n";
import { mappeText } from "@/lib/mappe-i18n";
import { toolAccess } from "@/lib/werkzeug";
import { accountText, fill } from "@/lib/account-text";
import { dateLocaleOf, wLang } from "@/lib/werkzeug-text";

export const dynamic = "force-dynamic";

// Bewerbungsmappe (Weg 1): Angaben für Lebenslauf und Anschreiben. Keine Bewerbungsadresse, kein Versand durch WoYou.
export default async function MappePage() {
  const session = await getSession();
  if (!session.userId) redirect(`/anmelden?next=${encodeURIComponent("/bewerbungsmappe")}`);
  const m = await mappeForSession();
  if (!m) redirect("/");
  const { locale } = await getT();
  const tx = mappeText(locale);
  const a = accountText(locale);
  const access = await toolAccess(m.booking.candidateId);
  const dl = dateLocaleOf(wLang(locale));

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
          <div>
            <Link href="/profil" className="text-sm text-[color:var(--color-brand)]">{locale === "ar" ? "→" : "←"} {tx.back}</Link>
            <h1 className="mt-2 text-3xl font-bold">{tx.title}</h1>
            <p className="mt-2 text-[color:var(--color-ink-soft)]">{tx.intro}</p>
            {tx.langHint && <p className="mt-3 card bg-[color:var(--color-brand-soft)] text-sm">{tx.langHint}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">{tx.stMappe}</div><div className="font-semibold">{tx.status[m.profile.status] ?? m.profile.status}</div></div>
            <div className="card flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-[color:var(--color-ink-soft)]">{a.toolTitle}</div>
                <div className="font-semibold">{access.active ? fill(a.toolActive, { date: access.until!.toLocaleDateString(dl) }) : access.until ? fill(a.toolExpired, { date: access.until.toLocaleDateString(dl) }) : a.toolInactive}</div>
              </div>
              {access.active && <Link href="/stellensuche" className="btn-outline">{a.openSearch}</Link>}
            </div>
          </div>

          <MyDocuments locale={locale} hasEnglish={!!m.profile.dataEn} />

          <MappeEditor locale={locale} initial={m.data} status={m.profile.status} hasPhoto={!!m.profile.photoFile} ownCv={{ has: !!m.profile.ownCvFile, use: m.profile.useOwnCv }} missing={missingFields(m.data)} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
