import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Layout from '@/components/Layout';
import CitySelector from '@/components/CitySelector';
import AQICard from '@/components/AQICard';
import TrendChart from '@/components/TrendChart';
import { generateHistoricalData, getAQIInfo } from '@/lib/aqi';
import { cn } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const Trends = () => {
  const [selectedCity, setSelectedCity] = useState('New York');
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  useEffect(() => {
    setHistoricalData(generateHistoricalData(selectedCity, timeRange));
  }, [selectedCity, timeRange]);

  const getBarColor = (aqi: number) => {
    const info = getAQIInfo(aqi);
    return info.color;
  };

  // Calculate trend
  const calculateTrend = () => {
    if (historicalData.length < 2) return { direction: 'stable', change: 0 };
    
    const recentAvg = historicalData.slice(-3).reduce((a, b) => a + b.aqi, 0) / 3;
    const oldAvg = historicalData.slice(0, 3).reduce((a, b) => a + b.aqi, 0) / 3;
    const change = ((recentAvg - oldAvg) / oldAvg) * 100;
    
    if (change > 5) return { direction: 'up', change: Math.round(change) };
    if (change < -5) return { direction: 'down', change: Math.round(Math.abs(change)) };
    return { direction: 'stable', change: 0 };
  };

  const trend = calculateTrend();
  
  const avgAQI = historicalData.length 
    ? Math.round(historicalData.reduce((a, b) => a + b.aqi, 0) / historicalData.length)
    : 0;
    
  const maxAQI = historicalData.length 
    ? Math.max(...historicalData.map(d => d.aqi))
    : 0;
    
  const minAQI = historicalData.length 
    ? Math.min(...historicalData.map(d => d.aqi))
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const info = getAQIInfo(data.aqi);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">AQI:</span>
              <span className="font-medium" style={{ color: info.color }}>{data.aqi}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">PM2.5:</span>
              <span className="font-medium">{data.pm25} μg/m³</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">PM10:</span>
              <span className="font-medium">{data.pm10} μg/m³</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-muted-foreground">O₃:</span>
              <span className="font-medium">{data.o3} ppb</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Air Quality Trends</h1>
            <p className="text-muted-foreground mt-1">
              Historical data and patterns for {selectedCity}
            </p>
          </div>
          <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="flex bg-muted rounded-lg p-1">
            {[7, 14, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTimeRange(days as 7 | 14 | 30)}
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  timeRange === days 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <AQICard title="Average AQI">
            <p className="text-3xl font-bold text-foreground">{avgAQI}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {getAQIInfo(avgAQI).label}
            </p>
          </AQICard>
          
          <AQICard title="Peak AQI">
            <p className="text-3xl font-bold text-foreground">{maxAQI}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Highest recorded
            </p>
          </AQICard>
          
          <AQICard title="Lowest AQI">
            <p className="text-3xl font-bold text-foreground">{minAQI}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Best air quality
            </p>
          </AQICard>
          
          <AQICard title="Trend">
            <div className="flex items-center gap-2">
              {trend.direction === 'up' && (
                <TrendingUp className="h-6 w-6 text-aqi-unhealthy" />
              )}
              {trend.direction === 'down' && (
                <TrendingDown className="h-6 w-6 text-aqi-good" />
              )}
              {trend.direction === 'stable' && (
                <Minus className="h-6 w-6 text-muted-foreground" />
              )}
              <p className="text-3xl font-bold text-foreground">
                {trend.direction === 'stable' ? 'Stable' : `${trend.change}%`}
              </p>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {trend.direction === 'up' && 'Worsening'}
              {trend.direction === 'down' && 'Improving'}
              {trend.direction === 'stable' && 'No significant change'}
            </p>
          </AQICard>
        </div>

        {/* Line Chart */}
        <AQICard title="AQI Over Time">
          <TrendChart data={historicalData} height={350} />
        </AQICard>

        {/* Bar Chart */}
        <AQICard title="Daily Comparison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={historicalData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="aqi" radius={[4, 4, 0, 0]}>
                {historicalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.aqi)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </AQICard>
      </div>
    </Layout>
  );
};

export default Trends;
