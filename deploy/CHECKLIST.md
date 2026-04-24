# Pick The Score — Go-Live Checklist

Пошаговая инструкция для первого деплоя на Hetzner VPS после миграции с AWS.

## 1. GitHub Secrets

В настройках репозитория `Settings → Secrets and variables → Actions` добавить:

| Secret | Назначение |
|---|---|
| `HETZNER_HOST` | IP или hostname Hetzner VPS |
| `HETZNER_USER` | SSH-пользователь на VPS (например `deploy` или `root`) |
| `HETZNER_SSH_KEY` | Приватный SSH-ключ (полный текст, включая `-----BEGIN...` / `-----END...`) для доступа к VPS |

Уже существующие секреты (оставляем как есть):
- `SESSION_PASSWORD`
- `SESSION_COOKIE_NAME`
- `API_KEY`

Удалить старые AWS-секреты после успешного переезда:
- `AWS_ROLE_ARN`
- `LIGHTSAIL_AWS_ACCESS_KEY_ID`
- `LIGHTSAIL_AWS_SECRET_ACCESS_KEY`

## 2. Hetzner Object Storage

В Hetzner Cloud Console создать два S3-совместимых bucket:

| Bucket | Видимость | Назначение |
|---|---|---|
| `pckthscr-avatars` | public-read | User profile images (URL вида `https://<endpoint>/pckthscr-avatars/<user-uuid>.webp`) |
| `pckthscr-backups` | private | Ежедневные pg_dump (age-encrypted) |

Сгенерировать и сохранить Access Key + Secret Key (по одной паре — используется и для app, и для backup). Endpoint зависит от выбранного датацентра, например `https://fsn1.your-objectstorage.com`.

## 3. VPS setup

На Hetzner VPS:

```bash
# 3.1 Директории
sudo mkdir -p /opt/pckthscr/volumes/{postgres-data,caddy-data,caddy-config}
sudo mkdir -p /opt/pckthscr/fetcher
cd /opt/pckthscr

# 3.2 Установить инструменты (на Debian/Ubuntu)
sudo apt update
sudo apt install -y age rclone docker.io docker-compose-plugin curl

# 3.3 .env
# Скопировать шаблон deploy/.env.example из репо, заполнить секреты
sudo nano /opt/pckthscr/.env
sudo chmod 600 /opt/pckthscr/.env

# 3.4 rclone config для Hetzner Object Storage (S3-compatible)
rclone config
#   n (new remote)
#   name: hetzner (должно совпадать с BACKUP_RCLONE_REMOTE в .env)
#   storage: 4 (Amazon S3 Compliant ...)
#   provider: Other
#   env_auth: false
#   access_key_id: <из шага 2>
#   secret_access_key: <из шага 2>
#   region: <регион bucket>
#   endpoint: <endpoint URL без схемы>
#   location_constraint: <регион>
#   acl: private

# 3.5 Проверить
rclone ls hetzner:pckthscr-backups/   # должно ничего не вывести (пустой bucket)
```

## 4. Age-ключ для шифрования бэкапов

```bash
# Сгенерировать ключевую пару
sudo age-keygen -o /opt/pckthscr/.age-key
sudo chmod 600 /opt/pckthscr/.age-key

# Public key (строка вида "age1...") положить в /opt/pckthscr/.env
# как BACKUP_AGE_PUBLIC_KEY=age1...
sudo grep "public key:" /opt/pckthscr/.age-key | awk '{print $NF}'
```

Приватный ключ НЕ должен покидать VPS — без него расшифровать бэкапы нельзя (это фича). Держи копию приватного ключа в надёжном месте (1Password, зашифрованный внешний носитель) чтобы восстановиться если VPS умрёт.

## 5. DNS

Убедиться, что `pickthescore.app` указывает A-записью на IP VPS:

```bash
dig +short pickthescore.app
# должен вернуть IP VPS
```

У тебя это уже настроено.

## 6. Первый деплой

Первый `docker compose up` нужно запустить вручную чтобы Caddy получил TLS-сертификат от Let's Encrypt. Начиная со второго — автоматика через CI.

```bash
cd /opt/pckthscr

# Залогиниться в ghcr.io (нужен GitHub Personal Access Token с read:packages)
echo $GH_TOKEN | docker login ghcr.io -u <github-username> --password-stdin

# Скопировать docker-compose.yml, Caddyfile, systemd units из репо вручную или через git clone
# (первый раз — вручную; потом CI их обновляет)

# Запустить postgres первым, дождаться healthcheck
docker compose up -d postgres
docker compose ps  # должен быть healthy

# Запустить app (применит Prisma миграции при старте)
docker compose up -d app
docker compose logs -f app   # проверить: "✓ Ready in ..."

# Запустить Caddy — получит TLS-сертификат
docker compose up -d caddy
curl https://pickthescore.app/api/health   # должен ответить {"status":"healthy",...}

# Установить systemd units для фетчера и бэкапов
sudo cp /opt/pckthscr/fetcher.service /opt/pckthscr/fetcher.timer \
       /opt/pckthscr/backup.service  /opt/pckthscr/backup.timer \
       /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fetcher.timer backup.timer

# Проверить статус
systemctl status fetcher.timer backup.timer
```

После этого первый push в `main` → GitHub Actions сделает build → push ghcr.io → SSH deploy. Дальше — автоматика.

## 7. Decommission AWS

**Только после** стабильной работы Hetzner (минимум несколько дней без инцидентов, бэкапы проверены):

1. AWS Console → DynamoDB → удалить таблицу `SoccerGameData`
2. AWS Console → Lambda → удалить `matchFetcher` function
3. AWS Console → EventBridge → удалить schedule для matchFetcher
4. AWS Console → Lightsail → Containers → удалить `score-game` service
5. AWS Console → IAM → удалить OIDC provider + роль для GitHub Actions
6. GitHub Secrets → удалить `AWS_ROLE_ARN`, `LIGHTSAIL_AWS_ACCESS_KEY_ID`, `LIGHTSAIL_AWS_SECRET_ACCESS_KEY`

После этого AWS-аккаунт можно закрывать.

---

## Быстрая проверка здоровья после деплоя

```bash
# App reachable?
curl -fsS https://pickthescore.app/api/health

# Fetcher synced данные?
docker compose -f /opt/pckthscr/docker-compose.yml exec postgres \
    psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM matches;"

# Systemd timers работают?
systemctl list-timers fetcher.timer backup.timer

# Последний fetcher run?
journalctl -u fetcher.service -n 20 --no-pager

# Бэкап уехал в Object Storage?
rclone ls hetzner:pckthscr-backups/
```
