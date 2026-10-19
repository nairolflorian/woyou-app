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

## Anbindung EuBiA-CRM

WoYou meldet Kundenereignisse an das EuBiA-CRM (registriert, gebucht, bezahlt, Mappe eingereicht, Bewerbungen laufen, Nachkauf, storniert). Standard ist aus. Gesendet wird erst, wenn `EUBIA_CRM_URL`, `EUBIA_CRM_TOKEN` und `EUBIA_CRM_SYNC=on` in der `.env` stehen. Demo- und Testkonten werden nie übertragen. Code: `src/lib/crm-sync.ts`.

1. Vorher: Die Datenschutzerklärung von WoYou muss die Weitergabe an EuBiA abdecken, Vereinbarung mit EuBiA liegt vor.
2. Schlüssel für den Woyou-Eingang im EuBiA-CRM bereithalten (nie ins Repo, nie in den Chat).
3. Einrichten (fragt Adresse und Schlüssel ab, startet die App neu): `bash deploy/crm-einrichten.sh`
4. Bestehende Kund:innen einmalig nachtragen, erst Probelauf, dann wirklich:
   ```
   docker compose --profile init build db-init
   docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts
   docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts --ausfuehren
   ```
5. Prüfen: Testbuchung anlegen, im CRM erscheint die Kund:in. Fehler stehen nur als Ereignis und Status im Log: `docker logs woyou_app 2>&1 | grep '\[crm\]'`
6. Ausschalten: `EUBIA_CRM_SYNC=off` in `.env`, dann `docker compose up -d app`
