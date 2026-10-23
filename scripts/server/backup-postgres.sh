#!/usr/bin/env bash
# Daily Postgres dump for the WoYou demo. Designed to be installed at
# /etc/cron.daily/woyou-postgres-backup on the host. Keeps the last 7 dumps.
#
# Install:
#   sudo cp scripts/server/backup-postgres.sh /etc/cron.daily/woyou-postgres-backup
#   sudo chmod +x /etc/cron.daily/woyou-postgres-backup
#   sudo mkdir -p /var/backups/woyou && sudo chmod 700 /var/backups/woyou
#
# Produktion (woyou.de): scripts/prod-einrichten.sh legt /etc/cron.daily/woyou-prod-backup an, das dieses
# Skript mit CONTAINER=woyou_postgres_prod DEST=/var/backups/woyou-prod PREFIX=woyou-prod aufruft.

set -euo pipefail

CONTAINER=${CONTAINER:-woyou_postgres}
DBUSER=${DBUSER:-woyou}
DBNAME=${DBNAME:-woyou}
DEST=${DEST:-/var/backups/woyou}
PREFIX=${PREFIX:-woyou}
KEEP=${KEEP:-7}

mkdir -p "$DEST"
chmod 700 "$DEST"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
out="$DEST/${PREFIX}-${stamp}.sql.gz"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "[backup] container $CONTAINER not running, skip" >&2
  exit 0
fi

docker exec "$CONTAINER" pg_dump -U "$DBUSER" -d "$DBNAME" --no-owner --no-privileges \
  | gzip -9 > "$out.tmp"
mv "$out.tmp" "$out"
chmod 600 "$out"

# Keep last $KEEP dumps (only this prefix)
ls -1t "$DEST"/"$PREFIX"-[0-9]*.sql.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f

echo "[backup] wrote $out"
