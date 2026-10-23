#!/usr/bin/env bash
# WoYou · Produktion auf https://woyou.de einrichten bzw. aktualisieren (läuft AUF dem Server, im Repo-Ordner).
#
#   cd /var/www/woyou-app/repo && git pull --ff-only && bash scripts/prod-einrichten.sh
#
# Idempotent: kann nach jedem git pull erneut laufen (baut und startet dann nur den Prod-Container neu).
# Schritte:
#   1. .env.prod anlegen, falls sie fehlt (Rechte 600, Passwörter zufällig erzeugt, DEMO_MODE=false)
#   2. Sicherungen: alte statische Seite (tar), nginx-Configs, pg_dump der Staging-Datenbank
#   3. Prod-Datenbank (eigener Container woyou_postgres_prod) starten, Datenbank anlegen, falls sie fehlt
#   4. NUR "prisma migrate deploy" gegen die Prod-Datenbank (nie db-init, nie Seed)
#   5. Prod-App (woyou_app_prod, 127.0.0.1:3051) bauen und starten, Rauchtest direkt am Container
#   6. nginx für woyou.de/www.woyou.de auf den Prod-Container umstellen (nginx -t vor reload, sonst zurück)
#   7. Rauchtest über https://woyou.de, Staging-Prüfung, tägliche Sicherung und Zeitplan für Prod
#
# Staging (woyou_app, woyou_postgres, .env, woyou-app.conf) wird NICHT verändert, nur gesichert.
# Ausgabe ohne Geheimnisse. Rückweg: siehe docs/PRODUKTION.md (wird am Ende auch ausgegeben).
#
# Optionen:
#   --ohne-nginx   alles außer der nginx-Umstellung (z. B. erst am Container prüfen)
#   --nur-pruefen  nur die Rauchtests ausführen
set -euo pipefail
cd "$(dirname "$0")/.."
REPO=$(pwd)

# Pfade (für den Trockenlauf in einer Attrappe überschreibbar)
NGINX_AVAIL=${NGINX_AVAIL:-/etc/nginx/sites-available}
NGINX_ENABLED=${NGINX_ENABLED:-/etc/nginx/sites-enabled}
ALT_SEITE=${ALT_SEITE:-/var/www/woyou-preview}
SICHERUNG=${SICHERUNG:-/var/backups/woyou}
LE_LIVE=${LE_LIVE:-/etc/letsencrypt/live/woyou.de}
CRON_DAILY=${CRON_DAILY:-/etc/cron.daily}
CRON_D=${CRON_D:-/etc/cron.d}
DOMAIN=${DOMAIN:-woyou.de}
STAGING_URL=${STAGING_URL:-https://woyou-app.46.225.109.84.nip.io}
PROD_PORT=${PROD_PORT:-3051}   # muss zu docker-compose.prod.yml passen (nur für Tests überschreiben)
PROD_SICHERUNG=${PROD_SICHERUNG:-/var/backups/woyou-prod}
ENVP=.env.prod
NEU_CONF=woyou-de-app.conf
ALT_CONF=woyou-preview.conf

OHNE_NGINX=0; NUR_PRUEFEN=0
for a in "$@"; do
  case "$a" in
    --ohne-nginx) OHNE_NGINX=1 ;;
    --nur-pruefen) NUR_PRUEFEN=1 ;;
    *) echo "Unbekannte Option: $a"; exit 2 ;;
  esac
done

dc() { docker compose -p woyou-prod -f docker-compose.prod.yml --env-file "$ENVP" "$@"; }
schritt() { echo; echo "== $*"; }
ok() { echo "   ok   $*"; }
fehler() { echo "   FEHLER $*" >&2; }
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
FEHLER=0

# HTTP-Status (ohne Weiterleitungen zu folgen). $1 = URL, Rest = zusätzliche curl-Optionen
status() { local u=$1; shift; curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$@" "$u" || true; }
pruefe() { # Beschreibung erwartet(regex) url [curl-optionen]
  local was=$1 soll=$2 url=$3; shift 3
  local ist; ist=$(status "$url" "$@")
  if [[ "$ist" =~ ^($soll)$ ]]; then ok "$was ($ist)"; else fehler "$was: erwartet $soll, bekommen $ist"; FEHLER=1; fi
}

rauchtest_container() {
  schritt "Rauchtest direkt am Prod-Container (127.0.0.1:$PROD_PORT)"
  local b="http://127.0.0.1:$PROD_PORT" h=(-H "Host: $DOMAIN" -H "X-Forwarded-Proto: https")
  pruefe "Gesundheit /api/health" 200 "$b/api/health"
  pruefe "Startseite" 200 "$b/" "${h[@]}"
  pruefe "/demo gibt es in Produktion nicht" 404 "$b/demo" "${h[@]}"
  pruefe "Demo-Login gesperrt" 404 "$b/api/auth/demo-login?email=fatima@example.com" "${h[@]}"
  pruefe "/arbeitgeber.html leitet weiter" 301 "$b/arbeitgeber.html" "${h[@]}"
  pruefe "/index.html leitet weiter" 301 "$b/index.html" "${h[@]}"
  pruefe "Impressum" 200 "$b/impressum" "${h[@]}"
  # Webhook erreichbar: 400 (Signatur fehlt) mit Schlüsseln, 503 ohne passende Schlüssel; 404/502 wäre falsch
  pruefe "Stripe-Webhook-Route erreichbar" "400|503" "$b/api/webhooks/stripe" -X POST "${h[@]}" -H "Content-Type: application/json" --data '{}'
  local seite; seite=$(curl -s --max-time 15 "${h[@]}" "$b/" || true)
  if [[ "$seite" == *'data-umgebung="staging"'* ]]; then fehler "Staging-Leiste ist in Produktion sichtbar"; FEHLER=1; else ok "keine Staging-Leiste"; fi
}

rauchtest_oeffentlich() {
  schritt "Rauchtest über https://$DOMAIN"
  pruefe "https://$DOMAIN/" 200 "https://$DOMAIN/"
  pruefe "https://www.$DOMAIN/ leitet auf $DOMAIN" 301 "https://www.$DOMAIN/"
  local ziel; ziel=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 15 "https://www.$DOMAIN/arbeitgeber.html" || true)
  [ "$ziel" = "https://$DOMAIN/arbeitgeber.html" ] && ok "www behält den Pfad" || { fehler "www-Weiterleitung zeigt auf: $ziel"; FEHLER=1; }
  pruefe "http://$DOMAIN/ leitet auf https" 301 "http://$DOMAIN/"
  pruefe "/demo in Produktion" 404 "https://$DOMAIN/demo"
  pruefe "/arbeitgeber.html" 301 "https://$DOMAIN/arbeitgeber.html"
  pruefe "/bewerber.html" 301 "https://$DOMAIN/bewerber.html"
  pruefe "/leistungen.html" 301 "https://$DOMAIN/leistungen.html"
  pruefe "Stripe-Webhook https://$DOMAIN/api/webhooks/stripe" "400|503" "https://$DOMAIN/api/webhooks/stripe" -X POST -H "Content-Type: application/json" --data '{}'
  schritt "Staging unverändert"
  pruefe "Staging Startseite" 200 "$STAGING_URL/"
  pruefe "Staging /demo" 200 "$STAGING_URL/demo"
}

if [ "$NUR_PRUEFEN" = 1 ]; then
  rauchtest_container
  [ "$OHNE_NGINX" = 1 ] || rauchtest_oeffentlich
  [ "$FEHLER" = 0 ] && echo && echo "Alle Prüfungen bestanden." || { echo; echo "Es gibt Fehler (siehe oben)."; exit 1; }
  exit 0
fi

# ---------------------------------------------------------------------------------------------------------------
schritt "Vorprüfung"
command -v docker >/dev/null || { fehler "docker fehlt"; exit 1; }
command -v openssl >/dev/null || { fehler "openssl fehlt"; exit 1; }
[ -f docker-compose.prod.yml ] || { fehler "docker-compose.prod.yml fehlt (git pull vergessen?)"; exit 1; }
[ -f "$LE_LIVE/fullchain.pem" ] || { fehler "Zertifikat $LE_LIVE fehlt"; exit 1; }
if openssl x509 -in "$LE_LIVE/fullchain.pem" -noout -text 2>/dev/null | grep -q "DNS:www.$DOMAIN"; then ok "Zertifikat deckt $DOMAIN und www.$DOMAIN ab"
else fehler "Zertifikat enthält www.$DOMAIN nicht. Erst: certbot certonly --nginx -d $DOMAIN -d www.$DOMAIN --cert-name $DOMAIN"; exit 1; fi
if ss -ltn 2>/dev/null | awk '{print $4}' | grep -q ":$PROD_PORT\$" && ! docker ps --format '{{.Names}}' | grep -qx woyou_app_prod; then
  fehler "Port $PROD_PORT ist schon von einem anderen Dienst belegt"; exit 1
fi
ok "Port $PROD_PORT frei oder schon von woyou_app_prod belegt"
git rev-parse HEAD > "$REPO/.prod-stand-$STAMP" 2>/dev/null && ok "Code-Stand $(git rev-parse --short HEAD)" || true

# ---------------------------------------------------------------------------------------------------------------
schritt "1. $ENVP"
umask 077
setze() { # name wert (ersetzt oder ergänzt, ohne Ausgabe)
  local tmp; tmp=$(mktemp)
  grep -v "^$1=" "$ENVP" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$ENVP"; rm -f "$tmp"
}
hat() { grep -q "^$1=." "$ENVP"; }
if [ ! -f "$ENVP" ]; then
  PGPW=$(openssl rand -hex 24)
  {
    echo "# WoYou PRODUKTION (woyou.de). Angelegt von scripts/prod-einrichten.sh am $STAMP. Nie ins Repo, nie anzeigen."
    echo "POSTGRES_USER=woyou"
    echo "POSTGRES_DB=woyou"
    echo "POSTGRES_PASSWORD=$PGPW"
    echo "DATABASE_URL=postgresql://woyou:$PGPW@postgres:5432/woyou?schema=public"
    echo "SESSION_PASSWORD=$(openssl rand -hex 32)"
    echo "CRON_SECRET=$(openssl rand -hex 32)"
    echo "DEMO_MODE=false"
    echo "NEXT_PUBLIC_BASE_URL=https://$DOMAIN"
    echo "MAIL_FROM=WoYou <no-reply@$DOMAIN>"
    echo "# Stripe (nur Live-Schlüssel): bash scripts/stripe-einrichten.sh prod   bzw.   ... prod --verschieben"
    echo "STRIPE_SECRET_KEY="
    echo "STRIPE_PUBLISHABLE_KEY="
    echo "STRIPE_WEBHOOK_SECRET="
    echo "# EuBiA-CRM: aus, bis Datenschutzerklärung und Vereinbarung stehen (bash deploy/crm-einrichten.sh)"
    echo "EUBIA_CRM_SYNC=off"
    echo "# SMTP kommt später (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS). Ohne SMTP läuft alles, Mails werden nur protokolliert."
  } > "$ENVP"
  unset PGPW
  ok "$ENVP neu angelegt (Passwörter zufällig erzeugt, nicht angezeigt)"
else
  ok "$ENVP vorhanden, wird weiterverwendet"
fi
chmod 600 "$ENVP"
# Pflichtwerte für die Produktion immer sicherstellen
grep -q '^DEMO_MODE=false$' "$ENVP" || { setze DEMO_MODE false; ok "DEMO_MODE=false gesetzt"; }
hat NEXT_PUBLIC_BASE_URL || setze NEXT_PUBLIC_BASE_URL "https://$DOMAIN"
for k in POSTGRES_PASSWORD DATABASE_URL SESSION_PASSWORD; do hat "$k" || { fehler "$k fehlt in $ENVP"; exit 1; }; done
grep -q '^DATABASE_URL=postgresql://[^@]*@postgres:5432/' "$ENVP" || { fehler "DATABASE_URL in $ENVP muss auf den Prod-Container (Host postgres) zeigen"; exit 1; }
if grep -q '^STRIPE_SECRET_KEY=sk_test_\|^STRIPE_SECRET_KEY=rk_test_' "$ENVP"; then fehler "In $ENVP steht ein Stripe-TEST-Schlüssel. Produktion nimmt nur Live-Schlüssel, er wird ignoriert."; fi
ok "Pflichtwerte geprüft (DEMO_MODE=false, Datenbank im Prod-Container)"

# ---------------------------------------------------------------------------------------------------------------
schritt "2. Sicherungen nach $SICHERUNG/prod-einrichten-$STAMP"
ZIEL="$SICHERUNG/prod-einrichten-$STAMP"
mkdir -p "$ZIEL"; chmod 700 "$SICHERUNG" "$ZIEL"
if [ -d "$ALT_SEITE" ]; then
  tar -czf "$ZIEL/woyou-preview-seite.tar.gz" -C "$(dirname "$ALT_SEITE")" "$(basename "$ALT_SEITE")"
  ok "alte Seite gesichert ($(du -h "$ZIEL/woyou-preview-seite.tar.gz" | cut -f1))"
fi
for f in "$NGINX_ENABLED/$ALT_CONF" "$NGINX_AVAIL/$ALT_CONF" "$NGINX_ENABLED/woyou-app.conf" "$NGINX_ENABLED/woyou-ip-preview.conf" "$NGINX_AVAIL/$NEU_CONF"; do
  [ -e "$f" ] || continue
  cp -pL "$f" "$ZIEL/$(basename "$(dirname "$f")")__$(basename "$f")"
done
ok "nginx-Configs gesichert"
if docker ps --format '{{.Names}}' | grep -qx woyou_postgres; then
  docker exec woyou_postgres pg_dump -U woyou -d woyou --no-owner --no-privileges | gzip -9 > "$ZIEL/staging-woyou.sql.gz"
  [ -s "$ZIEL/staging-woyou.sql.gz" ] || { fehler "Staging-Sicherung ist leer"; exit 1; }
  ok "Staging-Datenbank gesichert ($(du -h "$ZIEL/staging-woyou.sql.gz" | cut -f1))"
fi
if docker ps --format '{{.Names}}' | grep -qx woyou_postgres_prod; then
  docker exec woyou_postgres_prod sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' | gzip -9 > "$ZIEL/prod-woyou.sql.gz"
  ok "Prod-Datenbank vor dem Update gesichert ($(du -h "$ZIEL/prod-woyou.sql.gz" | cut -f1))"
fi
chmod 600 "$ZIEL"/* 2>/dev/null || true

# ---------------------------------------------------------------------------------------------------------------
schritt "3. Prod-Datenbank"
dc up -d postgres >/dev/null
for i in $(seq 1 30); do
  [ "$(docker inspect -f '{{.State.Health.Status}}' woyou_postgres_prod 2>/dev/null)" = healthy ] && break
  sleep 2
done
[ "$(docker inspect -f '{{.State.Health.Status}}' woyou_postgres_prod 2>/dev/null)" = healthy ] || { fehler "woyou_postgres_prod startet nicht"; exit 1; }
if docker exec woyou_postgres_prod sh -c 'psql -U "$POSTGRES_USER" -d postgres -Atc "select 1 from pg_database where datname = '"'"'$POSTGRES_DB'"'"'"' | grep -q 1; then
  ok "Datenbank vorhanden"
else
  docker exec woyou_postgres_prod sh -c 'createdb -U "$POSTGRES_USER" "$POSTGRES_DB"'
  ok "Datenbank angelegt"
fi

# ---------------------------------------------------------------------------------------------------------------
schritt "4. Migrationen (nur prisma migrate deploy, gegen die Prod-Datenbank)"
dc --profile tools build migrate >/dev/null
if ! MIG=$(dc --profile tools run --rm -T migrate 2>&1); then
  fehler "Migration fehlgeschlagen"; printf '%s\n' "$MIG" | tail -20 | sed 's/^/   /' >&2; exit 1
fi
printf '%s\n' "$MIG" | grep -E 'migrations? found|No pending|applied|Applying' | sed 's/^/   /' || true
unset MIG
ok "Migrationen eingespielt"

# ---------------------------------------------------------------------------------------------------------------
schritt "5. Prod-App bauen und starten (woyou_app_prod)"
dc build app >/dev/null
dc up -d app >/dev/null
for i in $(seq 1 45); do
  [ "$(status "http://127.0.0.1:$PROD_PORT/api/health")" = 200 ] && break
  sleep 2
done
rauchtest_container
[ "$FEHLER" = 0 ] || { echo; echo "Prod-Container antwortet nicht wie erwartet. nginx wird NICHT umgestellt."; echo "Logs: docker logs --tail 80 woyou_app_prod"; exit 1; }

# ---------------------------------------------------------------------------------------------------------------
if [ "$OHNE_NGINX" = 0 ]; then
  schritt "6. nginx: $DOMAIN auf den Prod-Container"
  cp deploy/nginx/woyou.de.conf "$NGINX_AVAIL/$NEU_CONF.neu"
  if [ -e "$NGINX_AVAIL/$NEU_CONF" ] && cmp -s "$NGINX_AVAIL/$NEU_CONF.neu" "$NGINX_AVAIL/$NEU_CONF" && [ -L "$NGINX_ENABLED/$NEU_CONF" ] && [ ! -e "$NGINX_ENABLED/$ALT_CONF" ]; then
    rm -f "$NGINX_AVAIL/$NEU_CONF.neu"
    ok "schon umgestellt, nichts zu tun"
  else
    ALT_INHALT_DA=0
    [ -e "$NGINX_AVAIL/$NEU_CONF" ] && cp -p "$NGINX_AVAIL/$NEU_CONF" "$ZIEL/vorher__$NEU_CONF"
    mv "$NGINX_AVAIL/$NEU_CONF.neu" "$NGINX_AVAIL/$NEU_CONF"
    chmod 644 "$NGINX_AVAIL/$NEU_CONF"
    # Alte Seite aus sites-enabled nehmen (bleibt als Datei in der Sicherung und in sites-available)
    if [ -e "$NGINX_ENABLED/$ALT_CONF" ]; then
      # feste Kopie für den Rückweg (sites-enabled/woyou-preview.conf ist auf dem Server eine eigene Datei, von Certbot ergänzt)
      [ -e "$NGINX_AVAIL/$ALT_CONF.vor-prod" ] || cp -pL "$NGINX_ENABLED/$ALT_CONF" "$NGINX_AVAIL/$ALT_CONF.vor-prod"
      mv "$NGINX_ENABLED/$ALT_CONF" "$ZIEL/aus-sites-enabled__$ALT_CONF"
      ALT_INHALT_DA=1
    fi
    ln -sfn "$NGINX_AVAIL/$NEU_CONF" "$NGINX_ENABLED/$NEU_CONF"
    if nginx -t >/dev/null 2>&1; then
      systemctl reload nginx
      ok "nginx geprüft und neu geladen"
    else
      fehler "nginx -t schlägt fehl, stelle die alte Config wieder her"
      nginx -t 2>&1 | tail -5 | sed 's/^/   /' >&2 || true
      rm -f "$NGINX_ENABLED/$NEU_CONF"
      [ "$ALT_INHALT_DA" = 1 ] && mv "$ZIEL/aus-sites-enabled__$ALT_CONF" "$NGINX_ENABLED/$ALT_CONF"
      if nginx -t >/dev/null 2>&1; then systemctl reload nginx; echo "   alte Config wieder aktiv"; else echo "   ACHTUNG: auch die alte Config besteht nginx -t nicht, bitte sofort prüfen" >&2; fi
      exit 1
    fi
  fi
fi

# ---------------------------------------------------------------------------------------------------------------
schritt "7. Tägliche Sicherung und Zeitplan für Produktion"
mkdir -p "$PROD_SICHERUNG" && chmod 700 "$PROD_SICHERUNG"
cat > "$CRON_DAILY/woyou-prod-backup" <<CRON
#!/usr/bin/env bash
# WoYou Produktion: tägliches pg_dump plus Upload-Volume, 14 Tage (angelegt von scripts/prod-einrichten.sh)
CONTAINER=woyou_postgres_prod DBUSER=woyou DBNAME=woyou DEST=$PROD_SICHERUNG PREFIX=woyou-prod KEEP=14 VOLUME=woyou_prod_uploads \\
  bash $REPO/scripts/server/backup-postgres.sh
# Sicherungen vor Updates (prod-einrichten-*) nach 14 Tagen löschen, alte statische Seite bleibt
SICHERUNG=$SICHERUNG TAGE=14 bash $REPO/scripts/server/sicherungen-aufraeumen.sh
CRON
chmod 755 "$CRON_DAILY/woyou-prod-backup"
ok "$CRON_DAILY/woyou-prod-backup (Datenbank + Uploads, 14 Tage; Update-Sicherungen nach 14 Tagen weg)"
# Erinnerungen und Aufräumen (Marketing-Mails erst, wenn SMTP eingerichtet ist)
cat > "$CRON_D/woyou-prod" <<CRON
# WoYou Produktion (angelegt von scripts/prod-einrichten.sh). Liest CRON_SECRET aus $REPO/$ENVP.
SHELL=/bin/bash
0 9 * * * root S=\$(grep '^CRON_SECRET=' $REPO/$ENVP | cut -d= -f2); curl -fsS -X POST -H "Authorization: Bearer \$S" http://127.0.0.1:$PROD_PORT/api/cron/reminders >/dev/null
30 3 * * * root S=\$(grep '^CRON_SECRET=' $REPO/$ENVP | cut -d= -f2); curl -fsS -X POST -H "Authorization: Bearer \$S" http://127.0.0.1:$PROD_PORT/api/cron/purge >/dev/null
CRON
chmod 644 "$CRON_D/woyou-prod"
ok "$CRON_D/woyou-prod (Erinnerungen 9:00, Aufräumen 3:30)"

docker builder prune -f >/dev/null 2>&1 || true
docker image prune -f >/dev/null 2>&1 || true

[ "$OHNE_NGINX" = 1 ] || rauchtest_oeffentlich

echo
if [ "$FEHLER" = 0 ]; then echo "Fertig: https://$DOMAIN läuft auf woyou_app_prod. Alle Prüfungen bestanden."
else echo "Fertig, aber mit Fehlern in den Prüfungen (siehe oben)."; fi
cat <<HINWEIS

Sicherungen: $ZIEL
Nächste Schritte:
  bash scripts/stripe-einrichten.sh prod --verschieben   # Live-Schlüssel aus Staging übernehmen (ohne Anzeige)
  bash scripts/admin-anlegen.sh                          # ersten Super-Admin für woyou.de anlegen
Rückweg (woyou.de wieder auf die alte Seite):
  rm $NGINX_ENABLED/$NEU_CONF && cp -p $NGINX_AVAIL/$ALT_CONF.vor-prod $NGINX_ENABLED/$ALT_CONF && nginx -t && systemctl reload nginx
  (Prod-Container stoppen: docker compose -p woyou-prod -f docker-compose.prod.yml --env-file $ENVP stop app)
HINWEIS
[ "$FEHLER" = 0 ]
