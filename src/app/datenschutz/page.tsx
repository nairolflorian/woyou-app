import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Datenschutz" };

export default function Datenschutz() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="flex-1 bg-[color:var(--color-surface)]">
        <div className="mx-auto max-w-3xl px-6 py-12">
          <span className="section-tag">Rechtliches</span>
          <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

          <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-900">
            Entwurf. Wird vor dem Start anwaltlich geprüft.
          </div>

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold text-base">1. Verantwortlicher</h2>
              <p>
                {COMPANY.name}, {COMPANY.street}, {COMPANY.zipCity}, vertreten durch den Geschäftsführer {COMPANY.ceo}.
                E-Mail: {COMPANY.email}, Telefon: <span dir="ltr">{COMPANY.phone}</span>.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">2. Welche Daten wir verarbeiten</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Konto:</strong> E-Mail-Adresse oder Telefonnummer, Passwort (nur verschlüsselt gespeichert), Sprache.</li>
                <li><strong>Buchung:</strong> gebuchtes Paket, Wunschberufe, Regionen, Hinweise, Zeitpunkt deiner Zustimmungen.</li>
                <li><strong>Bewerbungsmappe:</strong> Name, Adresse, Kontaktdaten, Geburtsdatum und Staatsangehörigkeit (freiwillig), Berufserfahrung, Ausbildung, Sprachen, Kenntnisse, Motivation, auf Wunsch ein Foto und ein eigener Lebenslauf.</li>
                <li><strong>Bewerbungen:</strong> die ausgewählten Stellen, die erstellten Anschreiben, Versandzeitpunkt und Antworten der Arbeitgeber.</li>
                <li><strong>Zahlung:</strong> wird direkt bei Stripe abgewickelt. Wir speichern keine Kartendaten.</li>
                <li><strong>Technik:</strong> Login-Cookie und Sprach-Cookie. Kein Tracking, keine Werbe-Cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base">3. Zweck und Rechtsgrundlage</h2>
              <p>
                Wir verarbeiten deine Daten, um den gebuchten Bewerbungs-Service zu erbringen: Lebenslauf und
                Anschreiben erstellen, passende Stellen suchen und die Bewerbungen in deinem Namen verschicken
                (Art. 6 Abs. 1 lit. b DSGVO). Freiwillige Angaben wie Foto, Geburtsdatum oder Staatsangehörigkeit
                verarbeiten wir mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Zum Schutz vor Missbrauch
                protokollieren wir Anmeldungen (Art. 6 Abs. 1 lit. f DSGVO). Rechnungsdaten bewahren wir auf,
                soweit das Steuerrecht es verlangt (Art. 6 Abs. 1 lit. c DSGVO).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">4. Empfänger</h2>
              <ul className="list-disc ml-5 space-y-1">
                <li><strong>Arbeitgeber:</strong> Deine Bewerbungsunterlagen gehen nur an die Stellen, die wir für dich auswählen und die du mit deiner Vollmacht freigibst.</li>
                <li><strong>Stripe</strong> (Zahlungsabwicklung).</li>
                <li><strong>Hetzner Online GmbH</strong> (Server in Deutschland).</li>
                <li><strong>Unser E-Mail-Anbieter</strong> für den Versand der Bewerbungen und Benachrichtigungen.</li>
                <li><strong>KI-Textdienst</strong> (nur wenn aktiviert): Für Formulierungsvorschläge zum Anschreiben übermitteln wir Angaben aus deiner Mappe und die Stellenbeschreibung an einen Anbieter mit Sitz in der EU. Jedes Anschreiben wird vor dem Versand von unserem Team geprüft.</li>
              </ul>
              <p className="mt-2">Für die Stellensuche nutzen wir die Jobbörse der Bundesagentur für Arbeit. Dabei übermitteln wir keine Daten über dich.</p>
            </section>

            <section>
              <h2 className="font-semibold text-base">5. Speicherdauer</h2>
              <p>
                Solange dein Konto besteht. Nach der Löschung deines Kontos entfernen wir deine Daten innerhalb
                von 30 Tagen, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">6. Deine Rechte</h2>
              <p>
                Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit und Widerspruch. Einwilligungen kannst du jederzeit widerrufen. Deine Daten
                kannst du in deinem Bereich selbst herunterladen oder dein Konto löschen. Außerdem kannst du dich
                bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für
                Datenschutz und Informationsfreiheit Nordrhein-Westfalen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">7. Kontakt</h2>
              <p>Fragen zum Datenschutz: {COMPANY.email}</p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
