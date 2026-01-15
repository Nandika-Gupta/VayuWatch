import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const cityName = url.searchParams.get('city') || 'New York';
    const days = parseInt(url.searchParams.get('days') || '7');

    console.log(`Fetching AQI history for ${cityName}, last ${days} days`);

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

    if (!city) {
      // Return empty history for unknown cities
      return new Response(
        JSON.stringify({
          city: { name: cityName, country: 'Unknown' },
          history: [],
          stats: null,
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch historical readings
    const { data: readings, error: readingsError } = await supabase
      .from('aqi_readings')
      .select('*')
      .eq('city_id', city.id)
      .gte('recorded_at', startDate.toISOString())
      .lte('recorded_at', endDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (readingsError) {
      console.error('Readings error:', readingsError);
      throw new Error(`Failed to fetch readings: ${readingsError.message}`);
    }

    // Group readings by day and calculate daily averages
    const dailyData: Record<string, { aqiSum: number; pm25Sum: number; pm10Sum: number; o3Sum: number; count: number }> = {};
    
    (readings || []).forEach((reading) => {
      const dateKey = new Date(reading.recorded_at).toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { aqiSum: 0, pm25Sum: 0, pm10Sum: 0, o3Sum: 0, count: 0 };
      }
      dailyData[dateKey].aqiSum += reading.aqi;
      dailyData[dateKey].pm25Sum += reading.pm25 || 0;
      dailyData[dateKey].pm10Sum += reading.pm10 || 0;
      dailyData[dateKey].o3Sum += reading.o3 || 0;
      dailyData[dateKey].count += 1;
    });

    const history = Object.entries(dailyData).map(([date, data]) => ({
      date,
      dateFormatted: new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      aqi: Math.round(data.aqiSum / data.count),
      pm25: Math.round(data.pm25Sum / data.count),
      pm10: Math.round(data.pm10Sum / data.count),
      o3: Math.round(data.o3Sum / data.count),
      readings_count: data.count,
    }));

    // Calculate stats
    const allAQI = history.map(h => h.aqi);
    const stats = allAQI.length > 0 ? {
      average: Math.round(allAQI.reduce((a, b) => a + b, 0) / allAQI.length),
      max: Math.max(...allAQI),
      min: Math.min(...allAQI),
      total_readings: readings?.length || 0,
    } : null;

    console.log(`Found ${history.length} days of data for ${cityName}`);

    return new Response(
      JSON.stringify({
        city: {
          name: city.name,
          country: city.country,
          latitude: city.latitude,
          longitude: city.longitude,
        },
        history,
        stats,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error fetching history:', error);
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
