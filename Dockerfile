# ---------- 1. base image with caching ---------- #
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

ARG SESSION_PASSWORD
ARG SESSION_COOKIE_NAME
ARG API_KEY
ARG TABLE_NAME
ENV SESSION_PASSWORD=$SESSION_PASSWORD \
    SESSION_COOKIE_NAME=$SESSION_COOKIE_NAME \
    API_KEY=$API_KEY \
    TABLE_NAME=$TABLE_NAME


RUN corepack enable

# ---------- 2. deps layer (prod only) ---------- #
FROM base AS deps
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

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

USER app
EXPOSE 3000
CMD ["npm", "start"]
