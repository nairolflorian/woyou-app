import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ROLE } from "@/lib/enums";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session.userId || !isAdmin(session.role)) redirect("/anmelden");

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
                {session.role === ROLE.SUPER_ADMIN ? "Super-Admin" : "Vermittler"}
              </div>
              <nav className="mt-4 flex flex-col gap-1 text-sm">
                <Link href="/admin" className="btn-ghost justify-start">📊 Übersicht</Link>
                <Link href="/admin/analytics" className="btn-ghost justify-start">📈 Analytics</Link>
                <Link href="/admin/kandidaten" className="btn-ghost justify-start">👥 Kandidaten</Link>
                <Link href="/admin/firmen" className="btn-ghost justify-start">🏢 Unternehmen</Link>
                <Link href="/admin/anfragen" className="btn-ghost justify-start">📝 Anfragen</Link>
                <Link href="/admin/matching" className="btn-ghost justify-start">🎯 Matching</Link>
                <Link href="/admin/aufgaben" className="btn-ghost justify-start">✅ Aufgaben</Link>
                <Link href="/admin/audit" className="btn-ghost justify-start">📜 Audit-Log</Link>
                {session.role === ROLE.SUPER_ADMIN && (
                  <Link href="/admin/team" className="btn-ghost justify-start">🛡 Team</Link>
                )}
              </nav>
            </aside>
            <section>{children}</section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
