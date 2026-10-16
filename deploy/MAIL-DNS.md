# Mail für Woyou: Versand und persönliche Antwortadressen

Stand 16.10.2026 (öffentlich abgefragt):

| Eintrag | Wert | Zustand |
|---|---|---|
| MX woyou.de | mx00.ionos.de, mx01.ionos.de | vorhanden |
| SPF woyou.de | `v=spf1 include:_spf-eu.ionos.com ~all` | vorhanden |
| DKIM `s1-ionos._domainkey.woyou.de` | CNAME `s1.dkim.ionos.com` | vorhanden |
| DMARC `_dmarc.woyou.de` | `v=DMARC1; p=none;` | vorhanden |
| MX bewerbung.woyou.de | – | **fehlt** |

## So läuft es

- **Versand:** über ein IONOS-Postfach, z. B. `bewerbung@woyou.de`. Absender in der Bewerbung: „Fatima Benali (über WoYou) <bewerbung@woyou.de>“. SPF, DKIM und DMARC für woyou.de passen schon.
- **Antworten:** Jede Bewerbung hat als Antwortadresse die persönliche Adresse des Kunden, z. B. `fatima.benali@bewerbung.woyou.de`. Mails an diese Subdomain nimmt Brevo an (Inbound Parsing) und schickt sie an Woyou. Woyou leitet sie an die echte Adresse des Kunden weiter und vermerkt die Antwort bei der passenden Stelle.
- Brevo verlangt, dass die Empfangsdomain nicht zum Versenden genutzt wird. Deshalb ist bewerbung.woyou.de nur Empfang, versendet wird über woyou.de.

## 1. IONOS: Postfach (Ticket „E-Mail-Postfach für den Versand einrichten“)

Postfach `bewerbung@woyou.de` anlegen. In die `.env` der App:

```
SMTP_HOST=smtp.ionos.de
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=bewerbung@woyou.de
SMTP_PASS=<Passwort des Postfachs>
MAIL_FROM="WoYou <bewerbung@woyou.de>"
MAIL_TEAM=info@woyou.de
```

## 2. Brevo: Konto und Domain

1. Kostenloses Konto bei brevo.com (Firma KarriereKind GmbH)
2. Unter „Absender, Domains“ die Domain `bewerbung.woyou.de` hinzufügen. Brevo zeigt dann einen TXT-Eintrag zur Bestätigung an (`brevo-code:…`).
3. API-Schlüssel erzeugen (nur für den einmaligen Webhook-Aufruf unten)

Hinweis: Ob Inbound Parsing im kostenlosen Tarif enthalten ist, steht nicht in der Brevo-Dokumentation. Beim Anlegen prüfen.

## 3. IONOS: DNS-Einträge für bewerbung.woyou.de

| Typ | Host / Name | Wert | Priorität |
|---|---|---|---|
| MX | `bewerbung` | `inbound1.sendinblue.com` | 10 |
| MX | `bewerbung` | `inbound2.sendinblue.com` | 20 |
| TXT | `bewerbung` | `brevo-code:…` (Wert aus Brevo, Schritt 2) | – |

Bei IONOS: Domains & SSL → woyou.de → DNS → Eintrag hinzufügen. Die Übernahme kann einige Stunden dauern.

Prüfen:
```
dig +short MX bewerbung.woyou.de
```

## 4. Webhook bei Brevo anlegen (einmalig)

`MAIL_INBOUND_TOKEN` erzeugt der Server selbst (`openssl rand -hex 24`, in die `.env`). Dann:

```
curl -X POST https://api.brevo.com/v3/webhooks \
  -H "api-key: <Brevo-API-Schlüssel>" -H "content-type: application/json" \
  -d '{"type":"inbound","events":["inboundEmailProcessed"],"domain":"bewerbung.woyou.de",
       "url":"https://woyou.de/api/mail/inbound?token=<MAIL_INBOUND_TOKEN>","description":"Woyou Antworten"}'
```

## 5. App einschalten

In die `.env`:
```
MAIL_ALIAS_DOMAIN=bewerbung.woyou.de
MAIL_INBOUND_TOKEN=<wie oben>
```
Dann `docker compose up -d app`. Test: Mail an die Adresse einer Testbuchung schicken (steht im Admin bei der Buchung unter „Bewerbungsadresse“). Sie muss beim Kunden ankommen und bei der Stelle als Antwort erscheinen.

Quellen: Brevo-Doku „Parse inbound email“ (developers.brevo.com/docs/inbound-parse-webhooks).
