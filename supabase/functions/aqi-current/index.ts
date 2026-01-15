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
function generateAQIData(cityName: string) {
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
  const randomVariation = Math.floor(Math.random() * 20) - 10;
  const aqi = Math.max(0, Math.min(500, Math.floor(base + hourVariation + randomVariation)));
  
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
    const cityName = url.searchParams.get('city') || 'New York';

    console.log(`Fetching current AQI for city: ${cityName}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get city from database
    const { data: city, error: cityError } = await supabase
      .from('cities')
      .select('*')
      .eq('name', cityName)
      .maybeSingle();

    if (cityError) {
      console.error('City lookup error:', cityError);
      throw new Error(`Failed to lookup city: ${cityError.message}`);
    }

    // Generate current AQI data
    const aqiData = generateAQIData(cityName);

    // If city exists, also get the most recent reading for comparison
    let lastReading = null;
    if (city) {
      const { data: recentReading } = await supabase
        .from('aqi_readings')
        .select('*')
        .eq('city_id', city.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      lastReading = recentReading;
    }

    const response = {
      city: {
        name: cityName,
        country: city?.country || 'USA',
        latitude: city?.latitude || null,
        longitude: city?.longitude || null,
      },
      current: {
        ...aqiData,
        recorded_at: new Date().toISOString(),
      },
      previous: lastReading ? {
        aqi: lastReading.aqi,
        recorded_at: lastReading.recorded_at,
      } : null,
    };

    console.log(`AQI for ${cityName}: ${aqiData.aqi} (${aqiData.category})`);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching AQI:', error);
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
