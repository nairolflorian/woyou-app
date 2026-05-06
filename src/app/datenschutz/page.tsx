import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata = { title: "Datenschutz — WoYou" };

export default function Datenschutz() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            ⚠ <strong>Demo-Platzhalter.</strong> Vor Produktivstart von
            einer Anwältin / einem Anwalt prüfen lassen.
          </div>

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold text-base">1. Verantwortlicher</h2>
              <p>
                Verantwortlich für die Datenverarbeitung auf dieser Website ist
                der im Impressum genannte Anbieter.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">
                2. Welche Daten wir verarbeiten
              </h2>
              <ul className="list-disc ml-5 space-y-1">
                <li>
                  <strong>Registrierungs- und Profildaten:</strong> Name,
                  Geburtsdatum, Kontaktwege (E-Mail, Telefon, Telegram,
                  WhatsApp), Wunschberuf, Sprachkenntnisse, Erfahrungen,
                  Motivation, Familienstand — soweit von dir freiwillig
                  angegeben.
                </li>
                <li>
                  <strong>Dokumente:</strong> Hochgeladene Dateien (Lebenslauf,
                  Reisepass, Diplome, Zertifikate). Werden verschlüsselt im
                  Dateisystem gespeichert und nur freigegebenen Unternehmen mit
                  aktivem Vorschlag sowie unserer Vermittlung zugänglich.
                </li>
                <li>
                  <strong>Sprachtest-Ergebnis:</strong> Punktzahl und Niveau
                  zur Anzeige im Profil.
                </li>
                <li>
                  <strong>Bezahldaten:</strong> Werden direkt bei Stripe
                  verarbeitet — wir speichern keine Kartendaten.
                </li>
                <li>
                  <strong>Technische Daten:</strong> Login-Session-Cookie
                  (verschlüsselt), Sprachwahl-Cookie. Kein Tracking, kein
                  Analytics.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base">
                3. Zweck und Rechtsgrundlage
              </h2>
              <p>
                Verarbeitungszweck ist die Vermittlung internationaler
                Fachkräfte an deutsche Unternehmen. Rechtsgrundlagen: Art. 6
                Abs. 1 lit. b DSGVO (Vertragserfüllung), Art. 6 Abs. 1 lit. a
                DSGVO (Einwilligung — z.B. Profil-Weitergabe an Unternehmen)
                und Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse —
                Betrugsprävention).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">
                4. Weitergabe an Dritte
              </h2>
              <p>
                Dein Profil wird Unternehmen nur dann gezeigt, wenn (a) du dem
                allgemein im Onboarding zugestimmt hast oder (b) du dem
                konkreten Unternehmen einzeln zugestimmt hast. Dienstleister:
                Stripe (Bezahlung), unser Hoster, ggf. Telegram (wenn du den
                Bot nutzt).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">5. Speicherdauer</h2>
              <p>
                Solange dein Account aktiv ist. Nach Account-Löschung werden
                personenbezogene Daten innerhalb von 30 Tagen entfernt; eine
                längere Aufbewahrung erfolgt nur, soweit gesetzlich
                vorgeschrieben (z.B. Steuerrecht).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">6. Deine Rechte</h2>
              <p>
                Du hast das Recht auf Auskunft, Berichtigung, Löschung,
                Einschränkung der Verarbeitung, Datenübertragbarkeit und
                Widerspruch. Beschwerderecht bei der zuständigen
                Aufsichtsbehörde. Erteilte Einwilligungen kannst du jederzeit
                widerrufen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">7. Cookies</h2>
              <p>
                Wir verwenden ausschließlich technisch notwendige Cookies
                (Login-Session, Sprachwahl). Keine Tracking- oder Marketing-Cookies.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">8. Kontakt</h2>
              <p>
                Anfragen zum Datenschutz: <em>[datenschutz@woyou.de]</em> —
                Kontaktdaten siehe Impressum.
              </p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
