// AQI utility functions and data

export type AQILevel = 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'very-unhealthy' | 'hazardous';

export interface AQIInfo {
  level: AQILevel;
  label: string;
  description: string;
  advice: string;
  color: string;
  bgClass: string;
  textClass: string;
}

export const getAQIInfo = (aqi: number): AQIInfo => {
  if (aqi <= 50) {
    return {
      level: 'good',
      label: 'Good',
      description: 'Air quality is satisfactory',
      advice: 'Perfect day for outdoor activities!',
      color: 'hsl(142, 71%, 45%)',
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'moderate',
      label: 'Moderate',
      description: 'Air quality is acceptable',
      advice: 'Unusually sensitive people should limit prolonged outdoor exertion.',
      color: 'hsl(45, 93%, 47%)',
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
    };
  }
  if (aqi <= 150) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Unhealthy for Sensitive Groups',
      description: 'Members of sensitive groups may experience health effects',
      advice: 'People with respiratory issues should reduce outdoor activities.',
      color: 'hsl(27, 96%, 61%)',
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'unhealthy',
      label: 'Unhealthy',
      description: 'Everyone may begin to experience health effects',
      advice: 'Limit prolonged outdoor exertion. Consider indoor activities.',
      color: 'hsl(0, 72%, 51%)',
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
    };
  }
  if (aqi <= 300) {
    return {
      level: 'very-unhealthy',
      label: 'Very Unhealthy',
      description: 'Health alert: everyone may experience serious health effects',
      advice: 'Avoid outdoor activities. Keep windows closed.',
      color: 'hsl(282, 68%, 38%)',
      bgClass: 'bg-aqi-very-unhealthy',
      textClass: 'text-aqi-very-unhealthy',
    };
  }
  return {
    level: 'hazardous',
    label: 'Hazardous',
    description: 'Health warning of emergency conditions',
    advice: 'Stay indoors. Use air purifiers if available.',
    color: 'hsl(340, 82%, 35%)',
    bgClass: 'bg-aqi-hazardous',
    textClass: 'text-aqi-hazardous',
  };
};

export const cities = [
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437 },
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
];

// Generate mock AQI data for demo purposes
export const generateMockAQI = (cityName: string): number => {
  const baseAQI: Record<string, number> = {
    'New York': 45,
    'Los Angeles': 65,
    'London': 35,
    'Paris': 40,
    'Tokyo': 50,
    'Beijing': 120,
    'Delhi': 180,
    'Sydney': 25,
    'Dubai': 85,
    'Singapore': 55,
  };
  
  const base = baseAQI[cityName] || 50;
  const variation = Math.floor(Math.random() * 30) - 15;
  return Math.max(0, Math.min(500, base + variation));
};

export const generateHistoricalData = (cityName: string, days: number = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      aqi: generateMockAQI(cityName),
      pm25: Math.floor(Math.random() * 50) + 10,
      pm10: Math.floor(Math.random() * 80) + 20,
      o3: Math.floor(Math.random() * 60) + 20,
    });
  }
  
  return data;
};

export const generateHourlyData = (cityName: string) => {
  const data = [];
  const baseAQI = generateMockAQI(cityName);
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00';
    const variation = Math.sin((i / 24) * Math.PI * 2) * 20;
    
    data.push({
      hour,
      aqi: Math.max(0, Math.min(500, Math.floor(baseAQI + variation + (Math.random() * 10 - 5)))),
    });
  }
  
  return data;
};
