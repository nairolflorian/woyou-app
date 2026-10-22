# Weg 1: Umbau auf Unterlagen plus Bewerbungswerkzeug

Stand: 22.10.2026, Zweig `weg1-werkzeug` (nicht auf main, nicht deployt).

## Warum

Die Anwälte stufen den bisherigen Bewerbungs-Service (Team sucht Stellen aus, bewirbt im Namen der
Kund:innen über unsere Postfächer und Alias-Adressen, begleitet Antworten, „25 Bewerbungen“, Guthaben je
Bewerbung) als private Arbeitsvermittlung nach SGB III ein. Dann wären Vorauszahlung, Pakete und Abo
unzulässig.

Weg 1: WoYou bleibt ganz auf der Seite der Bewerber:innen. Verkauft werden Bewerbungsunterlagen und ein
Werkzeug, nicht Stellen und nicht das Versprechen eines Jobs.

Bedingungen:
- Kund:innen suchen und wählen Stellen selbst aus.
- Kund:innen verschicken ihre Bewerbungen selbst aus dem eigenen Postfach und bekommen die Antworten direkt.
- WoYou hat keinen Kontakt zu Unternehmen: kein Arbeitgeberbereich, kein Firmen-Pool, kein Matching.
- Keine Vorschläge vom Team je Kund:in. Automatische Suchtreffer auf Basis des eigenen Profils, die die
  Person selbst filtert und auswählt, sind das Werkzeug.

## Plan

1. **Abschalten** (Code bleibt, ist aber nicht erreichbar): zentraler Schalter `src/lib/weg1.ts`, von der
   Middleware geprüft. Gesperrt werden:
   - Team-Knopf „Jetzt bewerben“, jeder Versand von Bewerbungen durch WoYou (SMTP im Namen der Kund:innen)
   - persönliche Bewerbungsadressen (Alias) und das Weiterleiten/Lesen von Firmenantworten (`/api/mail/inbound`)
   - Guthaben je verschickter Bewerbung (alte Nachkauf-/Abo-Routen `/api/credits/*`)
   - Team-Auswahl von Stellen je Kund:in (Vorschläge, Suche, Stellenliste im Admin)
   - Arbeitgeber-/Firmenbereich, Matching, Unternehmens-Registrierung, Chats mit Firmen
   Das Team darf weiter Mappen prüfen und korrigieren (Unterlagen-Service), aber keine Stellen auswählen.
2. **Neu: Stellensuche** im Kundenbereich (`/stellensuche`): Suche über Bundesagentur, Arbeitnow,
   Karriereseiten-Feeds (Adzuna vorbereitet, aktiv mit Schlüssel), Filter Beruf, Ort/Umkreis, Arbeitszeit,
   Deutschniveau-Hinweis. Vorbelegung aus dem eigenen Profil, Ergebnisse zum Merken.
   **Neu: Meine Bewerbungen** (`/meine-bewerbungen`): Tracker mit gemerkt, beworben am, Antwort erhalten,
   Gespräch, Absage, Zusage, Notizen. Je Stelle: Anschreiben erzeugen (KI wenn eingerichtet, sonst
   Vorlage), als PDF oder Word laden, „In meinem E-Mail-Programm öffnen“ (mailto) oder Link zur
   Bewerbungsseite des Arbeitgebers.
3. **Angebot**: „Bewerbungsunterlagen plus Bewerbungswerkzeug“. Preise zentral in `src/lib/angebot.ts`
   (Platzhalter, Rachid legt fest): Startpaket inkl. Werkzeug für einige Monate, Verlängerung je Monat oder
   Monatsabo. Kein Guthaben je Bewerbung. Stripe: Startpaket als Einmalzahlung, Verlängerung als
   Einmalzahlung, Abo als Stripe-Abo mit Beginn nach Ablauf des bezahlten Zeitraums. Ohne Stripe-Schlüssel
   testbar (Buchung als „Angefragt“ plus Admin „bezahlt“, lokal zusätzlich `PAYMENT_TEST_MODE=on`).
4. **Texte**: Landing, Buchung, Kundenbereich, Mails, AGB/Datenschutz ohne „Wir bewerben dich“ und
   „25 Bewerbungen“. Deutsch, Englisch und Französisch neu; Arabisch und Hindi fallen für die geänderten
   Texte auf Englisch zurück, bis eine geprüfte Übersetzung vorliegt. Stellen in AGB/Datenschutz mit
   Code-Kommentar `ANWALT PRÜFEN` markiert.
5. **CRM**: Ereignisse registriert, gebucht, bezahlt, mappe_eingereicht, werkzeug_aktiv, nachkauf
   (Verlängerung/Abo), storniert. „bewerbungen_laufen“ entfällt (die eigenen Bewerbungen der Kund:innen
   gehen WoYou und das CRM nichts an). Weiter standardmäßig aus.
6. **Datenbank**: neue Migration, nur Ergänzungen (Tabelle `SavedJob`, Spalten `Candidate.toolAccessUntil`,
   `ServiceBooking.toolMonths`, `CreditPurchase.months`). Alte Tabellen und Spalten bleiben.

## Umsetzung (Stand Zweig)

- Schalter `src/lib/weg1.ts`, Sperre in `src/middleware.ts` (API 410, Seiten Weiterleitung), zusätzliche Prüfung in
  `leads.ts`, `suggest.ts`, `alias.ts`, `credits.ts`, Mail-Eingang, Firmen-Registrierung, Matching, Login von Firmenkonten.
- Angebot und Preise: `src/lib/angebot.ts`; Zugang, Käufe, Stripe: `src/lib/werkzeug.ts`; Buchung: `src/lib/bookings.ts`.
- Werkzeug: `src/lib/stellensuche-core.ts` (ohne Abhängigkeiten, getestet), `src/lib/stellensuche.ts`, `src/lib/tracker.ts`,
  Seiten `/stellensuche`, `/meine-bewerbungen`, API `/api/stellensuche`, `/api/stellen/*`, `/api/werkzeug/*`.
- Texte: `landing-copy.ts`, `services.ts`, `account-text.ts`, `werkzeug-text.ts`, `marketing.ts`, `mappe-i18n.ts`,
  AGB/Datenschutz (Stellen mit `ANWALT PRÜFEN` markiert).
- Migration `prisma/migrations/20261022120000_weg1_werkzeug` (nur Ergänzungen, gegen Postgres 16 getestet).
- Tests: `npx tsx scripts/weg1-test.ts` (14 Tests), Live-Test mit Netz `--conditions=react-server ... --live`.

Lokal starten:

```bash
git switch weg1-werkzeug
npm ci
docker compose up -d postgres            # Postgres auf Port 5444
export DATABASE_URL="postgresql://woyou:woyou@localhost:5444/woyou?schema=public"
npx prisma migrate deploy && npm run db:seed
PAYMENT_TEST_MODE=on npm run dev          # http://localhost:3000/demo, z. B. als fatima@example.com
```

## Offene Fragen für Rachid

- Preise: Startpaket, Verlängerung je Monat, Monatsabo (Platzhalter in `src/lib/angebot.ts`).
- Laufzeit des Werkzeugs im Startpaket (Platzhalter: 3 Monate). Was passiert mit den Daten nach Ablauf
  (Platzhalter: Tracker bleibt lesbar, Suche und neue Anschreiben gesperrt)?
- Korrigiert das Team weiter jede Mappe (Freigabe), oder nur auf Wunsch? Bleibt das Erstgespräch?
- Bestandskund:innen mit altem Paket „25 Bewerbungen“: wie lange Werkzeug-Zugang, Umgang mit Restguthaben?
- Karriereseiten-Feeds im Admin (Stellenquellen): bleibt das als reine Datenquelle, oder ist das aus Sicht
  der Anwälte schon ein „Firmen-Pool“?
- Arabisch und Hindi: geprüfte Übersetzung der neuen Texte.
- CRM: neue Ereignisse `werkzeug_aktiv` muss das EuBiA-CRM noch annehmen (`apps/crm/eingang.js`).
- Anwälte: Dürfen Summen aus dem Tracker (Quelle, Stand) anonym in der Admin-Auswertung stehen?
- Kündigung des Abos meldet kein „storniert“ mehr ans CRM (früher: Deal „Verloren“). So lassen?
