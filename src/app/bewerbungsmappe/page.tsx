import { redirect } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MappeEditor } from "@/components/MappeEditor";
import { getSession } from "@/lib/session";
import { mappeForSession } from "@/lib/mappe";
import { missingFields } from "@/lib/application";
import { aliasAddress } from "@/lib/alias";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n";
import { mappeText, fmt } from "@/lib/mappe-i18n";

export const dynamic = "force-dynamic";

export default async function MappePage() {
  const session = await getSession();
  if (!session.userId) redirect(`/anmelden?next=${encodeURIComponent("/bewerbungsmappe")}`);
  const m = await mappeForSession();
  if (!m) redirect("/bewerbungsservice");
  const leads = await prisma.jobLead.findMany({ where: { bookingId: m.booking.id, status: { in: ["SENT", "APPLIED_MANUALLY"] } }, orderBy: { sentAt: "desc" } });
  const alias = aliasAddress(m.booking.aliasLocal);
  const { locale } = await getT();
  const tx = mappeText(locale);

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-4xl px-6 py-12 space-y-6">
          <div>
            <Link href="/profil" className="text-sm text-[color:var(--color-brand)]">← {tx.back}</Link>
            <h1 className="mt-2 text-3xl font-bold">{tx.title}</h1>
            <p className="mt-2 text-[color:var(--color-ink-soft)]">{tx.intro}</p>
            {tx.langHint && <p className="mt-3 card bg-[color:var(--color-brand-soft)] text-sm">{tx.langHint}</p>}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">{tx.stMappe}</div><div className="font-semibold">{tx.status[m.profile.status] ?? m.profile.status}</div></div>
            <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">{tx.stSent}</div><div className="font-semibold">{m.booking.applicationsSent} {tx.of} {m.booking.applicationsGoal}</div></div>
            <div className="card"><div className="text-xs text-[color:var(--color-ink-soft)]">{tx.stAddress}</div><div className="font-semibold break-all" dir="ltr">{alias ?? tx.addressPending}</div></div>
          </div>
          {alias && <p className="text-sm text-[color:var(--color-ink-soft)]">{fmt(tx.aliasInfo, { alias })}</p>}

          <MappeEditor locale={locale} initial={m.data} status={m.profile.status} hasPhoto={!!m.profile.photoFile} ownCv={{ has: !!m.profile.ownCvFile, use: m.profile.useOwnCv }} missing={missingFields(m.data)} />

          {leads.length > 0 && (
            <section className="card">
              <h2 className="font-semibold">{tx.myApps}</h2>
              <ul className="mt-3 divide-y text-sm">
                {leads.map((l) => (
                  <li key={l.id} className="py-2 flex flex-wrap justify-between gap-2">
                    <span><strong>{l.title}</strong> · {l.company}{l.city ? `, ${l.city}` : ""}</span>
                    <span className="text-[color:var(--color-ink-soft)]">{l.sentAt?.toLocaleDateString("de-DE")}{l.response ? ` · ${tx.answered}` : ""}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
