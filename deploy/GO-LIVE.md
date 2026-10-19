# Go-live woyou.de

Stand: App läuft als Test unter https://woyou-app.46.225.109.84.nip.io. woyou.de zeigt noch auf die statische Seite (`/var/www/woyou-preview`). DNS muss nicht geändert werden, die Domain zeigt bereits auf diesen Server.

## Vorher erledigt sein muss
- Freigabe der Seite und des Angebots durch Rachid, Go-live-Termin
- Anwaltliche Prüfung von AGB, Datenschutz und Angebot (§ 296 SGB III)
- Stripe-Konto (Live-Schlüssel und Webhook `https://woyou.de/api/webhooks/stripe`)
- Postfach für den Versand (SMTP), optional Weiterleitungsadressen (siehe BEWERBUNGSSERVICE.md)

## Schritte (ca. 15 Minuten)
1. Backup: `docker exec woyou_postgres pg_dumpall -U <user> > ../backups/vor-golive-$(date +%F).sql`
2. `.env` der App: `NEXT_PUBLIC_BASE_URL=https://woyou.de`, `DEMO_MODE=false`, Stripe- und SMTP-Werte eintragen
3. Demo-Daten entfernen, erst Probelauf, dann wirklich:
   ```
   docker compose --profile init run --rm db-init npx tsx scripts/demo-daten-entfernen.ts
   docker compose --profile init run --rm db-init npx tsx scripts/demo-daten-entfernen.ts --ausfuehren
   ```
   Wichtig: `docker compose --profile init run --rm db-init` ohne Befehl spielt bei `DEMO_MODE` ungleich `false` die Demo neu ein und löscht dabei alles. Für Migrationen immer `... db-init npx prisma migrate deploy` verwenden.
3b. Zeitplan einrichten: `bash deploy/cron-einrichten.sh`
3c. Mail und Antwortadressen: siehe deploy/MAIL-DNS.md
4. `docker compose build app && docker compose up -d app`
5. nginx umstellen:
   ```
   cp deploy/nginx/woyou.de.conf /etc/nginx/sites-available/woyou-de-app.conf
   rm /etc/nginx/sites-enabled/woyou-preview.conf
   ln -s /etc/nginx/sites-available/woyou-de-app.conf /etc/nginx/sites-enabled/
   nginx -t && systemctl reload nginx
   ```
6. Prüfen: Startseite, `/faq.html` → `/#faq`, Buchung bis Stripe, Testmail
7. Zurück (falls nötig): Link wieder auf `woyou-preview.conf` setzen, `nginx -t && systemctl reload nginx`

## Nach jedem Deploy: Speicher aufräumen

Jeder Build legt Zwischenstände ab. Am 19.10.2026 lief die Platte dadurch voll (27 MB frei), die Datenbanken auf dem Server hatten kurz Schreibfehler. Darum nach jedem Deploy:
```
docker builder prune -f && docker image prune -f
```
