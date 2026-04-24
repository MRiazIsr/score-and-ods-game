# Pick The Score — Hetzner VPS Deployment

Single Hetzner VPS hosting: Postgres + Next.js (via ghcr.io image) + systemd-timer fetcher + systemd-timer backup. The system-level Caddy already running on the host (`/etc/caddy/Caddyfile`) fronts the app on port 8080, with Cloudflare in front terminating TLS.

For the step-by-step go-live checklist, see [CHECKLIST.md](CHECKLIST.md).

## Layout on VPS

```
/opt/pckthscr/
├── docker-compose.yml        # deployed by CI (scp from deploy/docker-compose.yml)
├── .env                      # secrets, 600 perms, NOT in git
├── .age-key                  # age private key, 600 perms, NOT in git
├── volumes/
│   └── postgres-data/        # bind-mount volume (don't delete)
├── backups/                  # rolling 5 age-encrypted pg_dump files
├── fetcher.service           # systemd unit (deployed by CI)
├── fetcher.timer
├── backup.service
├── backup.timer
├── backup.sh                 # executable (chmod +x after scp)
├── restore-latest.sh
└── RESTORE.md
```

CI copies the `deploy/*` files into `/opt/pckthscr/` and then installs systemd units to `/etc/systemd/system/`.

## First-time setup (manual, once)

Already done via SSH bootstrap:

1. `/opt/pckthscr/` dirs created (`volumes/postgres-data`, `backups`, `fetcher`).
2. `/opt/pckthscr/.age-key` generated via `age-keygen`; public key placed in `.env` as `BACKUP_AGE_PUBLIC_KEY`.
3. `/opt/pckthscr/.env` populated from `deploy/.env.example` with real secrets (mirrors GitHub Actions secrets).
4. `/etc/caddy/Caddyfile` appended with `:8080 { @host pickthescore.app; reverse_proxy 127.0.0.1:3000 }` vhost; Caddy reloaded.
5. UFW opened on `:8080/tcp` only for Cloudflare IP ranges (see `/etc/ufw/*` or `ufw status`).
6. Cloudflare: domain proxied (orange cloud), SSL mode = Flexible, Origin Rule rewrites to origin HTTP:8080.

Subsequent deploys are fully automatic via GitHub Actions.

## Regular operations

- **View app logs**: `docker compose -f /opt/pckthscr/docker-compose.yml logs -f app`
- **View fetcher logs**: `journalctl -u fetcher.service -n 100 --no-pager`
- **Trigger fetcher now**: `sudo systemctl start fetcher.service`
- **List backups**: `ls -lh /opt/pckthscr/backups/`
- **Verify a backup**: `sudo /opt/pckthscr/restore-latest.sh --verify-only`
- **Restore from backup**: see [RESTORE.md](RESTORE.md)
- **Admin DB operation** (ban / promote user): `docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "UPDATE users SET is_admin = true WHERE username = '...';"`
