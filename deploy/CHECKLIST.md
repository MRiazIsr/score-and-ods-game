# Pick The Score — Go-Live Checklist

Пошаговая инструкция для первого деплоя на Hetzner VPS.

**Архитектура:** Cloudflare (TLS на 443) → VPS:8080 (existing Caddy vhost) → `127.0.0.1:3000` (Next.js Docker). Port 443 на VPS занят sing-box VPN — мы туда не идём.

## 1. GitHub Secrets

В `Settings → Secrets and variables → Actions`:

| Secret | Значение |
|---|---|
| `HETZNER_HOST` | IP или hostname VPS (например `49.13.201.110`) |
| `HETZNER_USER` | SSH-user (например `root`) |
| `HETZNER_SSH_KEY` | Приватный SSH-ключ (полный текст) |
| `SESSION_PASSWORD` | уже был |
| `SESSION_COOKIE_NAME` | уже был |
| `API_KEY` | football-data.org, уже был |

Удалить старые AWS-секреты после переезда:
- `AWS_ROLE_ARN`
- `LIGHTSAIL_AWS_ACCESS_KEY_ID`
- `LIGHTSAIL_AWS_SECRET_ACCESS_KEY`

## 2. Cloudflare

1. Зарегать домен `pickthescore.app` в Cloudflare (бесплатный тариф).
2. В регистраторе поменять nameservers на Cloudflare-овские (Cloudflare показывает какие).
3. После активации — в DNS:
   - `A pickthescore.app → 49.13.201.110` (orange cloud **ON**)
   - `A www.pickthescore.app → 49.13.201.110` (orange cloud **ON**)
4. SSL/TLS → Overview → encryption mode: **Flexible** (Cloudflare ↔ Origin — HTTP на порту 8080; Browser ↔ Cloudflare — HTTPS).
5. Rules → **Origin Rules** → Create rule:
   - When: `Hostname equals pickthescore.app OR www.pickthescore.app`
   - Then: **HTTP port: 8080** (это перенаправит входящие 443 на origin:8080)
6. Rules → **Page Rules** (опционально, чтоб www редиректил на apex):
   - URL: `www.pickthescore.app/*`
   - Forwarding URL: 301 → `https://pickthescore.app/$1`

## 3. VPS — уже настроено скриптом (пропустить)

Этот раздел выполнен ранее:
- ✅ `/opt/pckthscr/{volumes/postgres-data,backups,fetcher}`
- ✅ `/opt/pckthscr/.age-key` + `BACKUP_AGE_PUBLIC_KEY` в `.env`
- ✅ `/opt/pckthscr/.env` с секретами, правами 600
- ✅ Existing `/etc/caddy/Caddyfile` дополнен vhost-ом `pickthescore.app:8080 → 127.0.0.1:3000`
- ✅ UFW открыт на :8080 только для Cloudflare IP-диапазонов

## 4. DNS

`pickthescore.app` должен резолвиться на Cloudflare (после шага 2, когда NS переключатся):

```bash
dig +short pickthescore.app
# Ответ: 104.x.x.x или 172.x.x.x (Cloudflare IP), а не 49.13.201.110
```

Если видишь прямой IP VPS — значит orange cloud выключен или nameservers ещё не обновились.

## 5. Первый деплой

Просто `git push origin main` — GitHub Actions:
1. Соберёт Docker image, пушнёт в `ghcr.io/mriazisr/score-and-ods-game:SHA`
2. SSH в VPS, `docker login ghcr.io` через GITHUB_TOKEN
3. Скопирует compose/systemd-units в `/opt/pckthscr/`
4. `docker compose up -d postgres app`
5. App применит миграции Prisma (`prisma migrate deploy`) на старте контейнера
6. `systemctl enable --now fetcher.timer backup.timer`
7. Healthcheck: `curl http://localhost:3000/api/health` изнутри контейнера

Если упало — логи в GitHub Actions UI.

## 6. Проверка после деплоя

```bash
# SSH на VPS
cd /opt/pckthscr

# Контейнеры работают
docker compose ps          # postgres + app → healthy

# App отвечает на loopback
curl -fsS http://127.0.0.1:3000/api/health

# Миграции применены
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "\dt"
# Должно быть 10 таблиц включая _prisma_migrations

# Caddy маршрутизирует на app
curl -fsS -H "Host: pickthescore.app" http://127.0.0.1:8080/api/health

# Systemd timers активны
systemctl list-timers fetcher.timer backup.timer

# Запустить первый фетчер вручную
sudo systemctl start fetcher.service
journalctl -u fetcher.service --since "5 min ago" --no-pager

# Проверить что данные загрузились
docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c \
  "SELECT COUNT(*) FROM matches, competitions, teams;"
```

После того как Cloudflare поднимется, снаружи:

```bash
curl -fsS https://pickthescore.app/api/health
# Ожидаемо: {"status":"healthy","timestamp":"...","version":"1.0.0"}
```

## 7. Decommission AWS

**Только после** стабильной работы Hetzner (несколько дней, бэкапы проверены):

1. AWS Console → DynamoDB → удалить `SoccerGameData`
2. AWS Console → Lambda → удалить `matchFetcher`
3. AWS Console → EventBridge → удалить schedule
4. AWS Console → Lightsail → удалить `score-game`
5. AWS Console → IAM → удалить OIDC provider + role
6. GitHub Secrets → удалить AWS-секреты (см. шаг 1)

---

## Notes

- **Object Storage (S3) — отложено.** Пока бэкапы лежат локально в `/opt/pckthscr/backups/` (5 rolling, age-encrypted, 38 GB диска хватит надолго). Когда понадобится off-site хранение — расширить `backup.sh` через rclone.
- **Avatars** — колонка `users.profile_image` есть, но upload-endpoint пока не сделан. Когда добавим — аватарки тоже могут жить на локальном диске (или в S3 позже).
- **Origin IP защищён**: UFW на `:8080` открыт только для Cloudflare IP-диапазонов, прямой доступ `http://49.13.201.110:8080` снаружи не работает.
