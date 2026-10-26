import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY } from "@/lib/company";
import { terminlandUrl } from "@/lib/termin";
import { selbstcheckVorBuchungAn } from "@/lib/selbstcheck-vorbuchung-server";

export const metadata = { title: "Datenschutz" };
// zur Laufzeit rendern, damit der Terminland-Absatz dem gesetzten TERMINLAND_URL folgt (ebenso SELBSTCHECK_VOR_BUCHUNG)
export const dynamic = "force-dynamic";

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

          {/* ANWALT PRÜFEN: Texte vor dem Start anwaltlich prüfen lassen (Hinweis nur im Code, nicht sichtbar) */}

          <div className="mt-8 card space-y-5 text-sm leading-relaxed">
            <section>
              <h2 className="font-semibold text-base">1. Verantwortlicher</h2>
              <p>
                {COMPANY.name}, {COMPANY.street}, {COMPANY.zipCity}, vertreten durch den Geschäftsführer {COMPANY.ceo}.
                E-Mail: {COMPANY.email}, Telefon: <span dir="ltr">{COMPANY.phone}</span>.
              </p>
              <p className="mt-2">
                <strong>Datenschutzbeauftragte:</strong> {COMPANY.dpo.name}, {COMPANY.dpo.person}, {COMPANY.dpo.street},{" "}
                {COMPANY.dpo.zipCity}, E-Mail: {COMPANY.dpo.email}.
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
                {/* ANWALT PRÜFEN (26.10.2026): Selbstcheck-Statistik ohne Personenbezug (Tabelle SelfCheckResult: Ländercode bzw. „andere“, Berufsgruppe,
                    Deutschniveau, Ampel, Seitensprache, utm_source; Zeit auf die Stunde gerundet; keine IP, kein Freitext). Rechtsgrundlage in Abschnitt 3 ergänzen? */}
                <li><strong>Selbstcheck:</strong> Das Ergebnis deines Selbstchecks speichern wir ohne Bezug zu deiner Person (Land bzw. Ländergruppe, Berufsgruppe, Deutschniveau, Ergebnis, Sprache der Seite und gegebenenfalls die Quelle des Werbelinks, über den du gekommen bist) für unsere Statistik; deinen Beruf und dein Land als eingetippten Text speichern wir nicht.</li>
                {/* ANWALT PRÜFEN (Schalter SELBSTCHECK_VOR_BUCHUNG, nur sichtbar wenn an): Ergebnis im Konto bzw. Cookie woyou_selbstcheck (7 Tage), nötig für die Bestellung */}
                {selbstcheckVorBuchungAn() && <li><strong>Selbstcheck vor der Buchung:</strong> Damit du buchen kannst, merken wir uns dein letztes Selbstcheck-Ergebnis (Ampel und Datum, bei den Westbalkan-Staaten auch Land und Berufsgruppe) in deinem Konto. Machst du den Selbstcheck vor der Registrierung, steht das Ergebnis bis zu 7 Tage in einem Cookie und wird bei der Registrierung oder Anmeldung in dein Konto übernommen. Deine eingetippten Angaben speichern wir dabei nicht.</li>}
                <li><strong>Zahlung:</strong> wird direkt bei Stripe abgewickelt. Wir speichern keine Kartendaten.</li>
                <li><strong>Technik:</strong> Login-Cookie und Sprach-Cookie{selbstcheckVorBuchungAn() ? ", dazu das Selbstcheck-Cookie (siehe oben)" : ""}. Kein Tracking, keine Werbe-Cookies.</li>
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
                {/* ANWALT PRÜFEN (23.10.2026): Standort des WoYou-Servers wird noch geklärt, daher nur „in der EU“ */}
                <li><strong>Hetzner Online GmbH</strong>, Industriestr. 25, 91710 Gunzenhausen (Hosting, Server in der EU).</li>
                <li><strong>CRM der EuBiA-Gruppe</strong> für Kundenbetreuung und Abrechnung (siehe Abschnitt 5).</li>
                {/* ANWALT PRÜFEN (26.10.2026): Unterlagen-Check im Call über Terminland, erscheint erst mit gesetztem TERMINLAND_URL.
                    Auftragsverarbeitung über Terminland-AGB Teil B (Art. 28 DSGVO); Vertragspartner ist das Konto von EuBiA/KarriereKind. */}
                {terminlandUrl() && <li><strong>Terminland GmbH</strong>, Kreuzberger Ring 44a, 65205 Wiesbaden (Terminbuchung für den Unterlagen-Check im Gespräch, nur wenn du einen Termin buchst; du gibst dort selbst Name, Kontakt und Wunschtermin ein).</li>}
                <li><strong>Unser E-Mail-Anbieter</strong> für Benachrichtigungen an dich (z. B. Buchungsbestätigung).</li>
                {/* ANWALT PRÜFEN (23.10.2026): KI-Textdienst ist in Produktion nicht aktiv (kein Schlüssel gesetzt), es besteht
                    derzeit kein Vertrag mit einem KI-Anbieter. Vor einer Aktivierung Anbieter, AV-Vertrag und diesen Absatz ergänzen. */}
                <li><strong>KI-Textdienst:</strong> Derzeit nicht im Einsatz. Deine Anschreiben entstehen aus unseren Vorlagen, ohne dass Daten an einen KI-Dienst gehen. Falls wir künftig einen KI-Textdienst nutzen, informieren wir dich vorher hier und nennen den Anbieter, die übermittelten Angaben und die Rechtsgrundlage.</li>
              </ul>
              {/* ANWALT PRÜFEN (Weg 1): Quellen der Stellensuche und mailto-Funktion */}
              <p className="mt-2">Für die Stellensuche fragen wir die Jobbörse der Bundesagentur für Arbeit und weitere öffentliche Stellenbörsen ab (Arbeitnow, Karriereseiten von Arbeitgebern über Personio, Greenhouse oder Lever und, falls eingerichtet, Adzuna). Dabei übermitteln wir nur Suchbegriff und Ort, keine Daten über dich.</p>
              <p className="mt-2">Wenn du „In meinem E-Mail-Programm öffnen“ nutzt, öffnet sich dein eigenes E-Mail-Programm. Die Nachricht verschickst du selbst; WoYou ist daran nicht beteiligt und bekommt keine Kopie und keine Antworten.</p>
            </section>

            {/* ANWALT PRÜFEN (23.10.2026): neuer Abschnitt Weitergabe an das CRM der EuBiA-Gruppe. Standort CRM: Hetzner, Helsinki (Finnland, EU). Beschreibt genau die
                Felder aus src/lib/crm-core.ts (candidatePayload, sendCrmEvent). Achtung: "land" ist das Wohnland und nur
                ersatzweise die Staatsangehörigkeit. Löschung im CRM nach Kontolöschung ist derzeit ein manueller Schritt
                (kein automatisches Löschereignis an das CRM). Grundlage: Vereinbarung zur Auftragsverarbeitung mit EuBiA. */}
            <section>
              <h2 className="font-semibold text-base">5. Weitergabe an das CRM der EuBiA-Gruppe</h2>
              <p>
                WoYou ist ein Angebot der {COMPANY.name}, eines Unternehmens der EuBiA-Gruppe. Für die Betreuung unserer
                Kund:innen nutzen wir das interne CRM (Kundenverwaltung) der EuBiA-Gruppe. Es wird auf einem Server der Hetzner
                Online GmbH in der EU betrieben (Rechenzentrum in Helsinki, Finnland). Verantwortlich für deine Daten bleibt die {COMPANY.name}. Die
                Verarbeitung im CRM erfolgt auf Grundlage einer Vereinbarung zur Auftragsverarbeitung.
              </p>
              <p className="mt-2">
                <strong>Zweck:</strong> Wir nutzen die Angaben, um dich bei Fragen zu betreuen, Buchungen und Zahlungen
                abzurechnen und auszuwerten, wie Kund:innen durch unser Angebot gehen (zum Beispiel wie viele nach der
                Registrierung buchen).
              </p>
              <p className="mt-2"><strong>Diese Angaben übermitteln wir:</strong></p>
              <ul className="list-disc ml-5 space-y-1">
                <li>deine Kundennummer bei WoYou, Vorname, Nachname und E-Mail-Adresse,</li>
                <li>deine Telefonnummer (aus der Buchung, sonst deine WhatsApp- oder Konto-Nummer),</li>
                <li>dein Land (Wohnland, wenn du keins angegeben hast, deine Staatsangehörigkeit),</li>
                <li>deinen Zielberuf und das gebuchte Paket,</li>
                <li>den Stand deiner Buchung: registriert, gebucht, bezahlt, Unterlagen eingereicht, Bewerbungswerkzeug freigeschaltet oder storniert, jeweils mit Datum, bei einer Zahlung auch den Betrag.</li>
              </ul>
              <p className="mt-2">
                Deine Bewerbungsunterlagen übermitteln wir nicht an das CRM: keinen Lebenslauf, kein Foto, kein
                Geburtsdatum, keine Anschreiben, keine Suchbegriffe und keine Einträge aus deinem Bewerbungstracker.
                Zahlungsdaten wie Kartennummern liegen nur bei Stripe.
              </p>
              <p className="mt-2">
                <strong>Rechtsgrundlage:</strong> Die Übermittlung ist nötig, um deinen Vertrag mit uns zu erfüllen und
                abzurechnen (Art. 6 Abs. 1 lit. b DSGVO). Die Auswertung des Kundenwegs beruht auf unserem berechtigten
                Interesse, unser Angebot zu verbessern (Art. 6 Abs. 1 lit. f DSGVO). Dem kannst du jederzeit
                widersprechen.
              </p>
              <p className="mt-2">
                <strong>Speicherdauer:</strong> Wir speichern die Angaben im CRM, solange du bei uns ein Konto hast.
                Löschst du dein Konto, informieren wir das CRM automatisch, und dein Eintrag wird innerhalb von 30
                Tagen gelöscht bzw. anonymisiert. Angaben zu Zahlungen bewahren wir auf, solange das Steuer- und Handelsrecht es verlangt (bis zu 10 Jahre).
              </p>
              <p className="mt-2">
                <strong>Getrennt von anderen Bereichen:</strong> Im CRM liegen die WoYou-Angaben in einem eigenen
                Bereich. Zugriff haben nur die Personen, die WoYou-Kund:innen betreuen, und die Verwaltung des CRM. Wir
                nutzen die Angaben nicht für andere Angebote der EuBiA-Gruppe, etwa Weiterbildungen oder den
                Unternehmensservice, und geben sie nicht an andere Unternehmen der Gruppe weiter.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">6. Speicherdauer</h2>
              <p>
                Solange dein Konto besteht. Nach der Löschung deines Kontos entfernen wir deine Daten innerhalb
                von 30 Tagen, soweit keine gesetzlichen Aufbewahrungspflichten bestehen.
              </p>
              {/* ANWALT PRÜFEN (23.10.2026): Werkzeug nur 3 Monate, keine Verlängerung; Daten danach bis zur Kontolöschung */}
              <p className="mt-2">
                Das Bewerbungswerkzeug läuft nur für die im Startpaket enthaltene Zeit. Danach sind Stellensuche und
                Tracker gesperrt, deine Daten löschen wir dadurch aber nicht automatisch: Deine Unterlagen und die
                Anschreiben zu deinen Stellen kannst du weiter herunterladen. Wenn du das nicht mehr brauchst, kannst du
                einzelne Stellen entfernen oder dein Konto löschen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">7. Deine Rechte</h2>
              <p>
                Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
                Datenübertragbarkeit und Widerspruch. Einwilligungen kannst du jederzeit widerrufen. Deine Daten
                kannst du in deinem Bereich selbst herunterladen oder dein Konto löschen. Außerdem kannst du dich
                bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel bei der Landesbeauftragten für
                Datenschutz und Informationsfreiheit Nordrhein-Westfalen.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-base">8. Kontakt</h2>
              <p>Fragen zum Datenschutz: {COMPANY.email} oder direkt an unsere Datenschutzbeauftragte: {COMPANY.dpo.email}</p>
            </section>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
