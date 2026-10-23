#!/usr/bin/env bash
# Löscht die Sicherungen, die scripts/prod-einrichten.sh vor jedem Update anlegt
# ($SICHERUNG/prod-einrichten-<zeit>/), sobald sie älter als TAGE Tage sind.
# Ausgenommen bleibt die Sicherung der alten statischen Seite (woyou-preview-seite.tar.gz): sie wird nie gelöscht,
# der Ordner bleibt dann nur mit dieser Datei stehen.
# Läuft täglich über /etc/cron.daily/woyou-prod-backup (angelegt von prod-einrichten.sh).
#   SICHERUNG=/var/backups/woyou TAGE=14 bash scripts/server/sicherungen-aufraeumen.sh [--trocken]
set -euo pipefail
SICHERUNG=${SICHERUNG:-/var/backups/woyou}
TAGE=${TAGE:-14}
BEHALTEN=woyou-preview-seite.tar.gz
TROCKEN=0; [ "${1:-}" = "--trocken" ] && TROCKEN=1

[ -d "$SICHERUNG" ] || exit 0
find "$SICHERUNG" -mindepth 1 -maxdepth 1 -type d -name 'prod-einrichten-*' -mtime +"$((TAGE - 1))" -print0 |
while IFS= read -r -d '' dir; do
  find "$dir" -mindepth 1 ! -name "$BEHALTEN" -print0 | while IFS= read -r -d '' f; do
    if [ "$TROCKEN" = 1 ]; then echo "[aufraeumen] würde löschen: $f"; else rm -rf -- "$f"; fi
  done
  if [ "$TROCKEN" = 0 ]; then
    rmdir -- "$dir" 2>/dev/null && echo "[aufraeumen] gelöscht: $dir" || echo "[aufraeumen] behalten (alte Seite): $dir"
  fi
done
