# ---------- 1. base image with caching ---------- #
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim AS base
WORKDIR /app

# Install necessary packages for build
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    curl \
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

# Accept non-sensitive build args only
ARG TABLE_NAME=SoccerGameData

# Set non-sensitive environment variables for Next.js build
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    TABLE_NAME=${TABLE_NAME} \
    AWS_TABLE_NAME=${TABLE_NAME} \
    DB_TYPE=dynamodb \
    AWS_REGION=eu-central-1 \
    API_URL=https://api.football-data.org/v4

# 3.1 install **all** deps (prod+dev) with clean install
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --include=dev

# Verify Next.js and TypeScript installation
RUN ls -la node_modules/.bin/ | grep next || echo "Next.js not found in .bin"
RUN ls -la node_modules/next/ || echo "Next.js not found in node_modules"
RUN ls -la node_modules/typescript/ || echo "TypeScript not found in node_modules"

# 3.2 copy source files
COPY . .

# Debug: Show what's available (убираем проблемную проверку tsc)
RUN echo "Checking Next.js installation..." && \
    npx next --version && \
    echo "Checking TypeScript installation..." && \
    ls -la node_modules/.bin/tsc && \
    node_modules/.bin/tsc --version && \
    echo "Build environment variables:" && \
    echo "NODE_ENV=$NODE_ENV" && \
    echo "TABLE_NAME=$TABLE_NAME" && \
    echo "AWS_TABLE_NAME=$AWS_TABLE_NAME"

# Build Next.js application with secrets mounted (not stored in image)
RUN --mount=type=secret,id=session_password \
    --mount=type=secret,id=session_cookie_name \
    --mount=type=secret,id=api_key \
    export SESSION_PASSWORD="$(cat /run/secrets/session_password)" && \
    export SESSION_COOKIE_NAME="$(cat /run/secrets/session_cookie_name)" && \
    export API_KEY="$(cat /run/secrets/api_key)" && \
    echo "Starting build with secrets loaded..." && \
    npm run build

# 3.3 prune dev-deps, но оставляем typescript для runtime (Next.js нужен для .ts config)
RUN npm prune --omit=dev && npm install typescript --save

# ---------- 4. runtime image ------------- #
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app

# Install dumb-init and curl for proper process handling and health checks
RUN apk add --no-cache dumb-init curl && \
    addgroup -S app && adduser -S -G app app

# Set non-sensitive runtime environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1 \
    DB_TYPE=dynamodb \
    AWS_REGION=eu-central-1

# Accept non-sensitive runtime args
ARG TABLE_NAME=SoccerGameData
ENV TABLE_NAME=${TABLE_NAME} \
    AWS_TABLE_NAME=${TABLE_NAME}

# Copy built application from builder stage
COPY --from=builder --chown=app:app /app/next.config.ts ./next.config.ts
COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/.next ./.next
COPY --from=builder --chown=app:app /app/public ./public
COPY --from=builder --chown=app:app /app/package.json ./package.json

# Verify the build was successful
RUN ls -la .next/ && echo "Build verification complete"

# Add healthcheck with longer timeouts для решения проблемы с медленным стартом
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

USER app
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]