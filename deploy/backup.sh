#!/usr/bin/env bash
# Daily pg_dump → age-encrypted → local disk.
# Keeps 5 most recent dumps in $BACKUP_LOCAL_DIR (older ones deleted).
#
# Env (from /opt/pckthscr/.env):
#   POSTGRES_USER, POSTGRES_DB
#   BACKUP_AGE_PUBLIC_KEY     — recipient pubkey, age1...
#   BACKUP_LOCAL_DIR          — on-disk directory (default /opt/pckthscr/backups)
#   BACKUP_RETENTION          — number of dumps to keep (default 5)
#
# Object Storage upload is intentionally NOT configured to save cost during the
# early project phase; disk is ~38 GB with plenty of headroom for ≤5 dumps.
# Add rclone upload later by extending this script when the project grows.
set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_DB:?POSTGRES_DB not set}"
: "${BACKUP_AGE_PUBLIC_KEY:?BACKUP_AGE_PUBLIC_KEY not set}"

COMPOSE_FILE="${COMPOSE_FILE:-/opt/pckthscr/docker-compose.yml}"
BACKUP_DIR="${BACKUP_LOCAL_DIR:-/opt/pckthscr/backups}"
RETENTION="${BACKUP_RETENTION:-5}"

TS="$(date -u +%Y%m%d-%H%M%S)"
DUMP="/tmp/pckthscr-${TS}.dump"
ENCRYPTED="${BACKUP_DIR}/pckthscr-${TS}.dump.age"

mkdir -p "${BACKUP_DIR}"
chmod 700 "${BACKUP_DIR}"

trap 'rm -f "${DUMP}"' EXIT

echo "[backup] $(date -u +%FT%TZ) pg_dump starting"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -Fc > "${DUMP}"

DUMP_SIZE=$(stat -c%s "${DUMP}")
echo "[backup] dump size: ${DUMP_SIZE} bytes"

echo "[backup] encrypting → ${ENCRYPTED}"
age -r "${BACKUP_AGE_PUBLIC_KEY}" -o "${ENCRYPTED}" "${DUMP}"
chmod 600 "${ENCRYPTED}"

# Rotate: keep N newest (lexicographic sort on timestamp in filename works).
echo "[backup] rotating: keep ${RETENTION} newest in ${BACKUP_DIR}"
ls -1t "${BACKUP_DIR}" | grep -E '^pckthscr-[0-9]{8}-[0-9]{6}\.dump\.age$' \
    | tail -n +$((RETENTION + 1)) \
    | while read -r old; do
        echo "[backup] deleting old: ${old}"
        rm -f "${BACKUP_DIR}/${old}"
      done

echo "[backup] $(date -u +%FT%TZ) done — saved pckthscr-${TS}.dump.age"
ls -lh "${BACKUP_DIR}" | tail -n +2
