# ---------- 1. base image with caching ---------- #
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Don't set secrets as ARGs, will move to runtime
RUN corepack enable

# ---------- 2. deps layer (prod only) ---------- #
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---------- 3. builder (prod + dev + сборка) --- #
FROM base AS builder
WORKDIR /app

# Accept build args
ARG SESSION_PASSWORD
ARG SESSION_COOKIE_NAME
ARG API_KEY
ARG TABLE_NAME

# Set environment variables for the build process
ENV SESSION_PASSWORD=$SESSION_PASSWORD \
    SESSION_COOKIE_NAME=$SESSION_COOKIE_NAME \
    API_KEY=$API_KEY \
    TABLE_NAME=$TABLE_NAME \
    AWS_TABLE_NAME=$TABLE_NAME \
    NODE_ENV=production

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

# Install dumb-init for proper process handling
RUN apk add --no-cache dumb-init && \
    addgroup -S app && adduser -S -G app app

# Set runtime environment variables (secrets will be passed at runtime)
ENV NODE_ENV=production \
    PORT=3000

# These are configuration variables, not secrets, set at runtime
ARG SESSION_PASSWORD
ARG SESSION_COOKIE_NAME
ARG API_KEY
ARG TABLE_NAME
ENV SESSION_PASSWORD=$SESSION_PASSWORD \
    SESSION_COOKIE_NAME=$SESSION_COOKIE_NAME \
    API_KEY=$API_KEY \
    TABLE_NAME=$TABLE_NAME \
    AWS_TABLE_NAME=$TABLE_NAME

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER app
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]