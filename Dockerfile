# ---------- 1. base image with caching ---------- #
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install necessary packages for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable

# ---------- 2. deps layer (prod only) ---------- #
FROM base AS deps
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

# ---------- 3. builder (prod + dev + build) --- #
FROM base AS builder
WORKDIR /app

# Accept build args BEFORE using them
ARG SESSION_PASSWORD
ARG SESSION_COOKIE_NAME
ARG API_KEY
ARG TABLE_NAME

# Set all required environment variables for Next.js build
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    SESSION_PASSWORD=${SESSION_PASSWORD} \
    SESSION_COOKIE_NAME=${SESSION_COOKIE_NAME} \
    API_KEY=${API_KEY} \
    TABLE_NAME=${TABLE_NAME} \
    AWS_TABLE_NAME=${TABLE_NAME} \
    DB_TYPE=dynamodb \
    AWS_REGION=eu-central-1 \
    API_URL=https://api.football-data.org/v4

# 3.1 install **all** deps (prod+dev)
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# 3.2 copy source & build
COPY . .

# Debug: Show environment variables (remove in production)
RUN echo "Build environment variables:" && \
    echo "NODE_ENV=$NODE_ENV" && \
    echo "TABLE_NAME=$TABLE_NAME" && \
    echo "AWS_TABLE_NAME=$AWS_TABLE_NAME" && \
    echo "SESSION_COOKIE_NAME is set: $(if [ -n "$SESSION_COOKIE_NAME" ]; then echo "YES"; else echo "NO"; fi)"

# Build Next.js application
RUN npm run build

# 3.3 prune dev-deps, only prod deps remain
RUN npm prune --omit=dev

# ---------- 4. runtime image ------------- #
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

# Install dumb-init for proper process handling
RUN apk add --no-cache dumb-init && \
    addgroup -S app && adduser -S -G app app

# Set runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    NEXT_TELEMETRY_DISABLED=1

# Accept runtime args and set as environment variables
ARG SESSION_PASSWORD
ARG SESSION_COOKIE_NAME
ARG API_KEY
ARG TABLE_NAME

ENV SESSION_PASSWORD=${SESSION_PASSWORD} \
    SESSION_COOKIE_NAME=${SESSION_COOKIE_NAME} \
    API_KEY=${API_KEY} \
    TABLE_NAME=${TABLE_NAME} \
    AWS_TABLE_NAME=${TABLE_NAME} \
    DB_TYPE=dynamodb \
    AWS_REGION=eu-central-1

# Copy built application from builder stage
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/.next ./.next
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/package.json ./package.json

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

USER app
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]