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
   „25 Bewerbungen“. Deutsch, Englisch, Französisch, Arabisch (rechts nach links, auch in den Mails) und
   Hindi; die ar/hi-Texte sind im Code mit „Übersetzung bitte von Muttersprachler:in prüfen lassen“ markiert.
   Spanisch, Russisch, Ukrainisch sehen für die neuen Texte Englisch. Stellen in AGB/Datenschutz mit
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
- Tests: `npx tsx scripts/weg1-test.ts` (18 Tests, u. a. ar/hi vollständig und ohne lange Gedankenstriche), Live-Test mit Netz `--conditions=react-server ... --live`.

## Aufgeräumt (23.10.)

- Gelöscht: Seiten `/arbeitgeber`, `/arbeitgeber/registrierung`, `/firmen/dashboard`, `/chat/[matchId]`, `/bewerber`,
  `/registrierung/profil`, `/sprachtest`, Admin `/admin/matching`, `/admin/firmen`, `/admin/anfragen`, `/admin/chats`,
  `/admin/analytics`; dazu die nur dort genutzten Komponenten (Firmen-Registrierung, Firmen-Dashboard, Chat, Match-Verlauf,
  Vorschlagen, Profil-Assistent mit Firmen-Freigabe, Sprachtest) und unbenutzte Team-Komponenten (Stellen übernehmen,
  „Jetzt bewerben“, Vorschläge, Onboarding „für die Vermittlung“).
- Weiterleitungen: `next.config.ts` dauerhaft für `/arbeitgeber`, `/firmen`, `/chat`, `/bewerber`, `/registrierung/profil`,
  `/sprachtest` und die alten Admin-Seiten; die Middleware leitet gesperrte öffentliche Seiten jetzt mit 301 um.
- Zusätzlich gesperrt: Auto-Matching (`src/lib/auto-match.ts`, auch bei Statuswechsel im Admin), Checkliste nach
  „vermittelt“ (`visa-workflow.ts`), `/api/cron/re-match` liefert auch ohne Middleware 410, Firmenkonten sehen keine
  Unterlagen mehr (`/api/documents`).
- Texte: Demo ohne Firmenkonten und ohne Match-Anleitung, Seed ohne Firmen und Stellenanfragen, Telegram-Bot ohne
  „für deutsche Unternehmen“ und „Vorschläge“, Admin ohne Match-Geschichte, Kandidaten-Status neutral beschriftet
  („vorgeschlagen“/„vermittelt“ nur noch als Altdaten), altes Paket heißt „früheres Paket“ (Restguthaben im Admin
  sichtbar), Mails zu alten Käufen ohne „Wir bewerben dich weiter“. Unbenutzte i18n-Schlüssel mit Firmen-, Matching-
  und Vermittlungstexten entfernt; Anzeigenvorlagen in `MARKETING.md` entfernt.
- Server: Falls auf dem alten Server noch `/etc/cron.daily/woyou-rematch` liegt (siehe `SERVER.md`), kann er weg; die
  Route antwortet nur noch mit 410.

## Selbstversand (23.10.2026)

Je gemerkter Stelle in „Meine Bewerbungen“ gibt es „Bewerbung prüfen und senden“ in drei Schritten:

1. **Prüfen**: Anschreiben (beim ersten Öffnen aus der Mappe erstellt, editierbar), Lebenslauf ansehen bzw. in der
   Mappe ändern, Empfänger (aus der Anzeige, sonst Feld mit Hinweis auf das Bewerbungsportal), Betreff und Mailtext
   (vorbelegt, editierbar, „Vorschlag wiederherstellen“). Absender ist die eigene Adresse der Person.
2. **Senden**: „In meinem Mailprogramm öffnen“ (mailto nach RFC 6068, CRLF, höchstens 1800 Zeichen, sonst gekürzt mit
   Hinweis), „Anschreiben und Lebenslauf (eine PDF)“ bzw. einzeln (mit eigenem hochgeladenem Lebenslauf: zwei Dateien),
   am Desktop „Fertige E-Mail mit Anhängen (.eml)“ (`X-Unsent: 1`, multipart/mixed, beide PDFs, From = eigene
   Adresse), Kopierknöpfe für Adresse, Betreff, Text, kurze Anleitung für Outlook/Apple Mail/Thunderbird, Gmail,
   iPhone Mail, Outlook-App.
3. **Eintragen**: „Ich habe gesendet“ mit Datum, optional Erinnerung zum Nachfassen (Standard +7 Tage, wird im
   Tracker angezeigt und ist fällig, solange der Stand „beworben“ ist).

Im Profil („Mein Bereich“) gibt es „E-Mail-Adresse für Bewerbungen“ (leer = Login-Mail). Sie steht in Anschreiben,
Lebenslauf und Mailentwurf. WoYou speichert keine Mail-Passwörter und verschickt keine Bewerbungen.

Code: `src/components/VersandPanel.tsx`, `src/components/VersandAdresse.tsx`, `src/lib/versand-text.ts` (de/en/fr/ar/hi),
`src/lib/eml.ts`, `src/lib/tracker.ts` (`sendFiles`, `emlFile`), `src/lib/pdf.tsx` (`bundlePdf`), Routen
`/api/stellen/[id]/dokument?format=pdf|docx|cv|bundle`, `/api/stellen/[id]/eml`, `/api/account/bewerbungsmail`.
Migration `20261023120000_weg1_selbstversand` (nur neue, leere Spalten: `Candidate.applicationEmail`,
`SavedJob.mailTo/mailSubject/mailBody/followUpAt`).

## Deploy (Server 46.225.109.84, `/var/www/woyou-app/repo`)

Wichtig: `docker compose --profile init run --rm db-init` OHNE Befehl spielt die Demo-Daten neu ein (der Dienst
bekommt `DEMO_MODE` nicht durchgereicht). Für Migrationen immer ausdrücklich `npx prisma migrate deploy` angeben.

```bash
ssh -i ~/.ssh/webserver root@46.225.109.84
cd /var/www/woyou-app/repo
git status -sb                                   # muss sauber sein, Stand main
git rev-parse HEAD > /root/woyou-vor-weg1.txt     # alter Stand für den Rückweg
# 1. Sicherung
docker exec woyou_postgres pg_dump -U woyou -d woyou | gzip > /var/backups/woyou/vor-weg1-$(date -u +%Y%m%dT%H%M%SZ).sql.gz
ls -la /var/backups/woyou/ | tail -2             # Datei > 0 Byte prüfen
# 2. Code
git pull --ff-only
# 3. Migrationen (nur Ergänzungen: 20261022120000_weg1_werkzeug, 20261023120000_weg1_selbstversand)
docker compose --profile init build db-init
docker compose --profile init run --rm db-init npx prisma migrate deploy
# 4. App
docker compose build app && docker compose up -d app
docker builder prune -f && docker image prune -f
# 5. Altlast im Zeitplan (Route antwortet nur noch 410)
rm -f /etc/cron.daily/woyou-rematch
# 6. Prüfen
curl -sI https://woyou-app.46.225.109.84.nip.io/arbeitgeber | head -3          # 301 auf /
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://woyou-app.46.225.109.84.nip.io/api/admin/leads/x/send   # 410
docker logs --tail 50 woyou_app
```

Zurück: `git reset --hard $(cat /root/woyou-vor-weg1.txt) && docker compose build app && docker compose up -d app`. Die neuen Spalten und
die Tabelle `SavedJob` stören den alten Stand nicht. Nur bei Bedarf die Sicherung einspielen.

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
- Arabisch und Hindi: Übersetzungen der neuen Texte liegen vor (Hocharabisch für Marokko, Hindi für Indien), müssen aber von Muttersprachler:innen geprüft werden.
- CRM: neue Ereignisse `werkzeug_aktiv` muss das EuBiA-CRM noch annehmen (`apps/crm/eingang.js`).
- Anwälte: Dürfen Summen aus dem Tracker (Quelle, Stand) anonym in der Admin-Auswertung stehen?
- Kündigung des Abos meldet kein „storniert“ mehr ans CRM (früher: Deal „Verloren“). So lassen?
