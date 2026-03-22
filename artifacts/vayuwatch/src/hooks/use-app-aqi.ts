import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { useGetAqi, useGetHistory, getGetAqiQueryKey, type AqiData } from '@workspace/api-client-react';

export function useAppAqi(city: string) {
  const queryClient = useQueryClient();
  const [socketConnected, setSocketConnected] = useState(false);

  // 1. Fetch current AQI with polling every 60 seconds as a fallback
  const currentAqi = useGetAqi(
    { city },
    { 
      query: { 
        refetchInterval: 60000,
        retry: 2,
        staleTime: 30000,
        enabled: Boolean(city),
      } 
    }
  );

  // 2. Fetch history (7 days)
  const history = useGetHistory(
    { city },
    {
      query: {
        retry: 2,
        staleTime: 5 * 60000,
        enabled: Boolean(city),
      }
    }
  );

  // 3. Setup Socket.IO for real-time push updates
  useEffect(() => {
    // Connect to the API server through the shared proxy
    const socket = io('/', {
      path: '/api/socket.io',
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('aqi:update', (data: AqiData) => {
      // Only update cache if the incoming data matches the city we are currently viewing
      if (data.city.toLowerCase() === city.toLowerCase()) {
        // Update React Query cache directly
        queryClient.setQueryData(getGetAqiQueryKey({ city }), data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [city, queryClient]);

  return {
    currentAqi,
    history,
    socketConnected
  };
}
