import { getT } from "@/lib/i18n";
import { COMPANY, siteText } from "@/lib/company";

export async function SiteFooter() {
  const { t, locale } = await getT();
  const st = siteText(locale);
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
          <h4 className="text-sm font-semibold text-white mb-3">{st.footerService}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/#angebot" className="hover:text-white">{st.navOffer}</a></li>
            <li><a href="/#ablauf" className="hover:text-white">{st.navSteps}</a></li>
            <li><a href="/bewerbungsservice/buchen" className="hover:text-white">{st.book}</a></li>
            <li><a href="/anmelden" className="hover:text-white">{t("nav.login")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{st.contactTitle}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href={`mailto:${COMPANY.email}`} className="hover:text-white">{COMPANY.email}</a></li>
            <li dir="ltr">{COMPANY.phone}</li>
            <li>{COMPANY.street}, {COMPANY.zipCity}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">{st.footerLegal}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/impressum" className="hover:text-white">{t("footer.legal")}</a></li>
            <li><a href="/datenschutz" className="hover:text-white">{t("footer.privacy")}</a></li>
            <li><a href="/agb" className="hover:text-white">{t("footer.terms")}</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
