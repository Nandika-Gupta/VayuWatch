-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Service role can insert cities" ON public.cities;
DROP POLICY IF EXISTS "Service role can insert readings" ON public.aqi_readings;

-- Edge functions using service role key bypass RLS, so no insert policy needed for public