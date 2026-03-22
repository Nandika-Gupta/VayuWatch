# VayuWatch Workspace

## Overview

VayuWatch is a real-time air quality analytics platform built as a pnpm monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5 + Socket.io
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (ESM bundle)
- **Frontend**: React + Vite + Tailwind CSS v4 + Chart.js

## Structure

```text
workspace/
├── artifacts/
│   ├── api-server/         # Express API + Socket.io server
│   └── vayuwatch/          # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## API Endpoints

- `GET /api/healthz` — Health check
- `GET /api/aqi?city=<name>` — Live AQI data from WAQI API (falls back to demo token if user token is invalid)
- `GET /api/history?city=<name>` — Last 7 days of AQI readings from PostgreSQL

## Real-Time Architecture

- Backend polls WAQI API every 60 seconds for Delhi, Mumbai, Bengaluru
- Readings saved to `aqi_readings` PostgreSQL table
- Socket.io emits `aqi:update` events to all connected clients
- Frontend listens via `socket.io-client` on `path: /api/socket.io`

## Database Schema

### `aqi_readings`
- `id` serial primary key
- `city` text
- `aqi` real
- `dominentpol` text
- `time` text
- `temperature` real (nullable)
- `humidity` real (nullable)
- `created_at` timestamp with timezone

## Environment Variables Required

- `WAQI_TOKEN` — WAQI API token (get free at https://aqicn.org/data-platform/token/)
- `OPENWEATHER_KEY` — OpenWeatherMap API key (get free at https://openweathermap.org/api)
- `DATABASE_URL` — Automatically provided by Replit PostgreSQL

## Notes

- The WAQI token requires email verification after signup. Until verified, the app falls back to the WAQI "demo" token which returns sample data.
- The frontend uses generated React Query hooks from `@workspace/api-client-react`
- Socket.io path is `/api/socket.io` to route through the shared proxy
