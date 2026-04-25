# Migration Log — AWS → Hetzner + PostgreSQL

**Date:** 2026-04-24
**Scope:** Full backend rewrite and infrastructure migration
**Outcome:** App deployed and healthy on Hetzner VPS; Cloudflare setup in progress (waiting for NS propagation)

---

## What was done (code side)

### 1. Data layer — DynamoDB → PostgreSQL + Prisma

- Removed old AWS SDK (`aws-sdk`, `@aws-sdk/*`), serverless framework, Lambda source, DynamoDB single-table code, factory pattern with `DB_TYPE` switch
- Introduced **Prisma** (`prisma/schema.prisma`) with 9 domain tables + `_prisma_migrations`:
  - `users` — auth, with `is_admin`, `is_banned`, `is_deleted`, `profile_image` control columns
  - `competitions`, `seasons`, `teams`, `players` — football-data.org entities
  - `matches` — fixtures with JSONB `raw_data` for lineups/goals/bookings
  - `user_predictions` — cached `points_awarded` populated by fetcher
  - `standings`, `top_scorers` — tournament data
- Thin repositories in `src/app/server/db/repositories/` (one file per entity)
- Pure scoring function in `src/app/server/services/ScoringService.ts` (3 exact / 2 diff / 1 outcome / 0 miss)

### 2. Auth upgrade — MD5 → argon2id

- `AuthService` uses `argon2.hash(…, {type: argon2id})`
- `SessionUser` type moved to `src/app/lib/auth/types.ts` (from old DynamoDB module)
- `userType: number` → `isAdmin: boolean`
- `getSession()` validates user exists in DB on every read; stale cookies (from before DB reset) auto-destroy session

### 3. Error handling + structured logging

- `src/app/lib/errors.ts`: `logError(tag, err, ctx)` for stdout → journald logs, `friendlyMessage(err)` maps Prisma codes (P2003/P2002/P2025) to safe user-facing strings
- Every server action: try/catch → log context (userId, ids) → return graceful fallback (empty array/zero stats) or neutral message

### 4. Fetcher (football-data.org sync)

- Rewritten from Lambda to bundled Node script at `scripts/fetcher/`
- Build: `esbuild scripts/fetcher/index.ts → dist/fetcher/index.js` (single file, 435 KB)
- Runs via systemd-timer inside the `app` container: `docker compose exec -T app node /app/dist/fetcher/index.js`
- Awards points on FINISHED matches in one batched transaction per match

### 5. Rebrand

- `Pitchr` → `Pick The Score` (logo component `AppLogo`, landing page, header, auth shell, `layout.tsx` title)
- `pitchr.app` → `pickthescore.app` everywhere
- Custom SVG favicon at `src/app/icon.svg` matching the red-circle + white-cross logo mark
- Throughout the codebase `tipmgr` internal identifiers → `pckthscr` (dir paths, container names, DB default, bucket names, env var prefixes). Local dev DB stays `tip_manager` (preserved user's existing `.env`).

---

## What was done (infra side)

### Hetzner VPS state before

Already running on `49.13.201.110` (Ubuntu 24.04):
- `sing-box` VPN on port 443 (Reality/Trojan protocol)
- Existing Caddy on ports 80 + 8443 fronting `myvpn-api.online:8443` (VPN admin panel, proxy to `127.0.0.1:8085`)
- `/opt/VpnBot/` Go-based VPN admin app
- Docker 28.3.3

This constrained the deployment — port 443 cannot be used without breaking VPN. Solution: **Cloudflare proxy → origin on port 8080**, with existing Caddy getting a new vhost for `pickthescore.app:8080 → 127.0.0.1:3000`.

### Bootstrap (manual, one-time)

Done via SSH as root:

- `/opt/pckthscr/` dir created with subdirs `volumes/postgres-data/`, `backups/`, `fetcher/`
- `age-keygen -o /opt/pckthscr/.age-key` (600 perms); public key stored in `.env` as `BACKUP_AGE_PUBLIC_KEY`
- `/opt/pckthscr/.env` populated with:
  - `POSTGRES_USER=pckthscr`, `POSTGRES_PASSWORD` (generated), `POSTGRES_DB=pckthscr`
  - `SESSION_PASSWORD`, `SESSION_COOKIE_NAME`, `API_KEY` (mirror of GitHub Actions secrets)
  - `GITHUB_REPOSITORY=mriazisr/score-and-ods-game` (lowercase — required by docker image reference)
  - `IMAGE_TAG=latest`, `CADDY_DOMAIN=pickthescore.app`, `APP_HTTP_PORT=8080`
  - `BACKUP_LOCAL_DIR=/opt/pckthscr/backups`, `BACKUP_RETENTION=5`
- `apt install age` — for encrypted backups
- Added vhost to `/etc/caddy/Caddyfile`:
  ```
  :8080 {
    @pickthescore host pickthescore.app www.pickthescore.app
    handle @pickthescore {
      reverse_proxy 127.0.0.1:3000 {
        header_up X-Real-IP {http.request.header.CF-Connecting-IP}
        header_up X-Forwarded-For {http.request.header.CF-Connecting-IP}
        header_up X-Forwarded-Proto https
      }
    }
    handle { respond "Not Found" 404 }
    encode gzip zstd
    log { output file /var/log/caddy/pckthscr_access.log }
  }
  ```
  Reloaded via `systemctl reload caddy`.
- UFW: `:8080/tcp` opened **only for Cloudflare IP ranges** (IPv4 + IPv6, auto-fetched from `https://www.cloudflare.com/ips-v4|v6`). Origin IP direct access blocked.

### CI/CD

`.github/workflows/deploy.yml`:
1. **build-and-push** job — Docker Buildx + ghcr.io with secret-files (SESSION_PASSWORD, SESSION_COOKIE_NAME, API_KEY mounted at build time, not baked in)
2. **deploy-to-hetzner** job:
   - Normalizes `HETZNER_SSH_KEY` secret (strips BOM/CR/trailing whitespace, ensures trailing LF)
   - Native `ssh -o BatchMode=yes -o StrictHostKeyChecking=no -o IdentitiesOnly=yes` (replaces appleboy/ssh-action which silently failed)
   - Remote script:
     - Shallow `git clone` using `GITHUB_TOKEN` to pull `deploy/*` into `/opt/pckthscr/`
     - Pin `IMAGE_TAG=<sha>` in `.env`
     - `docker login ghcr.io` using `GITHUB_TOKEN` (fresh per run)
     - Install systemd units to `/etc/systemd/system/`
     - `docker compose pull + up -d postgres + app`
     - `systemctl enable --now fetcher.timer backup.timer`
     - Health check loop on loopback (`docker compose exec app curl localhost:3000/api/health`)

### Systemd units on VPS (`/etc/systemd/system/`)

- `fetcher.service` / `fetcher.timer` — `OnCalendar=hourly`, `Persistent=true`, runs fetcher inside the `app` container
- `backup.service` / `backup.timer` — `OnCalendar=*-*-* 03:00:00 UTC`, runs `/opt/pckthscr/backup.sh`

### Backup strategy (local disk)

`/opt/pckthscr/backup.sh`:
- Daily `pg_dump -Fc` → age-encrypted → saved to `/opt/pckthscr/backups/` as `pckthscr-YYYYMMDD-HHMMSS.dump.age`
- Rotation: keeps 5 most recent, deletes rest
- **Object Storage upload intentionally skipped** to avoid the $8/month charge. Disk is ~38 GB with plenty of room for 5 dumps. Can be extended later by adding rclone upload when the project grows.

---

## Debug war stories (useful references for future)

1. **Docker build failing on `docker/postgres: permission denied`** — legacy root-owned dir from a prior Postgres experiment. Fixed by adding `/docker`, `/dist`, `/deploy`, `.idea/`, `.claude/` to `.dockerignore`.
2. **COPY of `/app/node_modules/node-addon-api` failed** — argon2 bundles it only in its nested `node_modules/argon2/node_modules/`, and uses prebuilt binaries at runtime. Removed that COPY line.
3. **`appleboy/scp-action` and `appleboy/ssh-action` both silently failed** — replaced with native `ssh` + `ssh-keygen -l` diagnostics. Root cause turned out to be the SSH private key in `HETZNER_SSH_KEY` secret didn't match any authorized key on the server. User re-pasted a different (correct) key and SSH started accepting.
4. **`docker compose pull` got `denied: denied` even after CI docker login** — image reference `ghcr.io/MRiazIsr/score-and-ods-game` had uppercase characters which Docker rejects. Fixed by lowercasing `GITHUB_REPOSITORY` in server `.env`.
5. **(Day 2, 2026-04-25) `https://pickthescore.app/api/health` returning Cloudflare 522 after NS propagation** — origin unreachable from CF edge. App was healthy on loopback, Caddy listening on `*:8080`, ufw correctly allowing all 15 CF IPv4 subnets, but `tcpdump -i any` on the VM showed **zero packets from CF on any port** during external curl attempts (while sing-box VPN traffic on :443 was flowing normally). Root cause: Hetzner has a **Cloud Firewall** layer (managed at `console.hetzner.cloud` → Firewalls) that sits *in front of* the VM's `eth0`, separate from in-VM ufw. Port 8080 was never opened there, so CF SYNs were silently dropped before reaching ufw. Fix: add inbound TCP/8080 rule in Hetzner Cloud Firewall. Lesson: this VM has two firewall layers; both must allow a port for it to be reachable. When `tcpdump` on the VM sees nothing while other ports on the same VM receive traffic, suspect Cloud Firewall.

---

## Current state

### On Hetzner (all healthy)

- `pckthscr-postgres` — Postgres 16, 10 tables, `_prisma_migrations` shows migration `20260424000000_init` applied
- `pckthscr-app` — Next.js standalone, healthy, bound to `127.0.0.1:3000`
- Existing Caddy on `:8080` proxying `pickthescore.app` → app
- `fetcher.timer` — active, ran successfully twice (2 competitions synced, 568 matches + 50 teams + 20 scorers + 56 standings rows in DB)
- `backup.timer` — active, first run scheduled for 03:00 UTC tonight

### DNS / Cloudflare

- Domain added to Cloudflare, plan Free
- DNS records in Cloudflare:
  - `A pickthescore.app → 49.13.201.110` (proxied, orange cloud)
  - `A www → 49.13.201.110` (proxied, orange cloud)
  - MX × 5 + TXT (email forwarding via Namecheap) — DNS only, unchanged
- SSL/TLS mode: **Flexible** (to be confirmed — user was going to set this)
- Origin Rule: **Rewrite HTTP Port to 8080** for `Hostname in {pickthescore.app, www.pickthescore.app}` — done
- Nameservers switched in Namecheap: `dns1/dns2.registrar-servers.com` → `kristin.ns.cloudflare.com` + `mack.ns.cloudflare.com`
- **Last check:** NS propagation NOT yet visible from public resolvers (`dig NS` still showed old Namecheap NS). Typical 10-30 min, can be up to 24h.

---

## Next steps (for me when I wake up)

1. **Check NS propagation:** `dig +short NS pickthescore.app @1.1.1.1` — should show `*.ns.cloudflare.com`.
2. **Check Cloudflare dashboard:** domain status should say **Active** with a green checkmark + an email "pickthescore.app is now on Cloudflare".
3. **Verify SSL:** `https://pickthescore.app/api/health` should return `{"status":"healthy",...}`. If it returns:
   - `522` — origin unreachable. Check Origin Rule has HTTP Port = 8080.
   - `525/526` — SSL handshake issue. SSL mode must be **Flexible**.
   - `1016` — DNS resolution error. A record not proxied (needs orange cloud).
4. **Functional smoke test** at `https://pickthescore.app/`:
   - Sign up with a test account
   - Go to a competition, make a prediction
   - Check Dashboard shows totals
5. **Promote myself to admin** after signup:
   ```bash
   ssh -i ~/.ssh/hertzner-ubuntu root@49.13.201.110
   docker exec pckthscr-postgres psql -U pckthscr -d pckthscr -c \
       "UPDATE users SET is_admin = true WHERE username = 'мой-юзернейм';"
   ```
6. **Once stable (1-2 weeks):** decommission AWS
   - DynamoDB: delete table `SoccerGameData`
   - Lambda: delete `matchFetcher` + EventBridge schedule
   - Lightsail: delete container service `score-game`
   - IAM: delete OIDC provider + GitHub Actions role
   - GitHub Secrets: delete `AWS_ROLE_ARN`, `LIGHTSAIL_AWS_ACCESS_KEY_ID`, `LIGHTSAIL_AWS_SECRET_ACCESS_KEY`

---

## Quick admin reference

### SSH

```bash
ssh -i ~/.ssh/hertzner-ubuntu root@49.13.201.110
```

### App logs

```bash
docker compose -f /opt/pckthscr/docker-compose.yml logs -f app
```

### Trigger fetcher now

```bash
sudo systemctl start fetcher.service
journalctl -u fetcher.service -n 50 --no-pager
```

### Check DB

```bash
docker exec pckthscr-postgres psql -U pckthscr -d pckthscr
# \dt     list tables
# SELECT COUNT(*) FROM matches;
# SELECT username, is_admin, is_banned FROM users;
```

### List backups

```bash
ls -lh /opt/pckthscr/backups/
```

### Verify latest backup

```bash
sudo /opt/pckthscr/restore-latest.sh --verify-only
```

### Manual restore — see `deploy/RESTORE.md` for full procedure

---

## Files touched

### Created

- `prisma/schema.prisma`, `prisma/migrations/20260424000000_init/migration.sql`
- `src/app/server/db/client.ts` + `repositories/*.ts` (9 repos)
- `src/app/server/services/ScoringService.ts`, `mappers.ts`
- `src/app/lib/errors.ts`
- `scripts/fetcher/*` (bundled fetcher)
- `src/app/icon.svg` (favicon)
- `deploy/docker-compose.yml` (production compose, no Caddy container)
- `deploy/fetcher.{service,timer}`, `deploy/backup.{service,timer,sh}`
- `deploy/restore-latest.sh`, `deploy/RESTORE.md`, `deploy/README.md`, `deploy/CHECKLIST.md`, `deploy/.env.example`

### Deleted

- `serverless.yml`
- `src/lambdas/`
- `src/tests/`
- `src/app/favicon.ico` (replaced by icon.svg)
- `src/app/server/models/`, `modules/factories/`, `modules/dataAccess/`, `modules/user/DynamoDb*`, `modules/competitions/DynamoDb*`
- `src/app/server/entities/UserTypesEntity.ts`
- `src/app/server/modules/user/types/userTypes.ts` (merged into `src/app/lib/auth/types.ts`)
- `src/app/server/modules/competitions/{scoring,constants}.ts` (merged into `ScoringService.ts`)

### Significantly changed

- `Dockerfile` (multi-stage with Prisma generate, fetcher bundle, lean runtime)
- `docker-compose.yml` (local dev — Postgres only)
- `next.config.ts` (dropped AWS SDK externals, added Prisma + argon2)
- `.github/workflows/deploy.yml` (rewritten for ghcr.io + Hetzner SSH deploy)
- `package.json` (all AWS/serverless out, Prisma + argon2 + axios in)
- `.env.example`, `.dockerignore`, `.gitignore`
- All `src/app/server/services/**` (using repositories)
- All `src/app/actions/**` (using services directly, with logging wrapper)
- `src/app/actions/auth.ts` (session DB validation added)
- `eslint.config.mjs` (added `_` prefix ignore for unused vars)

---

## Key commits

1. `5267409` — Main migration: AWS DynamoDB/Lambda/Lightsail → Hetzner Postgres + Prisma (95 files, +7072/-22563)
2. `af7a032` — Adapt deploy to existing VPS (Cloudflare proxy, local backups, no own Caddy)
3. `3a9d348` — Dockerfile fixes (dockerignore, drop node-addon-api)
4. `c81f15c` — CI native ssh with diagnostics
5. `1dfff21` — GITHUB_REPOSITORY lowercase fix (final successful deploy)
6. `fcc07b4` — CI debug cleanup

---

## Key memory for future sessions

Saved in `/home/markriaz/.claude/projects/-home-markriaz-tip-manager/memory/`:

- `user_language.md` — user prefers Russian
- `user_collab_style.md` — terse, decisive, catches architectural misses
- `project_tip_manager.md` — football prediction app on Hetzner post-migration
- `reference_prod.md` — VPS 49.13.201.110, shared with sing-box VPN on 443, app behind Cloudflare on 8080
