# ---------- 1. base image with caching ---------- #
# используем BuildKit   docker buildx build --tag score-game .
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app
ENV NODE_ENV=production
# включаем corepack сразу, чтобы pnpm/yarn были готовы
RUN corepack enable

# ---------- 2. deps layer (prod only) ---------- #
FROM base AS deps
# копируем lock‑файл отдельно – кеш не ломается на каждом коммите
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---------- 3. builder (prod + dev + сборка) --- #
FROM base AS builder
WORKDIR /app

# 3.1 install **all** deps (prod+dev)
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 3.2 copy source & build
COPY . .
RUN npm run build

# 3.3 prune dev‑deps, останутся только prod
RUN npm prune --omit=dev

# ---------- 4. runtime image ------------- #
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
RUN addgroup -S app && adduser -S -G app app

# среды
ENV NODE_ENV=production
ENV PORT=3000

# скопировать node_modules (prod‑deps) и built output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER app
EXPOSE 3000
CMD ["npm", "start"]
