import Link from "next/link";
import { getT } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { LangSwitcher } from "@/components/LangSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { NotificationsBell } from "@/components/NotificationsBell";
import { isAdmin, isStaff } from "@/lib/auth";
import { siteText } from "@/lib/company";

export async function SiteHeader() {
  const { t, locale } = await getT();
  const session = await getSession();

  let dashboardHref = "/anmelden";
  if (session.userId) {
    if (isAdmin(session.role)) dashboardHref = "/admin";
    else if (isStaff(session.role)) dashboardHref = "/admin/buchungen";
    else dashboardHref = "/profil";
  }

  const st = siteText(locale);
  const navItems = [
    { href: "/#angebot", label: st.navOffer },
    { href: "/#ablauf", label: st.navSteps },
    { href: "/#faq", label: st.navFaq },
    { href: "/#kontakt", label: st.navContact },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between gap-2 md:gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xl font-bold tracking-tight text-[color:var(--color-brand)]">
            Wo<span className="text-[color:var(--color-ink)]">You</span>
          </span>
          <span className="hidden md:inline rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5">
            DEMO
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-[color:var(--color-ink-soft)]">
          {navItems.map((it) => (
            <Link key={it.href} href={it.href} className="btn-ghost">
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <div className="hidden md:block">
            <LangSwitcher current={locale} />
          </div>
          {session.userId && <NotificationsBell />}
          {session.userId ? (
            <>
              <Link
                href={dashboardHref}
                className="btn-ghost hidden md:inline-flex"
              >
                {t("nav.dashboard")}
              </Link>
              <form action="/api/auth/logout" method="post" className="hidden md:block">
                <button className="btn-ghost" type="submit">
                  {t("nav.logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/anmelden" className="btn-ghost hidden md:inline-flex">
                {t("nav.login")}
              </Link>
              <Link href="/bewerbungsservice/buchen" className="btn-primary hidden md:inline-flex">
                {st.book}
              </Link>
            </>
          )}
          <MobileMenu
            items={navItems}
            isLoggedIn={Boolean(session.userId)}
            loginLabel={t("nav.login")}
            registerLabel={st.book}
            logoutLabel={t("nav.logout")}
            dashboardLabel={t("nav.dashboard")}
            dashboardHref={dashboardHref}
          />
        </div>
      </div>
    </header>
  );
}
