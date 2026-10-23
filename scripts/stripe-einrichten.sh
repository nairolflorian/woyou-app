#!/usr/bin/env bash
# WoYou · Stripe-Schlüssel auf dem Server hinterlegen (läuft AUF dem Server, im Repo-Ordner).
#
#   bash scripts/stripe-einrichten.sh
#
# Fragt die Schlüssel verdeckt ab (nichts erscheint auf dem Bildschirm oder in der Shell-Historie),
# trägt sie in .env ein (Rechte 600) und startet die App neu. Die Schlüssel finden Sie im
# Stripe-Dashboard unter Entwickler > API-Schlüssel, das Webhook-Geheimnis unter Entwickler > Webhooks.
set -euo pipefail
cd "$(dirname "$0")/.."
ENV=.env
[ -f "$ENV" ] || { echo "Keine .env gefunden in $(pwd)."; exit 1; }

URL="${WOYOU_URL:-https://woyou-app.46.225.109.84.nip.io}"
echo
echo "WoYou · Stripe einrichten"
echo "1. Im Stripe-Dashboard unter Entwickler > Webhooks einen Endpunkt anlegen:"
echo "     $URL/api/webhooks/stripe"
echo "   Ereignisse: checkout.session.completed, invoice.paid, customer.subscription.deleted"
echo "2. Danach hier die Schlüssel eingeben (Eingabe bleibt unsichtbar)."
echo

frage() { # name präfix-regex
  local wert
  read -rsp "$1: " wert; echo >&2
  [[ "$wert" =~ $2 ]] || { echo "Das sieht nicht nach einem gültigen Wert aus (erwartet: $3)." >&2; exit 1; }
  printf '%s' "$wert"
}
SK=$(frage "Geheimer Schlüssel (sk_live_… oder sk_test_…)" '^(sk|rk)_(live|test)_[A-Za-z0-9]+$' "sk_live_…")
PK=$(frage "Veröffentlichbarer Schlüssel (pk_live_… oder pk_test_…)" '^pk_(live|test)_[A-Za-z0-9]+$' "pk_live_…")
WH=$(frage "Webhook-Signaturgeheimnis (whsec_…)" '^whsec_[A-Za-z0-9]+$' "whsec_…")

modus_sk=${SK#*_}; modus_sk=${modus_sk%%_*}; modus_pk=${PK#pk_}; modus_pk=${modus_pk%%_*}
[ "$modus_sk" = "$modus_pk" ] || { echo "Geheimer und veröffentlichbarer Schlüssel gehören nicht zum selben Modus (live/test)."; exit 1; }

cp -p "$ENV" "$ENV.vor-stripe"; chmod 600 "$ENV.vor-stripe"
setze() { # name wert
  local tmp; tmp=$(mktemp)
  grep -v "^$1=" "$ENV" > "$tmp" || true
  printf '%s=%s\n' "$1" "$2" >> "$tmp"
  cat "$tmp" > "$ENV"; rm -f "$tmp"
}
setze STRIPE_SECRET_KEY "$SK"
setze STRIPE_PUBLISHABLE_KEY "$PK"
setze STRIPE_WEBHOOK_SECRET "$WH"
chmod 600 "$ENV"
unset SK PK WH

docker compose up -d app >/dev/null
echo
echo "Gespeichert (Modus: $modus_sk) und App neu gestartet. Vorherige .env liegt in $ENV.vor-stripe."
echo "Hinweis: Solange DEMO_MODE=true ist, bleibt die Seite eine Testumgebung."
