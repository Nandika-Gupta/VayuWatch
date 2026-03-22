import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { AqiCard } from '@/components/AqiCard';
import { HealthPanel } from '@/components/HealthPanel';
import { HistoryChart } from '@/components/HistoryChart';
import { useAppAqi } from '@/hooks/use-app-aqi';
import { AlertCircle, Loader2 } from 'lucide-react';

export function Dashboard() {
  const [city, setCity] = useState<string>('Delhi');
  
  // Custom hook manages Orval React Query + Socket.io + Polling internally
  const { currentAqi, history, socketConnected } = useAppAqi(city);

  const handleCityChange = (newCity: string) => {
    setCity(newCity);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Image injected from requirements */}
      <div 
        className="absolute inset-0 z-0 opacity-40 mix-blend-screen pointer-events-none bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/hero-bg.png)` }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col flex-1">
        <Header 
          currentCity={city} 
          onCityChange={handleCityChange} 
          isSocketConnected={socketConnected}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
            {currentAqi.isLoading ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
                <h2 className="text-2xl font-display font-semibold text-white">Fetching Air Quality Data</h2>
                <p className="text-muted-foreground mt-2">Connecting to atmospheric sensors in {city}...</p>
              </div>
            ) : currentAqi.isError || !currentAqi.data ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center max-w-md mx-auto">
                <div className="w-24 h-24 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6 border border-destructive/20">
                  <AlertCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-3">Location Not Found</h2>
                <p className="text-lg text-muted-foreground">
                  We couldn't find air quality data for "{city}". Please check the spelling or try a major nearby city.
                </p>
                <button 
                  onClick={() => setCity('Delhi')}
                  className="mt-8 px-6 py-3 bg-card hover:bg-card/80 border border-white/10 rounded-xl text-white font-medium transition-colors"
                >
                  Return to Default (Delhi)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column - Main AQI Display */}
                <div className="col-span-1 lg:col-span-2">
                  <AqiCard data={currentAqi.data} searchedCity={city} />
                </div>

                {/* Right Column - Health Recommendations */}
                <div className="col-span-1">
                  <HealthPanel aqi={currentAqi.data.aqi} />
                </div>

                {/* Full Width Bottom - History Chart */}
                <div className="col-span-1 lg:col-span-3">
                  <HistoryChart 
                    data={history.data} 
                    isLoading={history.isLoading} 
                    currentAqi={currentAqi.data?.aqi}
                  />
                </div>
              </div>
            )}
        </main>
        
        <footer className="w-full py-6 text-center text-muted-foreground/60 text-sm border-t border-white/5">
          <p>Powered by World Air Quality Index & OpenWeatherMap</p>
        </footer>
      </div>
    </div>
  );
}
