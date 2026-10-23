#!/usr/bin/env bash
# WoYou · Stripe-Schlüssel auf dem Server hinterlegen (läuft AUF dem Server, im Repo-Ordner).
#
#   bash scripts/stripe-einrichten.sh staging               # Testmodus-Schlüssel (sk_test_/pk_test_) für Staging (.env)
#   bash scripts/stripe-einrichten.sh prod                  # Live-Schlüssel (sk_live_/pk_live_) für woyou.de (.env.prod)
#   bash scripts/stripe-einrichten.sh prod --verschieben    # Live-Schlüssel aus der Staging-.env nach .env.prod
#                                                           # übernehmen (ohne Anzeige), danach in Staging leeren
#
# Staging akzeptiert nur *_test_, Produktion nur *_live_ (wie die App selbst, src/lib/stripe-mode.ts).
# Eingaben bleiben unsichtbar, nichts landet auf dem Bildschirm oder in der Shell-Historie. Env-Dateien bekommen
# Rechte 600, vorher wird eine Sicherung angelegt. Danach startet der jeweilige App-Container neu.
# Die Schlüssel stehen im Stripe-Dashboard unter Entwickler > API-Schlüssel, das Webhook-Geheimnis unter
# Entwickler > Webhooks (im Testmodus und im Live-Modus jeweils eigene Endpunkte und eigene Geheimnisse).
set -euo pipefail
cd "$(dirname "$0")/.."
umask 077

ZIEL=${1:-}
OPT=${2:-}
case "$ZIEL" in
  staging) ENV=.env; MODUS=test; URL="${WOYOU_STAGING_URL:-https://woyou-app.46.225.109.84.nip.io}"
           neustart() { docker compose up -d --force-recreate app >/dev/null; } ;;
  prod)    ENV=.env.prod; MODUS=live; URL="${WOYOU_PROD_URL:-https://woyou.de}"
           neustart() { docker compose -p woyou-prod -f docker-compose.prod.yml --env-file .env.prod up -d --force-recreate app >/dev/null; } ;;
  *) echo "Aufruf: bash scripts/stripe-einrichten.sh staging|prod [--verschieben]"; exit 2 ;;
esac
case "$OPT" in ""|--verschieben) ;; *) echo "Unbekannte Option: $OPT"; exit 2 ;; esac
[ "$OPT" = --verschieben ] && [ "$ZIEL" != prod ] && { echo "--verschieben gibt es nur für prod (Staging -> Produktion)."; exit 2; }
if [ ! -f "$ENV" ]; then
  echo "Keine $ENV gefunden in $(pwd)."
  [ "$ZIEL" = prod ] && echo "Für prod zuerst: bash scripts/prod-einrichten.sh"
  exit 1
fi
STAMP=$(date -u +%Y%m%dT%H%M%SZ)

setze() { # datei name wert (ersetzt oder ergänzt, ohne Ausgabe)
  local tmp; tmp=$(mktemp)
  grep -v "^$2=" "$1" > "$tmp" || true
  printf '%s=%s\n' "$2" "$3" >> "$tmp"
  cat "$tmp" > "$1"; rm -f "$tmp"; chmod 600 "$1"
}
lies() { grep "^$2=" "$1" | tail -1 | cut -d= -f2- || true; } # datei name (Wert nur in Variable, nie ausgeben)
sichere() { cp -p "$1" "$1.vor-stripe-$STAMP"; chmod 600 "$1.vor-stripe-$STAMP"; }
pruefe_sk() { [[ "$1" =~ ^(sk|rk)_${MODUS}_[A-Za-z0-9]+$ ]]; }
pruefe_pk() { [[ "$1" =~ ^pk_${MODUS}_[A-Za-z0-9]+$ ]]; }
pruefe_wh() { [[ "$1" =~ ^whsec_[A-Za-z0-9]+$ ]]; }
frage() { # text -> wert (verdeckt)
  local wert; read -rsp "$1: " wert; echo >&2; printf '%s' "$wert"
}

echo
echo "WoYou · Stripe einrichten für $ZIEL (nur ${MODUS}-Schlüssel, Datei $ENV)"
echo "Webhook-Endpunkt im Stripe-Dashboard ($([ "$MODUS" = live ] && echo Live-Modus || echo Testmodus)):"
echo "     $URL/api/webhooks/stripe"
echo "   Ereignis: checkout.session.completed (nur Startpaket)"
echo

if [ "$OPT" = --verschieben ]; then
  [ -f .env ] || { echo "Keine Staging-.env gefunden."; exit 1; }
  SK=$(lies .env STRIPE_SECRET_KEY); PK=$(lies .env STRIPE_PUBLISHABLE_KEY); WH_ALT=$(lies .env STRIPE_WEBHOOK_SECRET)
  pruefe_sk "$SK" || { echo "In der Staging-.env steht kein Live-Geheimschlüssel (sk_live_/rk_live_). Nichts geändert."; exit 1; }
  pruefe_pk "$PK" || { echo "In der Staging-.env steht kein passender veröffentlichbarer Live-Schlüssel (pk_live_). Nichts geändert."; exit 1; }
  echo "Live-Schlüssel in Staging gefunden (Werte werden nicht angezeigt)."
  echo "Das Webhook-Geheimnis gehört zu genau einem Endpunkt. Für woyou.de brauchst du im Live-Modus einen Endpunkt"
  echo "mit der Adresse oben. Gib sein Geheimnis ein. Nur Enter übernimmt das bisherige aus Staging (geht nur, wenn"
  echo "der Endpunkt dort schon auf $URL/api/webhooks/stripe zeigt)."
  WH=$(frage "Webhook-Signaturgeheimnis für $URL (whsec_…, Enter = aus Staging übernehmen)")
  if [ -z "$WH" ]; then
    pruefe_wh "$WH_ALT" || { echo "In Staging steht kein gültiges Webhook-Geheimnis. Nichts geändert."; exit 1; }
    WH=$WH_ALT; echo "Webhook-Geheimnis aus Staging übernommen."
  fi
  pruefe_wh "$WH" || { echo "Das sieht nicht nach einem Webhook-Geheimnis aus (whsec_…). Nichts geändert."; exit 1; }
  sichere .env.prod; sichere .env
  setze .env.prod STRIPE_SECRET_KEY "$SK"
  setze .env.prod STRIPE_PUBLISHABLE_KEY "$PK"
  setze .env.prod STRIPE_WEBHOOK_SECRET "$WH"
  # Staging: Live-Werte leeren (Staging nimmt sowieso nur Test-Schlüssel)
  setze .env STRIPE_SECRET_KEY ""
  setze .env STRIPE_PUBLISHABLE_KEY ""
  setze .env STRIPE_WEBHOOK_SECRET ""
  unset SK PK WH WH_ALT
  neustart
  docker compose up -d --force-recreate app >/dev/null
  echo
  echo "Live-Schlüssel nach .env.prod übernommen, in Staging geleert. Beide Apps neu gestartet."
  echo "Sicherungen: .env.prod.vor-stripe-$STAMP und .env.vor-stripe-$STAMP (Rechte 600; nach erfolgreichem Test löschen)."
  echo "Staging-Zahlungen: mit Testmodus-Schlüsseln einrichten: bash scripts/stripe-einrichten.sh staging"
  ALT=$(ls -1 .env.vor-stripe* 2>/dev/null | tr '\n' ' ' || true)
  [ -n "$ALT" ] && echo "Achtung: Diese älteren Sicherungen der Staging-.env enthalten noch Live-Schlüssel: $ALT" \
    && echo "Nach erfolgreichem Test löschen: shred -u $ALT"
  exit 0
fi

echo "Jetzt die Schlüssel eingeben (Eingabe bleibt unsichtbar)."
SK=$(frage "Geheimer Schlüssel (sk_${MODUS}_… oder rk_${MODUS}_…)")
pruefe_sk "$SK" || { echo "Das ist kein ${MODUS}-Geheimschlüssel. $ZIEL nimmt nur sk_${MODUS}_/rk_${MODUS}_. Nichts geändert."; exit 1; }
PK=$(frage "Veröffentlichbarer Schlüssel (pk_${MODUS}_…)")
pruefe_pk "$PK" || { echo "Das ist kein pk_${MODUS}_-Schlüssel. Nichts geändert."; exit 1; }
WH=$(frage "Webhook-Signaturgeheimnis (whsec_…)")
pruefe_wh "$WH" || { echo "Das sieht nicht nach einem Webhook-Geheimnis aus (whsec_…). Nichts geändert."; exit 1; }

sichere "$ENV"
setze "$ENV" STRIPE_SECRET_KEY "$SK"
setze "$ENV" STRIPE_PUBLISHABLE_KEY "$PK"
setze "$ENV" STRIPE_WEBHOOK_SECRET "$WH"
unset SK PK WH
neustart
echo
echo "Gespeichert (Modus: $MODUS) in $ENV und App ($ZIEL) neu gestartet. Sicherung: $ENV.vor-stripe-$STAMP"
[ "$ZIEL" = staging ] && echo "Staging: Test-Checkout mit Karte 4242 4242 4242 4242, beliebiges Datum in der Zukunft, beliebige Prüfziffer."
exit 0
