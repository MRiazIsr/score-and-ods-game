#!/usr/bin/env bash
# Daily pg_dump → age-encrypted → Hetzner Object Storage.
# Keeps 5 most recent dumps in the bucket (older ones deleted).
#
# Env (from /opt/pckthscr/.env):
#   POSTGRES_USER, POSTGRES_DB
#   BACKUP_AGE_PUBLIC_KEY     — recipient pubkey, age1...
#   BACKUP_RCLONE_REMOTE      — rclone remote name
#   BACKUP_BUCKET             — bucket/path under the remote
set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_DB:?POSTGRES_DB not set}"
: "${BACKUP_AGE_PUBLIC_KEY:?BACKUP_AGE_PUBLIC_KEY not set}"
: "${BACKUP_RCLONE_REMOTE:?BACKUP_RCLONE_REMOTE not set}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET not set}"

COMPOSE_FILE="${COMPOSE_FILE:-/opt/pckthscr/docker-compose.yml}"
RETENTION="${BACKUP_RETENTION:-5}"
TS="$(date -u +%Y%m%d-%H%M%S)"
DUMP="/tmp/pckthscr-${TS}.dump"
ENCRYPTED="${DUMP}.age"

trap 'rm -f "${DUMP}" "${ENCRYPTED}"' EXIT

echo "[backup] $(date -u +%FT%TZ) pg_dump starting"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc > "${DUMP}"

DUMP_SIZE=$(stat -c%s "${DUMP}")
echo "[backup] dump size: ${DUMP_SIZE} bytes"

echo "[backup] encrypting"
age -r "${BACKUP_AGE_PUBLIC_KEY}" -o "${ENCRYPTED}" "${DUMP}"

echo "[backup] uploading to ${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/"
rclone copy "${ENCRYPTED}" "${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/"

# Rotate: keep N newest (lexicographic sort on timestamp in filename works).
echo "[backup] rotating: keep ${RETENTION} newest"
rclone lsf "${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/" \
    | grep -E '^pckthscr-[0-9]{8}-[0-9]{6}\.dump\.age$' \
    | sort -r \
    | tail -n +$((RETENTION + 1)) \
    | while read -r old; do
        echo "[backup] deleting old: ${old}"
        rclone delete "${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/${old}"
      done

echo "[backup] $(date -u +%FT%TZ) done — uploaded pckthscr-${TS}.dump.age"
