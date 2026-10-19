#!/usr/bin/env bash
# Anbindung an das EuBiA-CRM einschalten (einmalig auf dem Woyou-Server im Repo-Ordner ausführen):
#   cd /var/www/woyou-app/repo && bash deploy/crm-einrichten.sh
# Fragt Adresse und Schlüssel des CRM ab (Schlüssel unsichtbar), trägt EUBIA_CRM_URL, EUBIA_CRM_TOKEN und
# EUBIA_CRM_SYNC=on in .env ein und startet die App neu. Der Schlüssel erscheint nirgends auf dem Bildschirm oder im Verlauf.
#
# WICHTIG, vorher prüfen: Die Datenschutzerklärung von WoYou muss die Weitergabe der Kundendaten an EuBiA abdecken
# (Empfänger, Zweck, Rechtsgrundlage), und mit EuBiA muss eine Vereinbarung zur Verarbeitung vorliegen.
# Ausschalten: in .env EUBIA_CRM_SYNC=off setzen und "docker compose up -d app".
set -euo pipefail
cd "$(dirname "$0")/.."
ENV=.env
[ -f "$ENV" ] || { echo "Keine $ENV im Ordner $(pwd) gefunden."; exit 1; }

echo "Vorher prüfen: Deckt die Datenschutzerklärung von WoYou die Weitergabe an EuBiA ab?"
read -rp "Ja, ist geprüft [j/N]: " OK
case "$OK" in j|J|ja|Ja) ;; *) echo "Abgebrochen, nichts geändert."; exit 1;; esac

DEFAULT_URL=https://eubia-crm.204.168.176.143.nip.io
read -rp "Adresse des CRM (Enter = $DEFAULT_URL): " URL
URL=${URL:-$DEFAULT_URL}
URL=${URL%/}
case "$URL" in https://*) ;; *) echo "Die Adresse muss mit https:// beginnen."; exit 1;; esac
read -rsp "Schlüssel für den Woyou-Eingang (wird nicht angezeigt): " KEY; echo
[ -n "$KEY" ] || { echo "Kein Schlüssel eingegeben."; exit 1; }
case "$KEY" in *[[:space:]\$\"\'\\]*) echo "Der Schlüssel darf keine Leerzeichen, \$ oder Anführungszeichen enthalten."; exit 1;; esac

echo "Prüfe Erreichbarkeit …"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$URL/" || true)
case "$CODE" in 000) echo "CRM unter $URL nicht erreichbar. Nichts geändert."; exit 1;; esac

cp "$ENV" "$ENV.vor-crm-$(date +%Y%m%d-%H%M)"
chmod 600 "$ENV".vor-crm-* 2>/dev/null || true
sed -i '/^EUBIA_CRM_URL=/d;/^EUBIA_CRM_TOKEN=/d;/^EUBIA_CRM_SYNC=/d' "$ENV"
printf 'EUBIA_CRM_URL=%s\nEUBIA_CRM_TOKEN=%s\nEUBIA_CRM_SYNC=on\n' "$URL" "$KEY" >> "$ENV"
unset KEY
chmod 600 "$ENV"
docker compose up -d app >/dev/null
echo "Fertig: Woyou meldet neue Ereignisse jetzt an $URL."
echo "Bestehende Kund:innen einmalig nachtragen (erst Probelauf, dann wirklich):"
echo "  docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts"
echo "  docker compose --profile init run --rm db-init npx tsx scripts/crm-nachtragen.ts --ausfuehren"
