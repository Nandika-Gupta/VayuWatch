import { useState, useEffect } from 'react';
import { Clock, Droplets, Thermometer, Wind, RefreshCw, Database, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import Layout from '@/components/Layout';
import CitySelector from '@/components/CitySelector';
import AQIGauge from '@/components/AQIGauge';
import AQICard from '@/components/AQICard';
import HealthAdvice from '@/components/HealthAdvice';
import PollutantCard from '@/components/PollutantCard';
import TrendChart from '@/components/TrendChart';
import { Button } from '@/components/ui/button';
import { useCurrentAQI, useAQIHistory, useCities, seedHistoricalData } from '@/hooks/useAQI';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { calculateMovingAverage, calculateTrendDirection, getHealthRisk } from '@/lib/aqi';

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: cities } = useCities();
  
  // Get preferred city name from profile or default to Delhi
  const preferredCityName = cities?.find(c => c.id === profile?.preferred_city_id)?.name || 'Delhi';
  const [selectedCity, setSelectedCity] = useState(preferredCityName);
  const [isSeeding, setIsSeeding] = useState(false);
  
  // Update selected city when preferred city changes
  useEffect(() => {
    if (profile?.preferred_city_id && cities) {
      const city = cities.find(c => c.id === profile.preferred_city_id);
      if (city) {
        setSelectedCity(city.name);
      }
    }
  }, [profile?.preferred_city_id, cities]);
  
  const { data: currentData, isLoading: isLoadingCurrent, refetch: refetchCurrent } = useCurrentAQI(selectedCity);
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useAQIHistory(selectedCity, 7);

  const currentAQI = currentData?.current?.aqi || 0;
  const previousAQI = currentData?.previous?.aqi || currentAQI;
  const lastUpdated = currentData?.current?.recorded_at ? new Date(currentData.current.recorded_at) : new Date();

  // Calculate analytics
  const aqiValues = historyData?.history?.map(h => h.aqi) || [];
  const movingAvg = calculateMovingAverage(aqiValues, 3);
  const trendDirection = calculateTrendDirection(aqiValues);
  const healthRisk = getHealthRisk(currentAQI);
  const dayChange = currentAQI - previousAQI;
  const dayChangePercent = previousAQI ? ((dayChange / previousAQI) * 100).toFixed(1) : '0';

  // Generate hourly data from the latest readings or mock if no data
  const hourlyData = historyData?.history?.length 
    ? historyData.history.map((h, i) => ({ hour: `${i * 6}:00`, aqi: h.aqi }))
    : Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        aqi: Math.max(0, Math.min(500, currentAQI + Math.sin((i / 24) * Math.PI * 2) * 15 + (Math.random() * 10 - 5))),
      }));

  const pollutants = currentData?.current ? [
    { name: 'PM2.5', value: currentData.current.pm25, unit: 'μg/m³', description: 'Fine particles < 2.5μm' },
    { name: 'PM10', value: currentData.current.pm10, unit: 'μg/m³', description: 'Coarse particles < 10μm' },
    { name: 'O₃', value: currentData.current.o3, unit: 'ppb', description: 'Ground-level ozone' },
    { name: 'NO₂', value: currentData.current.no2, unit: 'ppb', description: 'Nitrogen dioxide' },
    { name: 'SO₂', value: currentData.current.so2, unit: 'ppb', description: 'Sulphur dioxide' },
    { name: 'CO', value: currentData.current.co, unit: 'mg/m³', description: 'Carbon monoxide' },
  ] : [
    { name: 'PM2.5', value: 0, unit: 'μg/m³', description: 'Fine particles < 2.5μm' },
    { name: 'PM10', value: 0, unit: 'μg/m³', description: 'Coarse particles < 10μm' },
    { name: 'O₃', value: 0, unit: 'ppb', description: 'Ground-level ozone' },
    { name: 'NO₂', value: 0, unit: 'ppb', description: 'Nitrogen dioxide' },
    { name: 'SO₂', value: 0, unit: 'ppb', description: 'Sulphur dioxide' },
    { name: 'CO', value: 0, unit: 'mg/m³', description: 'Carbon monoxide' },
  ];

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const result = await seedHistoricalData(30);
      toast.success(`Seeded ${result.readings_count} historical readings for ${result.cities_count} cities`);
      refetchCurrent();
      refetchHistory();
    } catch (error) {
      toast.error('Failed to seed historical data');
      console.error(error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleRefresh = () => {
    refetchCurrent();
    refetchHistory();
    toast.success('Data refreshed');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-mono">
              <span className="text-primary">{'<'}</span>AQI Dashboard<span className="text-primary">{'/>'}</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time air quality analytics for <span className="text-foreground font-medium">{selectedCity}</span>, India
            </p>
          </div>
          <div className="flex items-center gap-2">
            <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
            <Button variant="outline" size="icon" onClick={handleRefresh} title="Refresh data">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Seed Data Button - Show if no history */}
        {!isLoadingHistory && (!historyData?.history || historyData.history.length === 0) && (
          <div className="bg-accent/50 border border-border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">No historical data found</p>
              <p className="text-sm text-muted-foreground">Seed 30 days of sample data to see trends and charts.</p>
            </div>
            <Button onClick={handleSeedData} disabled={isSeeding} className="gap-2">
              <Database className="h-4 w-4" />
              {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
            </Button>
          </div>
        )}

        {/* Analytics Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AQICard title="Health Risk" className="text-center">
            <div className={`text-2xl font-bold ${healthRisk.color}`}>
              {healthRisk.icon} {healthRisk.level}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current risk level</p>
          </AQICard>
          
          <AQICard title="24h Change" className="text-center">
            <div className="flex items-center justify-center gap-1">
              {dayChange > 0 ? (
                <TrendingUp className="h-5 w-5 text-aqi-unhealthy" />
              ) : dayChange < 0 ? (
                <TrendingDown className="h-5 w-5 text-aqi-good" />
              ) : (
                <Minus className="h-5 w-5 text-muted-foreground" />
              )}
              <span className={`text-2xl font-bold ${dayChange > 0 ? 'text-aqi-unhealthy' : dayChange < 0 ? 'text-aqi-good' : 'text-foreground'}`}>
                {dayChange > 0 ? '+' : ''}{dayChange}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{dayChangePercent}% vs yesterday</p>
          </AQICard>
          
          <AQICard title="7-Day Trend" className="text-center">
            <div className="flex items-center justify-center gap-2">
              {trendDirection === 'improving' && <TrendingDown className="h-5 w-5 text-aqi-good" />}
              {trendDirection === 'worsening' && <TrendingUp className="h-5 w-5 text-aqi-unhealthy" />}
              {trendDirection === 'stable' && <Minus className="h-5 w-5 text-muted-foreground" />}
              <span className={`text-lg font-bold capitalize ${
                trendDirection === 'improving' ? 'text-aqi-good' : 
                trendDirection === 'worsening' ? 'text-aqi-unhealthy' : 'text-foreground'
              }`}>
                {trendDirection}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Weekly pattern</p>
          </AQICard>
          
          <AQICard title="Moving Avg (3-day)" className="text-center">
            <div className="text-2xl font-bold text-primary font-mono">
              {movingAvg.length > 0 ? movingAvg[movingAvg.length - 1] : '--'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Smoothed AQI</p>
          </AQICard>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AQI Gauge Card */}
          <AQICard 
            title="Current AQI" 
            className="lg:row-span-2 flex flex-col"
            icon={<Wind className="h-4 w-4" />}
          >
            <div className="flex-1 flex flex-col items-center justify-center py-4">
              {isLoadingCurrent ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : (
                <AQIGauge value={currentAQI} />
              )}
              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground font-mono">
                <Clock className="h-4 w-4" />
                <span>Updated {lastUpdated.toLocaleTimeString('en-IN')}</span>
              </div>
            </div>
          </AQICard>

          {/* Today's Trend */}
          <AQICard 
            title="Today's Trend" 
            className="lg:col-span-2"
            icon={<Clock className="h-4 w-4" />}
          >
            {isLoadingHistory ? (
              <Skeleton className="h-[200px] w-full" />
            ) : (
              <TrendChart data={hourlyData} height={200} />
            )}
          </AQICard>

          {/* Health Advice */}
          <AQICard 
            title="Health Recommendations" 
            className="lg:col-span-2"
          >
            {isLoadingCurrent ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <HealthAdvice aqi={currentAQI} />
            )}
          </AQICard>
        </div>

        {/* Pollutants Grid */}
        <AQICard title="Pollutant Breakdown (CPCB Standards)">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pollutants.map((pollutant) => (
              <PollutantCard key={pollutant.name} {...pollutant} />
            ))}
          </div>
        </AQICard>

        {/* India-specific context */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AQICard title="Regional Context" icon={<AlertTriangle className="h-4 w-4" />}>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{selectedCity}</span> is monitored by CPCB 
                (Central Pollution Control Board) with real-time data from CAAQMS stations.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-muted rounded text-xs font-mono">NAQI: {currentAQI}</span>
                <span className="px-2 py-1 bg-muted rounded text-xs font-mono">PM2.5 Primary</span>
              </div>
            </div>
          </AQICard>
          
          <AQICard title="SAFAR Guidelines" icon={<Wind className="h-4 w-4" />}>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Based on India's SAFAR (System of Air Quality and Weather Forecasting) standards.</p>
              <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold text-foreground">6</div>
                  <div className="text-xs">Pollutants</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold text-foreground">500</div>
                  <div className="text-xs">Max Scale</div>
                </div>
                <div className="p-2 bg-muted rounded">
                  <div className="text-lg font-bold text-foreground">6</div>
                  <div className="text-xs">Categories</div>
                </div>
              </div>
            </div>
          </AQICard>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
