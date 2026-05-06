import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Impressum — WoYou" };

export default function Impressum() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Impressum</h1>
          <Notice />

          <div className="mt-8 card space-y-4 text-sm leading-relaxed">
            <h2 className="font-semibold text-base">Angaben gemäß § 5 TMG</h2>
            <p>
              <strong>[Firmenname WoYou GmbH]</strong>
              <br />
              [Straße + Hausnummer]
              <br />
              [PLZ + Ort]
              <br />
              Deutschland
            </p>

            <h2 className="font-semibold text-base">Kontakt</h2>
            <p>
              Telefon: [+49 …]
              <br />
              E-Mail: [kontakt@woyou.de]
            </p>

            <h2 className="font-semibold text-base">Vertretungsberechtigte:r</h2>
            <p>[Vorname Nachname], Geschäftsführer:in</p>

            <h2 className="font-semibold text-base">Eintragung im Handelsregister</h2>
            <p>
              Registergericht: [Amtsgericht …]
              <br />
              Registernummer: [HRB …]
            </p>

            <h2 className="font-semibold text-base">Umsatzsteuer-ID</h2>
            <p>USt-IdNr. nach § 27a UStG: [DE …]</p>

            <h2 className="font-semibold text-base">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>[Vorname Nachname, Adresse wie oben]</p>

            <h2 className="font-semibold text-base">EU-Streitschlichtung</h2>
            <p>
              Plattform der EU-Kommission zur Online-Streitbeilegung:{" "}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                className="text-[color:var(--color-brand)] underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ec.europa.eu/consumers/odr
              </a>
              . Wir sind nicht verpflichtet und nicht bereit, an einem
              Streitbeilegungsverfahren teilzunehmen.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

function Notice() {
  return (
    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
      ⚠ <strong>Demo-Platzhalter.</strong> Vor Produktivstart durch tatsächliche
      Firmenangaben ersetzen — siehe <code>src/app/impressum/page.tsx</code>.
    </div>
  );
}
