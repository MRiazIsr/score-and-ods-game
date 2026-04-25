# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

# ──────────────────────────────────────────────────────────────────────────────
# 1. deps — install all npm deps (prod + dev), needed for build.
#    libc6-compat + openssl cover Prisma engines on Alpine.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl python3 make g++
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# ──────────────────────────────────────────────────────────────────────────────
# 2. builder — prisma generate + next build + fetcher bundle.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Prisma generate — produces .prisma/client and @prisma/client types.
RUN npx prisma generate

# Build Next.js (secrets forwarded via build args — only needed at compile time
# for iron-session password validation).
RUN --mount=type=secret,id=session_password \
    --mount=type=secret,id=session_cookie_name \
    --mount=type=secret,id=api_key \
    --mount=type=secret,id=next_public_telegram_bot_username \
    export SESSION_PASSWORD="$(cat /run/secrets/session_password)" && \
    export SESSION_COOKIE_NAME="$(cat /run/secrets/session_cookie_name)" && \
    export API_KEY="$(cat /run/secrets/api_key)" && \
    export NEXT_PUBLIC_TELEGRAM_BOT_USERNAME="$(cat /run/secrets/next_public_telegram_bot_username 2>/dev/null || echo '')" && \
    npm run build

# Bundle fetcher to a single node-compatible .js file.
RUN npm run fetcher:build

# ──────────────────────────────────────────────────────────────────────────────
# 3. runtime — minimal image running Next.js server + carries fetcher binary.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
RUN apk add --no-cache dumb-init curl libc6-compat openssl && \
    addgroup -S app && adduser -S -G app app

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1

# Next.js standalone output — includes minimal runtime deps.
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public

# Prisma: schema + migrations for `migrate deploy` at container start.
COPY --from=builder --chown=app:app /app/prisma ./prisma

# Prisma generated client is NOT auto-traced by Next.js standalone — copy explicitly.
COPY --from=builder --chown=app:app /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=app:app /app/node_modules/@prisma ./node_modules/@prisma

# Prisma CLI binary for `migrate deploy` (bundled via npx).
COPY --from=builder --chown=app:app /app/node_modules/prisma ./node_modules/prisma

# argon2 native binding + its runtime deps — NOT auto-traced by Next.js standalone.
# argon2 uses prebuilt binaries from its own `prebuilds/` dir, loaded via node-gyp-build;
# @phc/format is used for hash serialization. node-addon-api is build-time only (nested).
COPY --from=builder --chown=app:app /app/node_modules/argon2 ./node_modules/argon2
COPY --from=builder --chown=app:app /app/node_modules/node-gyp-build ./node_modules/node-gyp-build
COPY --from=builder --chown=app:app /app/node_modules/@phc ./node_modules/@phc

# Bundled fetcher + its external dep `axios` (marked external by esbuild).
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --from=builder --chown=app:app /app/node_modules/axios ./node_modules/axios
COPY --from=builder --chown=app:app /app/node_modules/follow-redirects ./node_modules/follow-redirects
COPY --from=builder --chown=app:app /app/node_modules/form-data ./node_modules/form-data
COPY --from=builder --chown=app:app /app/node_modules/proxy-from-env ./node_modules/proxy-from-env

COPY --from=builder --chown=app:app /app/package.json ./package.json

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

USER app
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
# Apply pending Prisma migrations, then start Next.js.
# If migrate fails, container exits — old container keeps serving.
CMD ["sh", "-c", "node node_modules/prisma/build/index.js migrate deploy && node server.js"]
