import { useState, useEffect } from 'react';
import { Clock, Droplets, Thermometer, Wind } from 'lucide-react';
import Layout from '@/components/Layout';
import CitySelector from '@/components/CitySelector';
import AQIGauge from '@/components/AQIGauge';
import AQICard from '@/components/AQICard';
import HealthAdvice from '@/components/HealthAdvice';
import PollutantCard from '@/components/PollutantCard';
import TrendChart from '@/components/TrendChart';
import { generateMockAQI, generateHourlyData } from '@/lib/aqi';

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState('New York');
  const [currentAQI, setCurrentAQI] = useState(0);
  const [hourlyData, setHourlyData] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const aqi = generateMockAQI(selectedCity);
    setCurrentAQI(aqi);
    setHourlyData(generateHourlyData(selectedCity));
    setLastUpdated(new Date());
  }, [selectedCity]);

  const pollutants = [
    { name: 'PM2.5', value: Math.floor(currentAQI * 0.4), unit: 'μg/m³', description: 'Fine particulate matter' },
    { name: 'PM10', value: Math.floor(currentAQI * 0.8), unit: 'μg/m³', description: 'Coarse particulate matter' },
    { name: 'O₃', value: Math.floor(currentAQI * 0.3), unit: 'ppb', description: 'Ground-level ozone' },
    { name: 'NO₂', value: Math.floor(currentAQI * 0.2), unit: 'ppb', description: 'Nitrogen dioxide' },
  ];

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
          <CitySelector selectedCity={selectedCity} onCityChange={setSelectedCity} />
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
              <AQIGauge value={currentAQI} />
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
            <TrendChart data={hourlyData} height={200} />
          </AQICard>

          {/* Health Advice */}
          <AQICard 
            title="Health Recommendations" 
            className="lg:col-span-2"
          >
            <HealthAdvice aqi={currentAQI} />
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

        {/* Weather Context */}
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
