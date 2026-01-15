import { useState, useEffect } from 'react';
import { Clock, Droplets, Thermometer, Wind, RefreshCw, Database } from 'lucide-react';
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

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: cities } = useCities();
  
  // Get preferred city name from profile or default to New York
  const preferredCityName = cities?.find(c => c.id === profile?.preferred_city_id)?.name || 'New York';
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
  const { data: historyData, isLoading: isLoadingHistory, refetch: refetchHistory } = useAQIHistory(selectedCity, 1);

  const currentAQI = currentData?.current?.aqi || 0;
  const lastUpdated = currentData?.current?.recorded_at ? new Date(currentData.current.recorded_at) : new Date();

  // Generate hourly data from the latest readings or mock if no data
  const hourlyData = historyData?.history?.length 
    ? historyData.history.map((h, i) => ({ hour: `${i * 6}:00`, aqi: h.aqi }))
    : Array.from({ length: 24 }, (_, i) => ({
        hour: i.toString().padStart(2, '0') + ':00',
        aqi: Math.max(0, Math.min(500, currentAQI + Math.sin((i / 24) * Math.PI * 2) * 15 + (Math.random() * 10 - 5))),
      }));

  const pollutants = currentData?.current ? [
    { name: 'PM2.5', value: currentData.current.pm25, unit: 'μg/m³', description: 'Fine particulate matter' },
    { name: 'PM10', value: currentData.current.pm10, unit: 'μg/m³', description: 'Coarse particulate matter' },
    { name: 'O₃', value: currentData.current.o3, unit: 'ppb', description: 'Ground-level ozone' },
    { name: 'NO₂', value: currentData.current.no2, unit: 'ppb', description: 'Nitrogen dioxide' },
  ] : [
    { name: 'PM2.5', value: 0, unit: 'μg/m³', description: 'Fine particulate matter' },
    { name: 'PM10', value: 0, unit: 'μg/m³', description: 'Coarse particulate matter' },
    { name: 'O₃', value: 0, unit: 'ppb', description: 'Ground-level ozone' },
    { name: 'NO₂', value: 0, unit: 'ppb', description: 'Nitrogen dioxide' },
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
            <h1 className="text-2xl font-bold text-foreground">Air Quality Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Real-time air quality monitoring for {selectedCity}
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
              <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Updated {lastUpdated.toLocaleTimeString()}</span>
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
        <AQICard title="Pollutant Breakdown">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pollutants.map((pollutant) => (
              <PollutantCard key={pollutant.name} {...pollutant} />
            ))}
          </div>
        </AQICard>

        {/* Weather Context - Placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <AQICard title="Temperature" icon={<Thermometer className="h-4 w-4" />}>
            <p className="text-3xl font-bold text-foreground">72°F</p>
            <p className="text-sm text-muted-foreground mt-1">Feels like 74°F</p>
          </AQICard>
          
          <AQICard title="Humidity" icon={<Droplets className="h-4 w-4" />}>
            <p className="text-3xl font-bold text-foreground">58%</p>
            <p className="text-sm text-muted-foreground mt-1">Comfortable levels</p>
          </AQICard>
          
          <AQICard title="Wind" icon={<Wind className="h-4 w-4" />}>
            <p className="text-3xl font-bold text-foreground">8 mph</p>
            <p className="text-sm text-muted-foreground mt-1">NW direction</p>
          </AQICard>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
