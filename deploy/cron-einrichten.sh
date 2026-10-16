#!/usr/bin/env bash
# Zeitplan für Woyou einrichten (einmalig auf dem Server ausführen):
#   bash deploy/cron-einrichten.sh
# Erzeugt CRON_SECRET in .env (falls noch nicht vorhanden), startet die App neu und
# legt /etc/cron.d/woyou an: täglich 9:00 Erinnerungen und Marketingstrecke, 3:30 Aufräumen.
set -euo pipefail
cd "$(dirname "$0")/.."
ENV=.env
if ! grep -q '^CRON_SECRET=.\+' "$ENV"; then
  sed -i '/^CRON_SECRET=/d' "$ENV"
  echo "CRON_SECRET=$(openssl rand -hex 32)" >> "$ENV"
  docker compose up -d app >/dev/null
  echo "CRON_SECRET erzeugt, App neu gestartet."
fi
URL="http://127.0.0.1:3050"
cat > /etc/cron.d/woyou <<CRON
# Woyou – angelegt von deploy/cron-einrichten.sh
SHELL=/bin/bash
0 9 * * * root S=\$(grep '^CRON_SECRET=' $(pwd)/$ENV | cut -d= -f2); curl -fsS -X POST -H "Authorization: Bearer \$S" $URL/api/cron/reminders >/dev/null; curl -fsS -X POST -H "Authorization: Bearer \$S" $URL/api/cron/marketing >> /var/log/woyou-marketing.log; echo >> /var/log/woyou-marketing.log
30 3 * * * root S=\$(grep '^CRON_SECRET=' $(pwd)/$ENV | cut -d= -f2); curl -fsS -X POST -H "Authorization: Bearer \$S" $URL/api/cron/purge >/dev/null
CRON
chmod 644 /etc/cron.d/woyou
echo "Zeitplan eingerichtet: /etc/cron.d/woyou"
