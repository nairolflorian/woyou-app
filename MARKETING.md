# Marketing Woyou

## 1. Automatische Mails (Marketingstrecke)

Im Admin unter **Marketing**: Liste der Schritte, wer heute fällig wäre, Vorschau jeder Mail in DE, EN, FR und AR.

| Schritt | Wann |
|---|---|
| REG_1, REG_3, REG_7 | 1, 3 und 7 Tage nach Registrierung ohne Buchung |
| PAY_1 | 1 Tag nach Buchung ohne Zahlung |
| MAPPE_2, MAPPE_5 | 2 und 5 Tage nach Zahlung, Mappe nicht eingereicht |
| CREDITS_LOW | noch 1 bis 3 Bewerbungen übrig (ohne Abo) |
| CREDITS_EMPTY | Guthaben aufgebraucht (ohne Abo) |
| FEEDBACK | 14 Tage nach der letzten von 25 Bewerbungen |

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

**Deutsch**
> Bewerbungen in Deutschland kosten Zeit und Nerven? Wir schreiben deinen Lebenslauf nach deutschem Standard und schicken 25 passende Bewerbungen in deinem Namen. Einmalig 199 €. Antworten der Firmen bekommst du direkt.
> Button: Jetzt starten

**Englisch**
> Want a job in Germany but applications take forever? We write your CV to German standards and send 25 matching applications in your name. One-time €199. Companies reply to you directly.
> Button: Get started

**Französisch**
> Vous cherchez un emploi en Allemagne ? Nous rédigeons votre CV aux normes allemandes et envoyons 25 candidatures adaptées en votre nom. 199 € une seule fois. Les entreprises vous répondent directement.
> Bouton : Commencer

**Arabisch**
> تبحث عن عمل في ألمانيا؟ نكتب سيرتك الذاتية بالمعايير الألمانية ونرسل 25 طلبًا مناسبًا باسمك. 199 € مرة واحدة فقط. ردود الشركات تصلك مباشرة.
> الزر: ابدأ الآن

**Kurz für Stories und Reels (DE)**
> 25 Bewerbungen. Ein Lebenslauf nach deutschem Standard. 199 €. Wir machen das für dich.

Hinweise für Anzeigen: keine Job- oder Erfolgsgarantie versprechen (die Entscheidung trifft der Arbeitgeber), Preis immer nennen, auf die Startseite verlinken, nicht auf die Buchungsseite.
