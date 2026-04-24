#!/usr/bin/env bash
# Pull latest backup from Hetzner Object Storage, decrypt, and restore into a
# temporary database `pckthscr_restore` on the same Postgres container.
#
# Use this to validate backups or to stage recovery. It does NOT touch the
# production `pckthscr` database. For destructive restore-over-prod, see RESTORE.md.
#
# Optional flags:
#   --verify-only  : restore into temp DB, print row counts of key tables, drop temp DB.
set -euo pipefail

: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${BACKUP_RCLONE_REMOTE:?BACKUP_RCLONE_REMOTE not set}"
: "${BACKUP_BUCKET:?BACKUP_BUCKET not set}"

COMPOSE_FILE="${COMPOSE_FILE:-/opt/pckthscr/docker-compose.yml}"
AGE_KEY_FILE="${BACKUP_AGE_KEY_FILE:-/opt/pckthscr/.age-key}"
VERIFY_ONLY=0
if [ "${1:-}" = "--verify-only" ]; then VERIFY_ONLY=1; fi

if [ ! -f "${AGE_KEY_FILE}" ]; then
    echo "age private key not found at ${AGE_KEY_FILE}; aborting"
    exit 1
fi

# Find most recent backup.
LATEST=$(rclone lsf "${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/" \
    | grep -E '^pckthscr-[0-9]{8}-[0-9]{6}\.dump\.age$' \
    | sort -r | head -n 1)
if [ -z "${LATEST}" ]; then
    echo "No backups found."
    exit 1
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "${TMP_DIR}"' EXIT

echo "Downloading ${LATEST}"
rclone copy "${BACKUP_RCLONE_REMOTE}:${BACKUP_BUCKET}/${LATEST}" "${TMP_DIR}/"

echo "Decrypting"
age -d -i "${AGE_KEY_FILE}" -o "${TMP_DIR}/restore.dump" "${TMP_DIR}/${LATEST}"

echo "Creating temp database pckthscr_restore"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    psql -U "${POSTGRES_USER}" -c "DROP DATABASE IF EXISTS pckthscr_restore;"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    psql -U "${POSTGRES_USER}" -c "CREATE DATABASE pckthscr_restore;"

echo "Restoring dump into pckthscr_restore"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    pg_restore -U "${POSTGRES_USER}" -d pckthscr_restore < "${TMP_DIR}/restore.dump"

echo "Row counts in pckthscr_restore:"
docker compose -f "${COMPOSE_FILE}" exec -T postgres \
    psql -U "${POSTGRES_USER}" -d pckthscr_restore -c "\
SELECT 'users' AS t, COUNT(*) FROM users \
UNION ALL SELECT 'competitions', COUNT(*) FROM competitions \
UNION ALL SELECT 'matches', COUNT(*) FROM matches \
UNION ALL SELECT 'user_predictions', COUNT(*) FROM user_predictions;"

if [ "${VERIFY_ONLY}" = "1" ]; then
    echo "Cleaning up temp DB"
    docker compose -f "${COMPOSE_FILE}" exec -T postgres \
        psql -U "${POSTGRES_USER}" -c "DROP DATABASE pckthscr_restore;"
    echo "Backup verified."
fi

echo "Done."
