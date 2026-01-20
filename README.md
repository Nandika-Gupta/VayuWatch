# VayuWatch - India Air Quality Analytics Platform

A data-driven analytics platform that analyzes air quality trends and surfaces health insights using real-time and historical data for major Indian cities.

![VayuWatch Dashboard](https://img.shields.io/badge/React-18.3-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-teal) ![Supabase](https://img.shields.io/badge/Supabase-Edge_Functions-green)

## 🌍 Overview

VayuWatch monitors air quality across 15+ major Indian cities using CPCB (Central Pollution Control Board) standards. The platform provides real-time AQI data, historical trend analysis, and personalized health recommendations.

## ✨ Features

- **Real-time AQI Monitoring** - Live air quality data for major Indian metros
- **Historical Trend Analysis** - 7-day trends with moving averages
- **Health Insights** - CPCB-based health recommendations
- **Pollutant Breakdown** - PM2.5, PM10, O3, NO2, SO2, CO levels
- **Smart Alerts** - Threshold-based notifications
- **City Comparison** - Compare AQI across multiple cities
- **Dark Mode UI** - Developer-friendly interface

## 🏗️ Project Structure

```
├── src/                          # Frontend Application
│   ├── components/               # React UI Components
│   │   ├── ui/                   # Reusable UI primitives
│   │   ├── AQICard.tsx          # AQI display card
│   │   ├── AQIGauge.tsx         # Visual AQI gauge
│   │   ├── TrendChart.tsx       # Recharts trend visualization
│   │   ├── PollutantCard.tsx    # Individual pollutant display
│   │   └── HealthAdvice.tsx     # Health recommendations
│   ├── pages/                    # Route pages
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── Trends.tsx           # Historical trends
│   │   ├── Insights.tsx         # Health insights
│   │   └── Alerts.tsx           # Alert management
│   ├── hooks/                    # Custom React hooks
│   │   └── useAQI.ts            # AQI data fetching hook
│   ├── lib/                      # Utility functions
│   │   └── aqi.ts               # AQI calculations & helpers
│   └── contexts/                 # React contexts
│       └── AuthContext.tsx      # Authentication state
│
├── supabase/                     # Backend Services
│   └── functions/                # Edge Functions (Serverless)
│       ├── aqi-current/         # Current AQI endpoint
│       ├── aqi-history/         # Historical data endpoint
│       ├── aqi-collect/         # Data collection job
│       └── aqi-seed/            # Database seeding
│
└── public/                       # Static assets
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **React Query** - Server state management
- **React Router** - Client-side routing

### Backend
- **Supabase** - PostgreSQL database + Auth
- **Edge Functions** - Serverless API endpoints (Deno)
- **Row Level Security** - Data protection

### Data Sources
- Real-time AQI data simulation (expandable to CPCB API)
- Weather integration ready
- Historical data storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vayuwatch.git
cd vayuwatch

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/aqi-current` | GET | Current AQI for a city |
| `/aqi-history` | GET | Historical AQI data |
| `/aqi-collect` | POST | Trigger data collection |

### Example Request

```bash
curl "https://your-project.supabase.co/functions/v1/aqi-current?city=Delhi"
```

## 🎨 Design System

VayuWatch uses a custom dark theme optimized for data visualization:

- **AQI Color Coding**: Green (Good) → Maroon (Severe)
- **CPCB Standards**: India-specific thresholds
- **Accessible**: WCAG 2.1 compliant contrast ratios

## 📈 Analytics Features

- **Moving Averages**: 24-hour rolling average
- **Trend Detection**: Improving/Stable/Worsening indicators
- **Health Risk Assessment**: Low/Moderate/High/Severe/Critical
- **Regional Comparison**: City vs national average

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CPCB](https://cpcb.nic.in/) - Air Quality Standards
- [SAFAR](http://safar.tropmet.res.in/) - Air Quality Index Guidelines
- India Meteorological Department

---

**Built with ❤️ for cleaner air in India**
