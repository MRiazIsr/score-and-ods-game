# ───────────── deps ─────────────
FROM node:20-alpine AS deps
WORKDIR /app

RUN addgroup -S app && adduser -S -G app app
RUN corepack enable

COPY package*.json ./
RUN npm ci --production=false            # ставим всё для сборки

# ─────────── builder ────────────
FROM node:20-alpine AS builder
WORKDIR /app

ARG SESSION_PASSWORD=build_placeholder
ARG SESSION_COOKIE_NAME=sid
ARG DB_TYPE=Dynamo
ARG TABLE_NAME=SoccerGameData
ARG API_KEY=build_placeholder
ARG AWS_REGION=eu-central-1
ARG AWS_TABLE_NAME=SoccerGameData

ENV SESSION_PASSWORD=${SESSION_PASSWORD} \
    SESSION_COOKIE_NAME=${SESSION_COOKIE_NAME} \
    DB_TYPE=${DB_TYPE} \
    TABLE_NAME=${TABLE_NAME} \
    API_KEY=${API_KEY} \
    AWS_REGION=${AWS_REGION} \
    AWS_TABLE_NAME=${AWS_TABLE_NAME}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build                       # ← больше не падает
RUN npm prune --omit=dev

# ─────────── runner ─────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

ENV SESSION_PASSWORD=${SESSION_PASSWORD} \
    SESSION_COOKIE_NAME=${SESSION_COOKIE_NAME} \
    DB_TYPE=${DB_TYPE} \
    TABLE_NAME=${TABLE_NAME} \
    API_KEY=${API_KEY} \
    AWS_REGION=${AWS_REGION} \
    AWS_TABLE_NAME=${AWS_TABLE_NAME}

COPY --from=builder /app ./
USER app
EXPOSE 3000
CMD ["npm", "start"]
