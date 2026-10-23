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

## 3. Anzeigentexte (Vorlagen)

Die bisherigen Vorlagen („25 Bewerbungen in deinem Namen“) sind mit Weg 1 (23.10.2026) entfernt. Neue Anzeigentexte legt Florian fest.

Hinweise für Anzeigen: keine Job- oder Erfolgsgarantie versprechen (die Entscheidung trifft der Arbeitgeber), nicht „wir bewerben dich“, „in deinem Namen“ oder „wir vermitteln“, keine Zahl an Bewerbungen versprechen, Preis immer nennen, auf die Startseite verlinken, nicht auf die Buchungsseite.
