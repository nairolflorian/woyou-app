import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoginForm } from "@/components/LoginForm";
import { getT } from "@/lib/i18n";
import Link from "next/link";

export default async function LoginPage() {
  const { t } = await getT();
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-md px-6 py-16">
          <div className="card">
            <h1 className="text-2xl font-bold">{t("auth.login_title")}</h1>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">
              {t("auth.choose_method")}
            </p>
            <LoginForm />
            <p className="mt-6 text-sm text-[color:var(--color-ink-soft)]">
              {t("auth.no_account")}{" "}
              <Link
                href="/registrierung"
                className="text-[color:var(--color-brand)] font-semibold"
              >
                {t("nav.register")}
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
