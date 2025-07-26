# syntax=docker/dockerfile:1

##################  deps  ##################
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package*.json ./
RUN npm ci

##################  build  #################
FROM --platform=${BUILDPLATFORM:-linux/amd64} node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm prune --omit=dev

##################  runtime  ##############
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NEXT_TELEMETRY_DISABLED=1
RUN addgroup -S app && adduser -S -G app app
USER app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "server.js"]
