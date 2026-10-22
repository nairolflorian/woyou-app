# Bewerbungsunterlagen plus Bewerbungswerkzeug (Weg 1, Stand 22.10.2026)

Bis 22.10.2026 hieß das hier „Bewerbungs-Service (25 Bewerbungen für 199 €)“: das Team suchte Stellen aus und
verschickte Bewerbungen im Namen der Kund:innen. Das ist abgeschaltet (siehe docs/WEG1-UMBAU.md und src/lib/weg1.ts).

## Ablauf
1. **Angebot** `/` → **Buchung** `/bewerbungsservice/buchen` (AGB, Widerruf; keine Vollmacht mehr).
   Ohne Stripe: Status „Angefragt“, Team markiert „Bezahlt“; mit Stripe: Checkout. Zahlung schaltet das Werkzeug frei.
2. **Bewerbungsmappe** `/bewerbungsmappe`: Angaben, Foto, eigener Lebenslauf, Design, „Mappe abschicken“.
3. **Prüfung** `/admin/buchungen/<id>`: Team prüft, korrigiert und gibt frei. Kund:in bekommt eine Mail
   „Unterlagen fertig“. Das Team wählt keine Stellen aus und verschickt nichts.
4. **Stellensuche** `/stellensuche` (Kund:in): BA, Arbeitnow, Karriereseiten-Feeds, Adzuna (mit Schlüssel);
   Filter Beruf, Ort/Umkreis, Arbeitszeit, Deutsch-Hinweis; Vorbelegung aus dem Profil; Merken.
5. **Meine Bewerbungen** `/meine-bewerbungen` (Kund:in): Stand, Datum, Notizen, Anschreiben je Stelle
   (PDF/Word), „In meinem E-Mail-Programm öffnen“ (mailto) oder Link zur Bewerbungsseite.
6. **Verlängern** im Kundenbereich: 1 Monat einmalig oder Monatsabo (beginnt nach Ablauf des bezahlten Zeitraums).

Preise und Laufzeit: `src/lib/angebot.ts` (Platzhalter).

## Einstellungen (.env)
| Variable | Wofür | Ohne Wert |
|---|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Zahlung, Webhook `/api/webhooks/stripe` (checkout.session.completed, invoice.paid, customer.subscription.deleted) | Buchung/Kauf = Anfrage, Team markiert bezahlt |
| `PAYMENT_TEST_MODE=on` | nur lokal mit `next dev`: Zahlung überspringen | aus |
| `SMTP_*`, `MAIL_FROM`, `MAIL_TEAM` | Benachrichtigungen | Mails nur protokolliert |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | Anschreiben je Stelle mit KI | sachliche Vorlage |
| `ADZUNA_APP_ID`, `ADZUNA_APP_KEY` | weitere Stellenquelle | aus |
| `MAIL_ALIAS_DOMAIN`, `MAIL_INBOUND_TOKEN` | ALT, abgeschaltet | wird ignoriert |

## Tests
`npx tsx scripts/weg1-test.ts` (Kernlogik), mit Netz: `npx tsx --conditions=react-server scripts/weg1-test.ts --live`.
