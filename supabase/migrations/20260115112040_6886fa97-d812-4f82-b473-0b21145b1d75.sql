-- Create cities table for storing supported locations
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL DEFAULT 'USA',
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create aqi_readings table for storing historical AQI data
CREATE TABLE public.aqi_readings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  aqi INTEGER NOT NULL,
  pm25 DECIMAL(6, 2),
  pm10 DECIMAL(6, 2),
  o3 DECIMAL(6, 2),
  no2 DECIMAL(6, 2),
  so2 DECIMAL(6, 2),
  co DECIMAL(6, 2),
  category TEXT NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  source TEXT DEFAULT 'api',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for AQI data)
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aqi_readings ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (no auth required for this app)
CREATE POLICY "Anyone can read cities" 
  ON public.cities 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can read aqi readings" 
  ON public.aqi_readings 
  FOR SELECT 
  USING (true);

-- Service role can insert/update (for edge functions)
CREATE POLICY "Service role can insert cities"
  ON public.cities
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can insert readings"
  ON public.aqi_readings
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_aqi_readings_city_recorded ON public.aqi_readings(city_id, recorded_at DESC);
CREATE INDEX idx_aqi_readings_recorded_at ON public.aqi_readings(recorded_at DESC);

-- Insert default cities
INSERT INTO public.cities (name, country, latitude, longitude) VALUES
  ('New York', 'USA', 40.7128, -74.0060),
  ('Los Angeles', 'USA', 34.0522, -118.2437),
  ('Chicago', 'USA', 41.8781, -87.6298),
  ('Houston', 'USA', 29.7604, -95.3698),
  ('Phoenix', 'USA', 33.4484, -112.0740),
  ('San Francisco', 'USA', 37.7749, -122.4194),
  ('Seattle', 'USA', 47.6062, -122.3321),
  ('Denver', 'USA', 39.7392, -104.9903),
  ('Miami', 'USA', 25.7617, -80.1918),
  ('Boston', 'USA', 42.3601, -71.0589);