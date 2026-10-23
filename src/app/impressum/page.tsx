import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Impressum" };

export default function Impressum() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Impressum</h1>

          <div className="mt-8 card space-y-4 text-sm leading-relaxed">
            <h2 className="font-semibold text-base">Angaben gemäß § 5 DDG</h2>
            <p>
              <strong>{COMPANY.name}</strong>
              <br />
              {COMPANY.street}
              <br />
              {COMPANY.zipCity}
              <br />
              {COMPANY.country}
            </p>
            <p>WoYou ist ein Angebot der {COMPANY.name}, eines Unternehmens der EuBiA-Gruppe.</p>

            <h2 className="font-semibold text-base">Vertreten durch den Geschäftsführer</h2>
            <p>{COMPANY.ceo}</p>

            <h2 className="font-semibold text-base">Kontakt</h2>
            <p>
              Telefon: <span dir="ltr">{COMPANY.phone}</span>
              <br />
              E-Mail: {COMPANY.email}
            </p>

            <h2 className="font-semibold text-base">Registereintrag</h2>
            <p>
              Sitz der Gesellschaft: {COMPANY.seat}
              <br />
              Registergericht: {COMPANY.court}
              <br />
              Registernummer: {COMPANY.register}
            </p>

            <h2 className="font-semibold text-base">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
            <p>{COMPANY.ceo}, {COMPANY.street}, {COMPANY.zipCity}</p>

            <h2 className="font-semibold text-base">Verbraucherstreitbeilegung</h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen.
            </p>

            <h2 className="font-semibold text-base">Haftung für Inhalte</h2>
            <p>
              Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
              Gesetzen verantwortlich. Wir sind jedoch nicht verpflichtet, übermittelte oder gespeicherte
              fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
              Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
              nach den allgemeinen Gesetzen bleiben unberührt.
            </p>

            <h2 className="font-semibold text-base">Haftung für Links</h2>
            <p>
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss
              haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber
              verantwortlich. Werden uns Rechtsverletzungen bekannt, entfernen wir solche Links umgehend.
            </p>

            <h2 className="font-semibold text-base">Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem
              deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung
              außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen Zustimmung.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
