#!/usr/bin/env bash
# WoYou · Super-Admin für die PRODUKTION (woyou.de) anlegen (läuft AUF dem Server, im Repo-Ordner).
#
#   bash scripts/admin-anlegen.sh                    # neuen Super-Admin anlegen
#   bash scripts/admin-anlegen.sh --neues-passwort   # bestehendem Admin/Team-Konto ein neues Passwort geben
#
# Fragt E-Mail und Name ab und das Passwort VERDECKT (zweimal). Das Passwort geht nur über stdin in den
# Prod-Werkzeugcontainer (scripts/admin-anlegen.ts), nie als Argument, Umgebungsvariable, Datei oder Log.
# Voraussetzung: bash scripts/prod-einrichten.sh ist gelaufen (.env.prod, Container woyou_postgres_prod).
set -euo pipefail
cd "$(dirname "$0")/.."
OPT=${1:-}
case "$OPT" in ""|--neues-passwort) ;; *) echo "Aufruf: bash scripts/admin-anlegen.sh [--neues-passwort]"; exit 2 ;; esac
[ -f .env.prod ] || { echo "Keine .env.prod. Zuerst: bash scripts/prod-einrichten.sh"; exit 1; }
grep -q '^DEMO_MODE=false$' .env.prod || { echo ".env.prod hat nicht DEMO_MODE=false. Abbruch."; exit 1; }
dc() { docker compose -p woyou-prod -f docker-compose.prod.yml --env-file .env.prod "$@"; }

echo "WoYou Produktion · $([ -n "$OPT" ] && echo "neues Passwort für ein Admin-Konto" || echo "Super-Admin anlegen")"
read -rp "E-Mail-Adresse: " EMAIL
NAME=""
[ -n "$OPT" ] || read -rp "Name (für das Protokoll): " NAME
read -rsp "Passwort (mindestens 12 Zeichen, bleibt unsichtbar): " PW1; echo
read -rsp "Passwort wiederholen: " PW2; echo
[ "$PW1" = "$PW2" ] || { unset PW1 PW2; echo "Die Passwörter sind nicht gleich. Nichts geändert."; exit 1; }
[ ${#PW1} -ge 12 ] || { unset PW1 PW2; echo "Das Passwort ist kürzer als 12 Zeichen. Nichts geändert."; exit 1; }
case "$EMAIL$NAME" in *$'\n'*) echo "Ungültige Eingabe."; exit 1;; esac

# Werkzeug-Image bauen, falls es fehlt (enthält scripts/ und Prisma)
docker image inspect woyou-tools-prod:latest >/dev/null 2>&1 || dc --profile tools build migrate >/dev/null
if printf '%s\n%s\n%s\n' "$EMAIL" "$NAME" "$PW1" | dc --profile tools run --rm -T migrate npx tsx scripts/admin-anlegen.ts $OPT; then RC=0; else RC=$?; fi
unset PW1 PW2
exit $RC
