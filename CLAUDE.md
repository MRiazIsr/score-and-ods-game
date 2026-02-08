how# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TJ Score Game — a football prediction web app. Users browse competitions, view matches by matchday, and submit score predictions. Built with Next.js 15 App Router, React 19, TypeScript, TailwindCSS, and Shadcn/ui.

## Commands

```bash
npm install                # Install dependencies
docker-compose up -d       # Start local PostgreSQL (port 5435) and DynamoDB (port 8000)
npx prisma generate        # Generate Prisma client after schema changes
npx prisma migrate dev     # Run database migrations
npm run dev                # Start dev server with Turbopack
npm run dev-no-turbo       # Start dev server without Turbopack
npm run build              # Production build
npm run lint               # ESLint
npm run test-data-fetcher  # Run Lambda data fetcher test
npm run deploy:lambda      # Deploy Lambda functions via Serverless Framework
```

## Architecture

### Hybrid Database Design

The app uses **two databases**:
- **PostgreSQL** (via Prisma) — stores users, leagues, league memberships, and predictions
- **DynamoDB** — stores football competition data fetched from the Football-Data.org API v4 (matches, standings, scorers)

An AWS Lambda (`src/lambdas/competitionsDataFetcher/matchFetcher.ts`) runs hourly to sync competition data from the API into DynamoDB.

### Factory Pattern for Database Abstraction

The backend uses a factory pattern to abstract database access, controlled by `DB_TYPE` env var (`postgres` or `dynamodb`):

```
Server Actions → Services → Factory Selector → Manager (implements interface)
```

Key interfaces:
- `ICompetitionsFactory` / `IAuthFactory` — create managers and services
- `ICompetitionsManager` / `IUserManager` — define business logic contracts

Implementations:
- `PrismaCompetitionsFactory` / `PrismaAuthFactory` — PostgreSQL path
- `DynamoDbCompetitionsFactory` / `DynamoDbAuthFactory` — DynamoDB path

Note: Even the Prisma path uses `DynamoDbCompetitionsDataAccess` for match data, since competition data always lives in DynamoDB. The factory pattern primarily controls where user/auth data is stored.

### Request Flow

```
Page/Client Component
  → Server Action (src/app/actions/)
    → Service (src/app/server/services/)
      → Factory (src/app/server/modules/factories/)
        → Manager (src/app/server/modules/competitions/ or user/)
          → DataAccess / Prisma Client
```

### Route Structure

- `/login`, `/signup` — public auth pages
- `/(protected)/` — layout wrapper that validates iron-session before rendering
  - `/home` — competition listing
  - `/competition/[id]` — matches for a competition with matchday tabs
  - `/scoreboard` — prediction leaderboard

### Authentication

Cookie-based sessions using `iron-session`. Passwords hashed with MD5 + random salt (`ts-md5`). Session config and Zod validation schemas in `src/app/lib/auth/`.

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Key Conventions

- UI components use Shadcn/ui (style: "new-york") with Radix UI primitives — component source lives in `src/components/ui/`
- Forms use `react-hook-form` with `zod` schema validation
- Server-side data mutations use Next.js Server Actions (not API routes)
- Dark/light mode via `next-themes` with CSS variable-based theming
- The `src/app/server/` directory contains all backend logic (entities, models, modules, services) — it is not a separate server

## Agent Knowledge

Reference docs for API integration and UI design live in `.agent/knowledge/`:
- `api_football_v4.md` — Football-Data.org API v4 endpoints, DynamoDB key schema, rate limiting, enums, error codes ([Official Docs](https://docs.football-data.org/general/v4/resources.html))
- `match_card_ui_design.md` — MatchCard/MatchDetailsModal component architecture and form guide calculation
