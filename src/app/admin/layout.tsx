import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isStaff } from "@/lib/auth";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ROLE } from "@/lib/enums";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId || !isStaff(session.role)) redirect("/anmelden");
  const team = session.role === ROLE.TEAM;
  // Bewerbungsteam sieht nur Buchungen und Aufgaben
  const path = (await headers()).get("x-pathname") ?? "";
  if (team && !/^\/admin\/(buchungen|aufgaben)(\/|$)/.test(path)) redirect("/admin/buchungen");

  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <aside className="card h-fit">
              <div className="text-xs font-bold text-[color:var(--color-ink-soft)] uppercase tracking-widest">
                Admin
              </div>
              <div className="mt-1 text-sm font-semibold">
                {session.role === ROLE.SUPER_ADMIN ? "Super-Admin" : team ? "Bewerbungsteam" : "Vermittler"}
              </div>
              <nav className="mt-4 flex flex-col gap-1 text-sm">
                {!team && <Link href="/admin" className="btn-ghost justify-start">📊 Übersicht</Link>}
                <Link href="/admin/buchungen" className="btn-ghost justify-start">🧾 Buchungen</Link>
                {!team && <Link href="/admin/analytics" className="btn-ghost justify-start">📈 Analytics</Link>}
                {!team && <Link href="/admin/kandidaten" className="btn-ghost justify-start">👥 Kund:innen</Link>}
                <Link href="/admin/aufgaben" className="btn-ghost justify-start">✅ Aufgaben</Link>
                {!team && <Link href="/admin/stellenquellen" className="btn-ghost justify-start">🔎 Stellenquellen</Link>}
                {!team && <Link href="/admin/marketing" className="btn-ghost justify-start">📣 Marketing</Link>}
                {!team && <Link href="/admin/audit" className="btn-ghost justify-start">📜 Audit-Log</Link>}
                {session.role === ROLE.SUPER_ADMIN && (
                  <>
                    <Link href="/admin/papierkorb" className="btn-ghost justify-start">🗑 Papierkorb</Link>
                    <Link href="/admin/errors" className="btn-ghost justify-start">🐛 Fehler-Log</Link>
                    <Link href="/admin/team" className="btn-ghost justify-start">🛡 Team</Link>
                  </>
                )}
              </nav>
            </aside>
            <section className="min-w-0">{children}</section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
