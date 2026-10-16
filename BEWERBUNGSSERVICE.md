# Bewerbungs-Service (25 Bewerbungen für 199 €)

## Ablauf
1. **Angebot** `/bewerbungsservice` (DE/FR/EN/AR) → **Buchung** `/bewerbungsservice/buchen`
   (AGB, Widerruf, Vollmacht zum Versand). Ohne Stripe: Status „Angefragt“, mit Stripe: Checkout → „Bezahlt“.
2. **Bewerbungsmappe** `/bewerbungsmappe` (Kund:in): Angaben, Foto (optional), eigener Lebenslauf (PDF) oder
   erzeugter Lebenslauf, Vorschau als PDF, „Mappe abschicken“.
3. **Bearbeitung** `/admin/buchungen/<id>`: Mappe prüfen/ändern/freigeben → Stellensuche (Bundesagentur) →
   bis zu 25 Stellen auswählen (Ausschreibungstext + ggf. E-Mail werden übernommen, Anschreiben automatisch) →
   je Stelle prüfen → „Per Mail bewerben“ (Anschreiben + Lebenslauf als PDF, Kopie an Kund:in) oder
   „Über Firmenseite beworben“. Zähler x/25 läuft automatisch.

## Einstellungen (.env auf dem Server)
| Variable | Wofür | Ohne Wert |
|---|---|---|
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Zahlung, Webhook `/api/webhooks/stripe` | Buchung = Anfrage |
| `SMTP_HOST/PORT/SECURE/USER/PASS`, `MAIL_FROM`, `MAIL_TEAM` | Mails, Bewerbungsversand | Mails nur protokolliert, kein Versand |
| `MAIL_ALIAS_DOMAIN` (z. B. `bewerbung.woyou.de`) | persönliche Absenderadresse je Kund:in | Absender `MAIL_FROM`, Antworten direkt an Kund:in |
| `MAIL_INBOUND_TOKEN` | Eingang `/api/mail/inbound?token=…` (z. B. Brevo Inbound Parsing) leitet Antworten weiter | aus |
| `AI_PROVIDER` (`mistral`/`anthropic`), `AI_API_KEY`, `AI_MODEL` | Anschreiben-Formulierung mit Schreibregeln | sachliche Vorlage |

## Grenzen
- Stellen kommen nur aus der Jobbörse der Bundesagentur (offene Schnittstelle). Indeed/StepStone/LinkedIn
  verbieten automatisches Auslesen; Stellen von dort können manuell hinzugefügt werden.
- E-Mail-Adressen stehen nur in einem Teil der Ausschreibungen; sonst Bewerbung über die Firmenseite.
- Versand nur bei freigegebener Mappe, vorhandener Vollmacht und geprüftem Anschreiben (Bearbeiter liest gegen).
