# Produktion woyou.de und Staging

Stand: 23.10.2026. Entscheidung Florian: woyou.de wird die echte App. Die bisherige Testumgebung heißt jetzt Staging.

| | Produktion | Staging |
|---|---|---|
| Adresse | https://woyou.de (www → 301 auf woyou.de) | https://woyou-app.46.225.109.84.nip.io |
| Compose | `docker-compose.prod.yml`, Projekt `woyou-prod` | `docker-compose.yml`, Projekt `repo` |
| App | `woyou_app_prod`, 127.0.0.1:3051, Image `woyou-app-prod` | `woyou_app`, 127.0.0.1:3050 |
| Datenbank | eigener Container `woyou_postgres_prod`, Volume `woyou_prod_pg`, kein Host-Port | `woyou_postgres`, 127.0.0.1:5463 |
| Uploads | Volume `woyou_prod_uploads` | `repo_woyou_uploads` |
| Env | `.env.prod` (600) | `.env` (600) |
| DEMO_MODE | `false`: keine /demo-Seite (404), keine Demo-Logins, Seed bricht ab | an: /demo, Fatima & Co., Leiste „STAGING“ |
| Stripe | nur Live-Schlüssel (`sk_live_`/`rk_live_`) | nur Testmodus (`sk_test_`/`rk_test_`) |
| EuBiA-CRM | nur hier, und erst mit `EUBIA_CRM_SYNC=on` | nie (Code sendet bei DEMO_MODE an nichts) |
| nginx | `/etc/nginx/sites-available/woyou-de-app.conf` (Vorlage `deploy/nginx/woyou.de.conf`) | `woyou-app.conf` |
| Sicherung | `/etc/cron.daily/woyou-prod-backup` → `/var/backups/woyou-prod` (14 Tage) | `woyou-postgres-backup` → `/var/backups/woyou` |
| Zeitplan | `/etc/cron.d/woyou-prod` (Erinnerungen, Aufräumen; Marketing-Mails erst mit SMTP) | wie bisher |

Die Umgebungen teilen nichts: eigenes Netz, eigene Datenbank mit eigenem Passwort, eigene Volumes. `docker compose up -d app`
(Staging) berührt Produktion nicht und umgekehrt. In `docker-compose.prod.yml` gibt es absichtlich keine `${...}`-Werte, damit
nichts aus der Staging-`.env` hineinrutscht. `migrate` führt nur `prisma migrate deploy` aus, nie den Seed.

## Einrichten (Server 46.225.109.84, `/var/www/woyou-app/repo`)

```bash
cd /var/www/woyou-app/repo
git pull --ff-only
bash scripts/prod-einrichten.sh                    # Sicherungen, Prod-DB, Migration, Prod-App, nginx, Rauchtest
bash scripts/stripe-einrichten.sh prod --verschieben   # Live-Schlüssel aus Staging nach .env.prod, Staging leeren
bash scripts/admin-anlegen.sh                      # erster Super-Admin (Passwort verdeckt)
```

`prod-einrichten.sh` ist idempotent und dient auch als Update-Befehl für Produktion (nach `git pull`). Optionen:
`--ohne-nginx` (alles außer der Umstellung, Prüfung am Container) und `--nur-pruefen` (nur Rauchtests).
Bricht der Rauchtest am Container ab, wird nginx nicht umgestellt. Schlägt `nginx -t` fehl, kommt die alte Config zurück.

Weitere Skripte:
- `bash scripts/stripe-einrichten.sh staging`: Testmodus-Schlüssel für Staging (sk_test_, pk_test_, whsec_ aus dem Testmodus).
  Webhook im Stripe-Testmodus: `https://woyou-app.46.225.109.84.nip.io/api/webhooks/stripe`.
- `bash scripts/stripe-einrichten.sh prod`: Live-Schlüssel direkt eingeben. Webhook im Live-Modus: `https://woyou.de/api/webhooks/stripe`,
  Ereignis `checkout.session.completed`.
- `bash scripts/admin-anlegen.sh --neues-passwort`: neues Passwort für ein Admin-/Team-Konto (es gibt noch keinen Mail-Versand).
- `bash deploy/crm-einrichten.sh`: CRM-Anbindung, schreibt jetzt in `.env.prod` (vorher Datenschutzerklärung ergänzen, siehe unten).

Update Produktion: `git pull --ff-only && bash scripts/prod-einrichten.sh`.
Update Staging wie bisher: `docker compose build app && docker compose up -d app` (nie `db-init` ohne Befehl).

## Ohne SMTP

Läuft: Registrierung und Anmeldung brauchen keine Mail. Mails werden nur protokolliert (Admin > Buchungen „Letzte Mails“).
„Passwort vergessen?“ zeigt unter dem Login den Hinweis, an info@woyou.de zu schreiben; das Team setzt das Passwort im Admin
(Kund:in > Passwort) oder per `admin-anlegen.sh --neues-passwort` zurück. Buchungsbestätigung und Zahlungslink per Mail kommen
erst mit SMTP; mit Stripe läuft die Zahlung direkt im Checkout nach der Buchung.

## Rückweg

1. woyou.de wieder auf die alte statische Seite (App läuft weiter, ist nur nicht mehr erreichbar):
   ```bash
   rm /etc/nginx/sites-enabled/woyou-de-app.conf
   cp -p /etc/nginx/sites-available/woyou-preview.conf.vor-prod /etc/nginx/sites-enabled/woyou-preview.conf
   nginx -t && systemctl reload nginx
   ```
   Die alte Seite liegt unverändert in `/var/www/woyou-preview` (zusätzlich als tar in `/var/backups/woyou/prod-einrichten-*/`).
2. Prod-App anhalten: `docker compose -p woyou-prod -f docker-compose.prod.yml --env-file .env.prod stop app`
3. Stripe-Schlüssel zurück nach Staging (falls nötig): Sicherung `.env.vor-stripe-<Zeit>` zurückkopieren und
   `docker compose up -d --force-recreate app`. Hinweis: Staging nimmt Live-Schlüssel ohnehin nicht an.
4. Code-Stand vorher: `/var/www/woyou-app/repo/.prod-stand-<Zeit>`; Staging-Datenbank vorher: `/var/backups/woyou/prod-einrichten-*/staging-woyou.sql.gz`.

Daten der Produktion bleiben bei 1. und 2. erhalten (Volumes `woyou_prod_pg`, `woyou_prod_uploads`). Erst `docker volume rm` löscht sie.

## Offen vor echten Kund:innen

- Anwälte: AGB, Datenschutz, Angebot (Stellen mit `ANWALT PRÜFEN` im Code).
- USt-ID: steht auch auf karrierekind.de nicht; falls vorhanden in `src/lib/company.ts` und Impressum ergänzen.
- CRM: Datenschutzerklärung um die Weitergabe an das EuBiA-CRM ergänzen, dann `bash deploy/crm-einrichten.sh`.
- SMTP für System-Mails, danach Marketing-Zeitplan für Produktion.
- Telegram-Bot: ein Bot kann nur einen Webhook haben; bleibt vorerst bei Staging.
