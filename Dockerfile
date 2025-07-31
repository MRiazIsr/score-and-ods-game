# Define build arguments at the top
ARG NODE_VERSION=20

# ---------- 1. base deps ------------- #
FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app

# Install base dependencies
RUN apk add --no-cache curl

# ---------- 2. deps (prod only) ------------- #
FROM base AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install production dependencies with cache mount
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev && npm cache clean --force

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

# 3.2 copy source files
COPY . .

# Build Next.js application with secrets mounted
RUN --mount=type=secret,id=session_password \
    --mount=type=secret,id=session_cookie_name \
    --mount=type=secret,id=api_key \
    export SESSION_PASSWORD="$(cat /run/secrets/session_password)" && \
    export SESSION_COOKIE_NAME="$(cat /run/secrets/session_cookie_name)" && \
    export API_KEY="$(cat /run/secrets/api_key)" && \
    echo "Starting build with secrets loaded..." && \
    npm run build

# 3.3 prune dev-deps
RUN npm prune --omit=dev

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
COPY --from=builder --chown=app:app /app/next.config.js ./next.config.js
COPY --from=builder --chown=app:app /app/package.json ./package.json
# ✅ Using standalone build (smaller size)
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static
COPY --from=builder --chown=app:app /app/public ./public

# Verify the build was successful
RUN ls -la .next/ && echo "Build verification complete"

# Health check with appropriate timings
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

USER app
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
# ✅ Для standalone используем server.js вместо npm start
CMD ["node", "server.js"]