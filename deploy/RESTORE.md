# Postgres restore procedure

Prerequisites:

- Logged into the Hetzner VPS as root or user in `docker` group.
- Age private key at `/opt/pckthscr/.age-key`, permissions `600`.

## List available backups

```
ls -lh /opt/pckthscr/backups/
```

Up to 5 files named `pckthscr-YYYYMMDD-HHMMSS.dump.age`.

## Option A — verify latest backup (non-destructive)

```
sudo /opt/pckthscr/restore-latest.sh --verify-only
```

Restores the latest dump into a temp `pckthscr_restore` database, prints row counts of key tables, then drops the temp DB. Zero impact on production.

## Option B — restore latest into a separate DB (for inspection)

```
sudo /opt/pckthscr/restore-latest.sh
```

Same as Option A but keeps `pckthscr_restore` database alive. Inspect with:

```
docker compose -f /opt/pckthscr/docker-compose.yml exec postgres \
    psql -U "$POSTGRES_USER" -d pckthscr_restore
```

Drop it when done:

```
docker compose -f /opt/pckthscr/docker-compose.yml exec postgres \
    psql -U "$POSTGRES_USER" -c "DROP DATABASE pckthscr_restore;"
```

## Option C — restore a specific backup (manual, non-destructive)

```
source /opt/pckthscr/.env
BACKUP_FILE="pckthscr-20260424-030000.dump.age"   # pick from `ls` output

# Decrypt
age -d -i /opt/pckthscr/.age-key \
    -o /tmp/restore.dump "/opt/pckthscr/backups/${BACKUP_FILE}"

# Create temp DB and restore
docker compose -f /opt/pckthscr/docker-compose.yml exec -T postgres \
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE pckthscr_restore;"
docker compose -f /opt/pckthscr/docker-compose.yml exec -T postgres \
    pg_restore -U "$POSTGRES_USER" -d pckthscr_restore < /tmp/restore.dump
```

Inspect, then drop when done.

## Option D — DESTRUCTIVE: replace production DB

Requires app downtime. Only use when the production DB is confirmed unusable.

```
source /opt/pckthscr/.env
BACKUP_FILE="pckthscr-20260424-030000.dump.age"

# 1. Stop app + fetcher timer to avoid new writes mid-restore.
docker compose -f /opt/pckthscr/docker-compose.yml stop app
sudo systemctl stop fetcher.timer

# 2. Decrypt.
age -d -i /opt/pckthscr/.age-key \
    -o /tmp/restore.dump "/opt/pckthscr/backups/${BACKUP_FILE}"

# 3. Recreate production DB.
docker compose -f /opt/pckthscr/docker-compose.yml exec -T postgres \
    psql -U "$POSTGRES_USER" -c "DROP DATABASE ${POSTGRES_DB};"
docker compose -f /opt/pckthscr/docker-compose.yml exec -T postgres \
    psql -U "$POSTGRES_USER" -c "CREATE DATABASE ${POSTGRES_DB};"

# 4. Restore dump.
docker compose -f /opt/pckthscr/docker-compose.yml exec -T postgres \
    pg_restore -U "$POSTGRES_USER" -d "${POSTGRES_DB}" < /tmp/restore.dump

# 5. Start app (applies any pending Prisma migrations on boot).
docker compose -f /opt/pckthscr/docker-compose.yml up -d app
sudo systemctl start fetcher.timer

# 6. Smoke test.
curl -fsS "https://${CADDY_DOMAIN}/api/health"
```

## Self-test cron (weekly)

`backup.sh` runs daily. For periodic automated restore validation, add a Monday-only call:

```
# /etc/systemd/system/backup-verify.service
[Service]
Type=oneshot
EnvironmentFile=/opt/pckthscr/.env
ExecStart=/opt/pckthscr/restore-latest.sh --verify-only

# /etc/systemd/system/backup-verify.timer
[Timer]
OnCalendar=Mon 04:30 UTC
Persistent=true
Unit=backup-verify.service
```
