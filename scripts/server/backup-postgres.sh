#!/usr/bin/env bash
# Daily Postgres dump for the WoYou demo. Designed to be installed at
# /etc/cron.daily/woyou-postgres-backup on the host. Keeps the last 7 dumps.
#
# Install:
#   sudo cp scripts/server/backup-postgres.sh /etc/cron.daily/woyou-postgres-backup
#   sudo chmod +x /etc/cron.daily/woyou-postgres-backup
#   sudo mkdir -p /var/backups/woyou && sudo chmod 700 /var/backups/woyou

set -euo pipefail

CONTAINER=woyou_postgres
DBUSER=woyou
DBNAME=woyou
DEST=/var/backups/woyou

mkdir -p "$DEST"
chmod 700 "$DEST"

stamp=$(date -u +%Y%m%dT%H%M%SZ)
out="$DEST/woyou-${stamp}.sql.gz"

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "[backup] container $CONTAINER not running, skip" >&2
  exit 0
fi

docker exec "$CONTAINER" pg_dump -U "$DBUSER" -d "$DBNAME" --no-owner --no-privileges \
  | gzip -9 > "$out.tmp"
mv "$out.tmp" "$out"
chmod 600 "$out"

# Keep last 7 dumps
ls -1t "$DEST"/woyou-*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm -f

echo "[backup] wrote $out"
