import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";

export const metadata = { title: "Datenschutz" };

// ANWALT PRÜFEN (Weg 1, 22.10.2026): Abschnitte 2 (Bewerbungswerkzeug), 3 (Zweck) und 4 (Empfänger,
// Stellensuche, E-Mail-Programm) wurden für das neue Angebot angepasst: kein Versand durch WoYou, keine
// Weitergabe an Arbeitgeber, eigener Tracker der Kund:innen.
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
                {/* ANWALT PRÜFEN (Weg 1): neue Datenkategorie Bewerbungswerkzeug statt „Bewerbungen“ */}
                <li><strong>Bewerbungswerkzeug:</strong> deine Suchbegriffe (nur für die Suche, wir speichern sie nicht), die Stellen, die du dir merkst oder selbst einträgst, dein Stand und deine Notizen dazu und die Anschreiben, die du erstellst. Diese Liste pflegst nur du; unser Team sieht sie in WoYou nicht.</li>
                <li><strong>Zahlung:</strong> wird direkt bei Stripe abgewickelt. Wir speichern keine Kartendaten.</li>
                <li><strong>Technik:</strong> Login-Cookie und Sprach-Cookie. Kein Tracking, keine Werbe-Cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-semibold text-base">3. Zweck und Rechtsgrundlage</h2>
              <p>
                {/* ANWALT PRÜFEN (Weg 1): Zweck ohne Stellenauswahl und Versand durch WoYou */}
                Wir verarbeiten deine Daten, um das gebuchte Angebot zu erbringen: deine Bewerbungsunterlagen
                erstellen und prüfen und dir das Bewerbungswerkzeug bereitstellen, mit dem du selbst Stellen suchst,
                Anschreiben erstellst und deine Bewerbungen im Blick behältst (Art. 6 Abs. 1 lit. b DSGVO). Freiwillige Angaben wie Foto, Geburtsdatum oder Staatsangehörigkeit
                verarbeiten wir mit deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO). Zum Schutz vor Missbrauch
                protokollieren wir Anmeldungen (Art. 6 Abs. 1 lit. f DSGVO). Rechnungsdaten bewahren wir auf,
                soweit das Steuerrecht es verlangt (Art. 6 Abs. 1 lit. c DSGVO).
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">4. Empfänger</h2>
              <ul className="list-disc ml-5 space-y-1">
                {/* ANWALT PRÜFEN (Weg 1): keine Weitergabe an Arbeitgeber durch WoYou */}
                <li><strong>Arbeitgeber:</strong> Wir geben deine Daten nicht an Arbeitgeber weiter. Deine Bewerbungen verschickst du selbst, aus deinem eigenen E-Mail-Postfach oder über die Seite des Arbeitgebers.</li>
                <li><strong>Stripe</strong> (Zahlungsabwicklung).</li>
                <li><strong>Hetzner Online GmbH</strong> (Server in Deutschland).</li>
                <li><strong>Unser E-Mail-Anbieter</strong> für Benachrichtigungen an dich (z. B. Buchungsbestätigung).</li>
                <li><strong>KI-Textdienst</strong> (nur wenn aktiviert): Für Formulierungsvorschläge zum Anschreiben übermitteln wir Angaben aus deiner Mappe und die Stellenbeschreibung an Mistral AI SAS (Paris, Frankreich), mit dem ein Vertrag zur Auftragsverarbeitung besteht. Die Daten werden nicht zum Training verwendet. Du prüfst jedes Anschreiben selbst, bevor du es verwendest.</li>
              </ul>
              {/* ANWALT PRÜFEN (Weg 1): Quellen der Stellensuche und mailto-Funktion */}
              <p className="mt-2">Für die Stellensuche fragen wir die Jobbörse der Bundesagentur für Arbeit und weitere öffentliche Stellenbörsen ab (Arbeitnow, Karriereseiten von Arbeitgebern über Personio, Greenhouse oder Lever und, falls eingerichtet, Adzuna). Dabei übermitteln wir nur Suchbegriff und Ort, keine Daten über dich.</p>
              <p className="mt-2">Wenn du „In meinem E-Mail-Programm öffnen“ nutzt, öffnet sich dein eigenes E-Mail-Programm. Die Nachricht verschickst du selbst; WoYou ist daran nicht beteiligt und bekommt keine Kopie und keine Antworten.</p>
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
