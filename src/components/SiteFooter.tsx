import { getT } from "@/lib/i18n";

export async function SiteFooter() {
  const { t } = await getT();
  return (
    <footer className="mt-auto bg-[color:var(--color-footer)] text-white/80">
      <div className="mx-auto max-w-6xl px-6 py-10 grid gap-8 md:grid-cols-4">
        <div>
          <div className="text-xl font-bold tracking-tight text-white">
            Wo<span className="text-[color:var(--color-brand)]">You</span>
          </div>
          <p className="mt-3 text-sm text-white/60">{t("footer.copy")}</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            {t("nav.bewerber")}
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/registrierung" className="hover:text-white">{t("nav.register")}</a></li>
            <li><a href="/anmelden" className="hover:text-white">{t("nav.login")}</a></li>
            <li><a href="/sprachtest" className="hover:text-white">{t("test.title")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            {t("nav.arbeitgeber")}
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/arbeitgeber" className="hover:text-white">{t("nav.arbeitgeber")}</a></li>
            <li><a href="/arbeitgeber/registrierung" className="hover:text-white">{t("nav.register")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">
            {t("footer.contact")}
          </h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">{t("footer.legal")}</a></li>
            <li><a href="#" className="hover:text-white">{t("footer.privacy")}</a></li>
            <li><a href="#" className="hover:text-white">{t("footer.terms")}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
