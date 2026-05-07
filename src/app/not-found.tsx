import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getT } from "@/lib/i18n";

export const metadata = { title: "404" };

export default async function NotFound() {
  const { t } = await getT();
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-xl px-6 py-20 text-center">
          <div className="text-7xl" aria-hidden="true">🧭</div>
          <h1 className="mt-4 text-3xl font-bold">{t("nf.title")}</h1>
          <p className="mt-3 text-[color:var(--color-ink-soft)]">{t("nf.body")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">
              {t("nf.home")}
            </Link>
            <Link href="/demo" className="btn-outline">
              {t("nf.demo")}
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
