import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface City {
  id: string;
  name: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
}

export interface CurrentAQI {
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
  category: string;
  recorded_at: string;
}

export interface AQICurrentResponse {
  city: City;
  current: CurrentAQI;
  previous: { aqi: number; recorded_at: string } | null;
}

export interface HistoryEntry {
  date: string;
  dateFormatted: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  readings_count: number;
}

export interface AQIHistoryResponse {
  city: City;
  history: HistoryEntry[];
  stats: {
    average: number;
    max: number;
    min: number;
    total_readings: number;
  } | null;
}

// Fetch current AQI for a city
export function useCurrentAQI(cityName: string) {
  return useQuery<AQICurrentResponse>({
    queryKey: ['aqi-current', cityName],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('aqi-current', {
        body: null,
        method: 'GET',
      });

      // Since invoke doesn't support query params directly, we need to use fetch
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aqi-current?city=${encodeURIComponent(cityName)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch current AQI');
      }

      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    staleTime: 2 * 60 * 1000, // Consider stale after 2 minutes
  });
}

// Fetch AQI history for a city
export function useAQIHistory(cityName: string, days: number = 7) {
  return useQuery<AQIHistoryResponse>({
    queryKey: ['aqi-history', cityName, days],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aqi-history?city=${encodeURIComponent(cityName)}&days=${days}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch AQI history');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Fetch cities from database
export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data;
    },
    staleTime: 60 * 60 * 1000, // Cities don't change often
  });
}

// Seed historical data (one-time use)
export async function seedHistoricalData(days: number = 30) {
  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/aqi-seed?days=${days}&readings_per_day=4`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to seed data');
  }

  return response.json();
}
