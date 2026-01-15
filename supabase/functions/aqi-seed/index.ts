import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AQI category based on value
function getCategory(aqi: number): string {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'unhealthy-sensitive';
  if (aqi <= 200) return 'unhealthy';
  if (aqi <= 300) return 'very-unhealthy';
  return 'hazardous';
}

// Generate realistic mock AQI data with variations
function generateHistoricalAQI(cityName: string, date: Date) {
  const baseAQI: Record<string, number> = {
    'New York': 45,
    'Los Angeles': 65,
    'Chicago': 52,
    'Houston': 58,
    'Phoenix': 48,
    'San Francisco': 38,
    'Seattle': 35,
    'Denver': 42,
    'Miami': 40,
    'Boston': 44,
  };
  
  const base = baseAQI[cityName] || 50;
  const hour = date.getHours();
  const dayOfWeek = date.getDay();
  
  // Hourly variation (pollution tends to be higher during rush hours)
  const hourlyFactor = Math.sin(((hour - 8) / 24) * Math.PI * 2) * 15;
  
  // Weekly variation (weekends tend to be cleaner)
  const weeklyFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? -10 : 5;
  
  // Random daily variation
  const dailySeed = date.getDate() * 13 + date.getMonth() * 7;
  const dailyVariation = (dailySeed % 30) - 15;
  
  // Random noise
  const noise = Math.floor(Math.random() * 15) - 7;
  
  const aqi = Math.max(0, Math.min(500, Math.floor(base + hourlyFactor + weeklyFactor + dailyVariation + noise)));
  
  return {
    aqi,
    pm25: Number((aqi * 0.4 + Math.random() * 5).toFixed(2)),
    pm10: Number((aqi * 0.8 + Math.random() * 10).toFixed(2)),
    o3: Number((aqi * 0.3 + Math.random() * 8).toFixed(2)),
    no2: Number((aqi * 0.2 + Math.random() * 5).toFixed(2)),
    so2: Number((aqi * 0.1 + Math.random() * 3).toFixed(2)),
    co: Number((aqi * 0.05 + Math.random() * 2).toFixed(2)),
    category: getCategory(aqi),
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const days = parseInt(url.searchParams.get('days') || '30');
    const readingsPerDay = parseInt(url.searchParams.get('readings_per_day') || '4');

    console.log(`Seeding ${days} days of historical AQI data with ${readingsPerDay} readings per day`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*');

    if (citiesError) {
      throw new Error(`Failed to fetch cities: ${citiesError.message}`);
    }

    if (!cities || cities.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No cities found to seed data for' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Check existing data count
    const { count: existingCount } = await supabase
      .from('aqi_readings')
      .select('*', { count: 'exact', head: true });

    console.log(`Existing readings: ${existingCount || 0}`);

    // Generate historical readings
    const readings: any[] = [];
    const now = new Date();
    const hoursPerReading = 24 / readingsPerDay;

    for (let d = days; d >= 0; d--) {
      for (let r = 0; r < readingsPerDay; r++) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        date.setHours(Math.floor(r * hoursPerReading), Math.floor(Math.random() * 60), 0, 0);

        for (const city of cities) {
          const aqiData = generateHistoricalAQI(city.name, date);
          readings.push({
            city_id: city.id,
            aqi: aqiData.aqi,
            pm25: aqiData.pm25,
            pm10: aqiData.pm10,
            o3: aqiData.o3,
            no2: aqiData.no2,
            so2: aqiData.so2,
            co: aqiData.co,
            category: aqiData.category,
            recorded_at: date.toISOString(),
            source: 'seed',
          });
        }
      }
    }

    console.log(`Generated ${readings.length} readings to insert`);

    // Insert in batches of 500
    const batchSize = 500;
    let insertedCount = 0;

    for (let i = 0; i < readings.length; i += batchSize) {
      const batch = readings.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('aqi_readings')
        .insert(batch);

      if (error) {
        console.error(`Batch insert error at ${i}:`, error);
        throw new Error(`Failed to insert batch: ${error.message}`);
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} readings`);
    }

    console.log(`Successfully seeded ${insertedCount} historical readings`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Seeded ${days} days of historical AQI data`,
        cities_count: cities.length,
        readings_count: insertedCount,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error seeding data:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
