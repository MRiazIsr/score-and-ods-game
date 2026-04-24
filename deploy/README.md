# Pick The Score — Hetzner VPS Deployment

Single Hetzner VPS hosting: Postgres + Next.js (via ghcr.io image) + Caddy + fetcher + backup cron.

For the step-by-step go-live checklist, see [CHECKLIST.md](CHECKLIST.md).

## Layout on VPS

```
/opt/pckthscr/
├── docker-compose.yml         # copied from deploy/docker-compose.yml
├── Caddyfile                  # copied from deploy/Caddyfile
├── .env                       # secrets (600 perms, not in git)
├── fetcher/
│   └── index.js               # uploaded by CI (bundled fetcher)
├── volumes/
│   ├── postgres-data/         # bind-mount volume
│   ├── caddy-data/            # ACME certificates
│   └── caddy-config/
├── fetcher.service            # systemd unit (copied from deploy/fetcher.service)
├── fetcher.timer
├── backup.service
├── backup.timer
├── backup.sh                  # executable (chmod +x)
└── restore-latest.sh
```

Deploy the systemd units to `/etc/systemd/system/` and reload.

## First-time setup

1. Create `/opt/pckthscr/.env` — copy from `deploy/.env.example`, fill secrets.
2. Create volume dirs: `mkdir -p /opt/pckthscr/volumes/{postgres-data,caddy-data,caddy-config} /opt/pckthscr/fetcher`.
3. Set up rclone for Hetzner Object Storage: `rclone config` → remote name matches `BACKUP_RCLONE_REMOTE`.
4. Ensure DNS: `pickthescore.app` → VPS IPv4 (A record).
5. Pull image manually once for testing: `docker compose pull && docker compose up -d postgres`.
6. `docker compose up -d app caddy` — Caddy fetches Let's Encrypt cert on first boot.
7. Copy systemd units and enable timers:
   ```
   sudo cp /opt/pckthscr/*.service /opt/pckthscr/*.timer /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable --now fetcher.timer backup.timer
   ```

## Regular operations

- **Pull latest image** (normally automatic via CI):
  `docker compose pull app && docker compose up -d app`
- **View app logs**: `docker compose logs -f app`
- **View fetcher logs**: `journalctl -u fetcher.service -n 100`
- **Trigger fetcher now**: `sudo systemctl start fetcher.service`
- **Check backups**: `rclone ls hetzner:pckthscr-backups/`
- **Restore**: see `RESTORE.md`.
