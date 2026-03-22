# VayuWatch 🌿

A real-time air quality analytics platform that tracks AQI (Air Quality Index) data for cities around the world, with live updates, historical trends, and health recommendations.

![VayuWatch Dashboard](https://img.shields.io/badge/status-live-brightgreen) ![Node.js](https://img.shields.io/badge/Node.js-24-green) ![React](https://img.shields.io/badge/React-19-blue) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue)

---

## Features

- **Live AQI Data** — Fetches real-time air quality readings from the [World Air Quality Index (WAQI)](https://waqi.info/) API
- **City Search** — Track any city in the world by name
- **Real-Time Push Updates** — Socket.io broadcasts new readings every 60 seconds without page refresh
- **7-Day History Chart** — Visualises AQI trends over the past week using Chart.js
- **Health Recommendations** — Contextual advice based on the current AQI level
- **Weather Data** — Temperature and humidity from OpenWeatherMap
- **Dark Green Theme** — Clean, air-inspired UI with dynamic AQI color coding

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, Chart.js |
| Backend | Node.js 24, Express 5, Socket.io |
| Database | PostgreSQL + Drizzle ORM |
| API | WAQI API, OpenWeatherMap API |
| Monorepo | pnpm workspaces, TypeScript |
| Code Gen | Orval (OpenAPI → React Query hooks + Zod schemas) |

---

## Project Structure

```
vayuwatch/
├── artifacts/
│   ├── api-server/        # Express REST API + Socket.io server
│   └── vayuwatch/         # React + Vite frontend
├── lib/
│   ├── api-spec/          # OpenAPI 3.0 specification
│   ├── api-client-react/  # Generated React Query hooks (via Orval)
│   ├── api-zod/           # Generated Zod validation schemas
│   └── db/                # Drizzle ORM schema + PostgreSQL connection
└── pnpm-workspace.yaml
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/VayuWatch.git
cd VayuWatch

# Install dependencies
pnpm install

# Push the database schema
pnpm --filter @workspace/db run db:push
```

### Environment Variables

Create a `.env` file or set these in your environment:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
WAQI_TOKEN=your_waqi_api_token        # https://aqicn.org/data-platform/token/
OPENWEATHER_KEY=your_openweather_key  # https://openweathermap.org/api
PORT=8080
```

> **Note:** The WAQI token requires email verification after signup.

### Running Locally

```bash
# Start the API server
pnpm --filter @workspace/api-server run dev

# Start the frontend (in a separate terminal)
pnpm --filter @workspace/vayuwatch run dev
```

