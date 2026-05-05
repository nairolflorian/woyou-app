import Link from "next/link";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { LangSwitcher } from "@/components/LangSwitcher";
import { ROLE } from "@/lib/enums";
import { isAdmin } from "@/lib/auth";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const session = await getSession();

  let dashboardHref = "/anmelden";
  if (session.userId) {
    if (isAdmin(session.role)) dashboardHref = "/admin";
    else if (session.role === ROLE.COMPANY) dashboardHref = "/firmen/dashboard";
    else dashboardHref = "/profil";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[color:var(--color-brand)]">
            Wo<span className="text-[color:var(--color-ink)]">You</span>
          </span>
          <span className="hidden md:inline rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5">
            DEMO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-[color:var(--color-ink-soft)]">
          <Link href="/bewerber" className="btn-ghost">
            {t("nav.bewerber")}
          </Link>
          <Link href="/arbeitgeber" className="btn-ghost">
            {t("nav.arbeitgeber")}
          </Link>
          <Link href="/#prozess" className="btn-ghost">
            {t("nav.so_funktioniert")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher current={locale} />
          {session.userId ? (
            <>
              <Link href={dashboardHref} className="btn-ghost">
                {t("nav.dashboard")}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost" type="submit">
                  {t("nav.logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/anmelden" className="btn-ghost">
                {t("nav.login")}
              </Link>
              <Link href="/registrierung" className="btn-primary">
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
