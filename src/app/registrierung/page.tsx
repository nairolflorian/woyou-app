import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RegisterForm } from "@/components/RegisterForm";
import { getT } from "@/lib/i18n";
import Link from "next/link";

export default async function RegisterPage() {
  const { t } = await getT();
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-md px-6 py-16">
          <div className="card">
            <h1 className="text-2xl font-bold">{t("auth.register_title")}</h1>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">
              {t("auth.choose_method")}
            </p>
            <RegisterForm />
            <div className="mt-6 flex flex-col gap-2 text-sm text-[color:var(--color-ink-soft)]">
              <span>
                {t("auth.have_account")}{" "}
                <Link
                  href="/anmelden"
                  className="text-[color:var(--color-brand)] font-semibold"
                >
                  {t("nav.login")}
                </Link>
              </span>
              <span>
                Lieber per Telegram?{" "}
                <Link
                  href="/registrierung/telegram"
                  className="text-[#229ED9] font-semibold"
                >
                  Telegram-Bot starten
                </Link>
              </span>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
