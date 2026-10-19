#!/usr/bin/env bash
# KI für Anschreiben und Stellenbewertung einschalten (einmalig auf dem Server ausführen):
#   bash deploy/ki-einrichten.sh
# Fragt Anbieter und API-Schlüssel ab (Eingabe unsichtbar), prüft den Schlüssel, trägt ihn in .env ein
# und startet die App neu. Der Schlüssel erscheint nirgends im Klartext auf dem Bildschirm oder im Verlauf.
set -euo pipefail
cd "$(dirname "$0")/.."
ENV=.env

read -rp "Anbieter [mistral/anthropic] (Enter = mistral): " PROVIDER
PROVIDER=${PROVIDER:-mistral}
case "$PROVIDER" in mistral|anthropic) ;; *) echo "Unbekannter Anbieter."; exit 1;; esac
read -rsp "API-Schlüssel (wird nicht angezeigt): " KEY; echo
[ -n "$KEY" ] || { echo "Kein Schlüssel eingegeben."; exit 1; }

echo "Prüfe Schlüssel …"
if [ "$PROVIDER" = mistral ]; then
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $KEY" https://api.mistral.ai/v1/models)
else
  CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "x-api-key: $KEY" -H "anthropic-version: 2023-06-01" https://api.anthropic.com/v1/models)
fi
[ "$CODE" = 200 ] || { echo "Schlüssel abgelehnt (HTTP $CODE). Nichts geändert."; exit 1; }

cp "$ENV" "$ENV.vor-ki-$(date +%Y%m%d-%H%M)"
sed -i '/^AI_PROVIDER=/d;/^AI_API_KEY=/d' "$ENV"
printf 'AI_PROVIDER=%s\nAI_API_KEY=%s\n' "$PROVIDER" "$KEY" >> "$ENV"
unset KEY
docker compose up -d app >/dev/null
echo "Fertig: KI ($PROVIDER) ist aktiv. Im Admin bei einer Buchung steht jetzt „KI-Formulierung: aktiv“."
