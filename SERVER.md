# Server-Deployment — Hosting

Diese Datei dokumentiert, wie und wo die Demo aktuell live läuft.

## Aktuelle Live-URL

🌐 **https://woyou-app.46.225.109.84.nip.io**
🎬 Rollen-Test: **/demo**

`nip.io` ist ein freier DNS-Trick: jede Subdomain unter `<ip>.nip.io` löst sich automatisch auf die jeweilige IP auf — DNS-Eintrag ist also nicht nötig. Sobald du eine echte Domain hast (z.B. `demo.woyou.de`), trägst du sie ergänzend in die nginx-Config ein und lässt Certbot ein zusätzliches Cert ausstellen.

## Server

- **Host:** `46.225.109.84` (Hostname „Hosting")
- **OS:** Ubuntu 24.04 LTS
- **Reverse Proxy:** nginx (existierte schon)
- **TLS:** Let's Encrypt via Certbot (`certbot --nginx`)

Die WoYou-App liegt isoliert in `/var/www/woyou-app/` — alle anderen Sites (`woyou-preview` mit dem Ursprungs-Static-HTML, `knueppelknifte*`, `xperten`, `florianhermann.de` …) sind unangetastet.

## Deployment-Layout

```
/var/www/woyou-app/
└── repo/                       # git clone von github.com/nairolflorian/woyou-app
    ├── docker-compose.yml      # Stack (app + postgres + db-init)
    ├── Dockerfile              # Multi-Stage: deps → builder → runner (Standalone)
    ├── .env                    # NICHT in Git — enthält SESSION_PASSWORD etc.
    └── …
```

**Container:**

| Name | Port (host) | Port (intern) | Image |
|---|---|---|---|
| `woyou_app` | 127.0.0.1:**3050** | 3000 | `woyou-app:latest` |
| `woyou_postgres` | 127.0.0.1:**5463** | 5432 | `postgres:16-alpine` |

Beide hängen am Docker-Netzwerk `woyou_net`. `woyou_app` redet intern via `postgres:5432` mit Postgres.

**Persistente Volumes:**
- `woyou_pg` — Postgres-Daten
- `woyou_uploads` — Hochgeladene Dokumente (Lebensläufe, Pässe, Diplome) gemountet auf `/app/uploads` im App-Container

**Nginx:** `/etc/nginx/sites-enabled/woyou-app.conf` proxy-passt `https://woyou-app.46.225.109.84.nip.io` → `http://127.0.0.1:3050` (HTTP→HTTPS-Redirect ist aktiv).

**Cron-Jobs auf dem Host** (`/etc/cron.daily/`):

| Skript | Zweck |
|---|---|
| `woyou-postgres-backup` | Tägliches `pg_dump` nach `/var/backups/woyou/`, hält 7 Tage |
| `woyou-rematch` | Tägliches Re-Matching für vermittelbare Kandidaten und frische Stellen — ruft `/api/cron/re-match` mit `CRON_SECRET` auf |
| `woyou-reminders` | Tägliche Reminder-Notifications: unvollständige Profile (>3 Tage), wartende Consents (>24 h), wartende Firmen (>48 h), überfällige Admin-Aufgaben |

## Updates ausrollen

```bash
ssh -i ~/.ssh/webserver root@46.225.109.84
cd /var/www/woyou-app/repo
git pull
docker compose build app
docker compose up -d app
docker compose --profile init run --rm db-init   # nur wenn Schema-Änderung oder Re-Seed
```

## Nützliche Server-Kommandos

```bash
# Logs
docker compose -f /var/www/woyou-app/repo/docker-compose.yml logs -f app

# Status
docker compose -f /var/www/woyou-app/repo/docker-compose.yml ps

# In den Container
docker exec -it woyou_app sh

# Postgres
docker exec -it woyou_postgres psql -U woyou -d woyou

# Demo-Daten zurücksetzen
cd /var/www/woyou-app/repo && docker compose --profile init run --rm db-init
```

## Production-Härtung — TODOs für später

Aktuell läuft die Demo im **DEMO_MODE=true**, d.h. der Rollen-Switcher unter `/demo` ist öffentlich, jeder kann sich ohne Passwort als beliebige Rolle einloggen. Für eine produktive Version:

1. `DEMO_MODE=false` in `/var/www/woyou-app/repo/.env` setzen.
2. Eigene Domain (z.B. `demo.woyou.de` oder direkt `woyou.de`, falls die Static-Site abgelöst wird) als zweiten `server_name` in der nginx-Config eintragen.
3. Echtes Stripe-Key-Paar setzen (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`).
4. Telegram-Bot-Token + Username setzen, Webhook setzen mit `npm run telegram:set-webhook -- https://…/api/telegram/webhook`.
5. SMTP für E-Mail-Versand ergänzen (in der App noch nicht implementiert — Phase 2).
6. Impressum, Datenschutzerklärung und AGB ausfüllen (aktuell Demo-Platzhalter mit „⚠ Demo-Platzhalter"-Banner).
7. Backup-Cron läuft bereits (`/etc/cron.daily/woyou-postgres-backup`); für mehr Sicherheit ggf. Backups offsite synchronisieren.

Nach jeder `.env`-Änderung: `docker compose up -d` (kein Rebuild nötig, env wird beim Start gelesen).
