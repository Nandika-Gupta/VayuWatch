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

// Generate realistic mock AQI data (simulates external API)
function generateAQIData(cityName: string, baseVariation: number = 0) {
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
  const hourVariation = Math.sin((new Date().getHours() / 24) * Math.PI * 2) * 15;
  const dayVariation = Math.sin((new Date().getDay() / 7) * Math.PI * 2) * 10;
  const randomVariation = Math.floor(Math.random() * 20) - 10;
  const aqi = Math.max(0, Math.min(500, Math.floor(base + hourVariation + dayVariation + randomVariation + baseVariation)));
  
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
    console.log('Starting AQI data collection...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get all cities
    const { data: cities, error: citiesError } = await supabase
      .from('cities')
      .select('*');

    if (citiesError) {
      console.error('Failed to fetch cities:', citiesError);
      throw new Error(`Failed to fetch cities: ${citiesError.message}`);
    }

    if (!cities || cities.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No cities found to collect data for' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Collecting AQI data for ${cities.length} cities`);

    // Collect readings for all cities
    const readings = cities.map(city => {
      const aqiData = generateAQIData(city.name);
      return {
        city_id: city.id,
        aqi: aqiData.aqi,
        pm25: aqiData.pm25,
        pm10: aqiData.pm10,
        o3: aqiData.o3,
        no2: aqiData.no2,
        so2: aqiData.so2,
        co: aqiData.co,
        category: aqiData.category,
        recorded_at: new Date().toISOString(),
        source: 'scheduled',
      };
    });

    // Insert all readings
    const { data: insertedReadings, error: insertError } = await supabase
      .from('aqi_readings')
      .insert(readings)
      .select();

    if (insertError) {
      console.error('Failed to insert readings:', insertError);
      throw new Error(`Failed to insert readings: ${insertError.message}`);
    }

    console.log(`Successfully collected ${insertedReadings?.length || 0} readings`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Collected AQI data for ${cities.length} cities`,
        readings_count: insertedReadings?.length || 0,
        timestamp: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in AQI collection:', error);
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
