# Marketing Woyou

## 1. Automatische Mails (Marketingstrecke)

Im Admin unter **Marketing**: Liste der Schritte, wer heute fällig wäre, Vorschau jeder Mail in DE, EN, FR und AR.

| Schritt | Wann |
|---|---|
| REG_1, REG_3, REG_7 | 1, 3 und 7 Tage nach Registrierung ohne Buchung |
| PAY_1 | 1 Tag nach Buchung ohne Zahlung |
| MAPPE_2, MAPPE_5 | 2 und 5 Tage nach Zahlung, Mappe nicht eingereicht |
| TOOL_START | 3 Tage nach Freigabe der Mappe: Werkzeug kurz vorgestellt |
| TOOL_ENDS | Werkzeug endet in höchstens 7 Tagen, kein Abo |
| FEEDBACK | 45 Tage nach Zahlung |

Regeln: höchstens eine Mail pro Person und Tag, jeder Schritt nur einmal, Abmeldelink in jeder Mail (Seite `/abmelden`), Sprache nach Kundeneinstellung.

**Was noch fehlt, damit es läuft:**
1. SMTP-Postfach in `.env` (siehe BEWERBUNGSSERVICE.md)
2. Einmal auf dem Server: `bash deploy/cron-einrichten.sh` (legt den täglichen Zeitplan an, 9:00 Uhr)
3. Optional ausschalten: `MARKETING_MAILS=off`

## 2. Werbelinks mit Herkunft

Jeder Link in einer Anzeige bekommt `utm_source` (Kanal) und `utm_campaign` (Aktion). Woyou merkt sich das bei der Registrierung (ohne Cookie) und zeigt im Admin unter Marketing: Registrierungen, Buchungen, Quote und Umsatz je Quelle.

```
https://woyou.de/?utm_source=facebook&utm_campaign=pflege-marokko
https://woyou.de/?utm_source=tiktok&utm_campaign=lager-2026-11
https://woyou.de/?utm_source=whatsapp&utm_campaign=gruppe-casablanca
https://woyou.de/?utm_source=partner-name&utm_campaign=kurs-b1
```

Kanäle immer klein und gleich schreiben (facebook, instagram, tiktok, whatsapp, google, partner-…), sonst zählt die Auswertung sie getrennt.

Pilot Westbalkan (Länderseiten `/rs`, `/ba`, `/me`, Kampagne `/januar`): Links je Land und Kanal und wie sie in der Auswertung erscheinen, siehe `docs/KAMPAGNEN-LINKS.md`.

## 3. Anzeigentexte (Vorlagen)

Die bisherigen Vorlagen („25 Bewerbungen in deinem Namen“) sind mit Weg 1 (23.10.2026) entfernt. Neue Anzeigentexte legt Florian fest.

Hinweise für Anzeigen: keine Job- oder Erfolgsgarantie versprechen (die Entscheidung trifft der Arbeitgeber), nicht „wir bewerben dich“, „in deinem Namen“ oder „wir vermitteln“, keine Zahl an Bewerbungen versprechen, Preis immer nennen, auf die Startseite verlinken, nicht auf die Buchungsseite.

## 4. Meta Pixel und Google-Tag (nur mit Einwilligung)

Eingebaut seit 26.10.2026, aber aus, solange keine ID gesetzt ist. Ohne IDs sieht die Seite aus wie vorher: nur der Hinweis auf notwendige Cookies, keine Skripte von Meta oder Google, CSP unverändert.

**Schalter (Server-Umgebung, `.env` Staging bzw. `.env.prod`):**

| Variable | Wert | Woher |
|---|---|---|
| `META_PIXEL_ID` | nur Ziffern, z. B. `123456789012345` | Meta Events Manager, Datensatz (Pixel) |
| `GOOGLE_TAG_ID` | `G-…` (Analytics) oder `AW-…` (Ads) | Google Analytics Datenstream bzw. Google Ads Konto |

Ungültige Werte werden ignoriert. Im Admin unter **Auswertung** steht, ob die beiden eingerichtet sind. Nach dem Setzen den Container neu starten.

**Was dann passiert:**
- Banner unten mit „Alle akzeptieren“, „Nur notwendige“ und „Einstellungen“ (Schalter „Statistik und Werbung (Meta, Google)“, nicht vorausgewählt), 7 Sprachen. Wahl im Cookie `woyou_consent` (`v1:all` oder `v1:none`, 6 Monate). In der Fußzeile „Cookie-Einstellungen“ zum Ändern oder Widerrufen.
- Erst nach der Einwilligung lädt `gtag.js` (Consent Mode v2: zuerst alles verweigert, dann erteilt) bzw. `fbevents.js`.
- Die CSP bekommt nur dann die nötigen Adressen von Google und Meta dazu.
- Datenschutzerklärung bekommt Abschnitt 6 „Statistik und Werbung (nur mit Einwilligung)“ (ANWALT PRÜFEN).

**Ereignisse (nur feste Werte, nie Name, E-Mail, Telefon oder Freitext):**

| Wann | Meta | Google |
|---|---|---|
| jeder Seitenwechsel | `PageView` | `page_view` (Adresse nur mit Werbeparametern) |
| Selbstcheck fertig | `SelfCheckDone` (level, country), bei Grün/Gelb auch `Lead` | `selfcheck_done`, bei Grün/Gelb `generate_lead` |
| Registrierung | `CompleteRegistration` | `sign_up` |
| Startpaket bezahlt (`/bewerbungsservice/danke`) | `Purchase` 199 EUR, `eventID` = Buchungs-ID | `purchase` mit `transaction_id` = Buchungs-ID |

`country` ist das Länderkürzel beim Westbalkan (RS, BA, ME …), sonst `other`. Kein Tracking auf `/admin`, `/abmelden`, `/registrierung/telegram`, `/druck`.

**Sobald die Konten da sind:**
1. Meta Business Manager: Datensatz (Pixel) anlegen, ID in `META_PIXEL_ID`. Im Events Manager „Automatischer erweiterter Abgleich“ ausschalten (wir senden keine Kontaktdaten, das soll auch Meta nicht selbst auslesen). Domain woyou.de bestätigen. Vertrag zur gemeinsamen Verantwortung (Controller Addendum) akzeptieren.
2. Google Analytics: Property und Webstream für woyou.de anlegen, `G-…` in `GOOGLE_TAG_ID`. Unter Datenaufbewahrung 2 Monate einstellen (so steht es in der Datenschutzerklärung), Google Signals aus. Für Google Ads später: Konto verknüpfen oder `AW-…` nutzen und Conversions für `purchase` und `sign_up` anlegen.
3. Datenschutzerklärung Abschnitt 6 von der Anwältin prüfen lassen, erst dann die IDs in `.env.prod` setzen. Auf Staging zuerst testen (Meta „Test Events“, Google „DebugView“).
4. Prüfen: Seite im privaten Fenster öffnen, vor dem Klick dürfen keine Anfragen an facebook.net, facebook.com, googletagmanager.com oder google-analytics.com gehen.

**Noch nicht gebaut: Conversions API (Meta, serverseitig).** TODO, wenn die Anzeigen laufen:
- Systembenutzer im Business Manager mit Zugriffsschlüssel (System User Token) für den Datensatz, als Geheimnis nur in `.env.prod` (vom Server erzeugen/eintragen lassen, nicht ins Repo).
- Datensatz-ID (gleich der Pixel-ID) und Endpunkt `POST https://graph.facebook.com/v…/<dataset-id>/events`.
- Ereignis `Purchase` aus dem Stripe-Webhook (`checkout.session.completed`) senden, mit derselben `event_id` wie im Browser (Buchungs-ID), damit Meta doppelte Meldungen zusammenführt. Nur senden, wenn die Einwilligung vorliegt (dafür die Wahl bei der Buchung speichern), Kontaktdaten höchstens gehasht und nur nach anwaltlicher Freigabe.
- Für Google entsprechend Enhanced Conversions bzw. Measurement Protocol, ebenfalls erst nach Freigabe.
