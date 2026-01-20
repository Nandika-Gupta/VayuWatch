// AQI utility functions and data - India focused

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

// India AQI follows CPCB (Central Pollution Control Board) standards
export const getAQIInfo = (aqi: number): AQIInfo => {
  if (aqi <= 50) {
    return {
      level: 'good',
      label: 'Good',
      description: 'Minimal impact on health',
      advice: 'Perfect day for outdoor activities! Enjoy the fresh air.',
      color: 'hsl(142, 71%, 45%)',
      bgClass: 'bg-aqi-good',
      textClass: 'text-aqi-good',
    };
  }
  if (aqi <= 100) {
    return {
      level: 'moderate',
      label: 'Satisfactory',
      description: 'Minor breathing discomfort to sensitive people',
      advice: 'Generally acceptable. Sensitive individuals should monitor.',
      color: 'hsl(45, 93%, 47%)',
      bgClass: 'bg-aqi-moderate',
      textClass: 'text-aqi-moderate',
    };
  }
  if (aqi <= 200) {
    return {
      level: 'unhealthy-sensitive',
      label: 'Moderate',
      description: 'Breathing discomfort to people with lung, heart disease',
      advice: 'Reduce prolonged outdoor exertion. Use masks if necessary.',
      color: 'hsl(27, 96%, 61%)',
      bgClass: 'bg-aqi-unhealthy-sensitive',
      textClass: 'text-aqi-unhealthy-sensitive',
    };
  }
  if (aqi <= 300) {
    return {
      level: 'unhealthy',
      label: 'Poor',
      description: 'Breathing discomfort to most people on prolonged exposure',
      advice: 'Avoid outdoor activities. Use N95 masks when outside.',
      color: 'hsl(0, 72%, 51%)',
      bgClass: 'bg-aqi-unhealthy',
      textClass: 'text-aqi-unhealthy',
    };
  }
  if (aqi <= 400) {
    return {
      level: 'very-unhealthy',
      label: 'Very Poor',
      description: 'Respiratory illness on prolonged exposure',
      advice: 'Stay indoors. Keep windows closed. Use air purifiers.',
      color: 'hsl(282, 68%, 38%)',
      bgClass: 'bg-aqi-very-unhealthy',
      textClass: 'text-aqi-very-unhealthy',
    };
  }
  return {
    level: 'hazardous',
    label: 'Severe',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
    advice: 'Health emergency. Stay indoors. Avoid any outdoor activity.',
    color: 'hsl(340, 82%, 35%)',
    bgClass: 'bg-aqi-hazardous',
    textClass: 'text-aqi-hazardous',
  };
};

// Major Indian cities with pollution data
export const cities = [
  { name: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777 },
  { name: 'Kolkata', country: 'India', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707 },
  { name: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946 },
  { name: 'Hyderabad', country: 'India', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', country: 'India', lat: 23.0225, lon: 72.5714 },
  { name: 'Pune', country: 'India', lat: 18.5204, lon: 73.8567 },
  { name: 'Jaipur', country: 'India', lat: 26.9124, lon: 75.7873 },
  { name: 'Lucknow', country: 'India', lat: 26.8467, lon: 80.9462 },
  { name: 'Kanpur', country: 'India', lat: 26.4499, lon: 80.3319 },
  { name: 'Nagpur', country: 'India', lat: 21.1458, lon: 79.0882 },
  { name: 'Indore', country: 'India', lat: 22.7196, lon: 75.8577 },
  { name: 'Patna', country: 'India', lat: 25.5941, lon: 85.1376 },
  { name: 'Varanasi', country: 'India', lat: 25.3176, lon: 82.9739 },
];

// Realistic base AQI values for Indian cities
const baseAQI: Record<string, number> = {
  'Delhi': 280,
  'Mumbai': 120,
  'Kolkata': 180,
  'Chennai': 85,
  'Bengaluru': 95,
  'Hyderabad': 105,
  'Ahmedabad': 145,
  'Pune': 110,
  'Jaipur': 165,
  'Lucknow': 220,
  'Kanpur': 245,
  'Nagpur': 125,
  'Indore': 115,
  'Patna': 200,
  'Varanasi': 190,
};

// Generate mock AQI data for demo purposes
export const generateMockAQI = (cityName: string): number => {
  const base = baseAQI[cityName] || 150;
  const variation = Math.floor(Math.random() * 50) - 25;
  return Math.max(1, Math.min(500, base + variation));
};

export const generateHistoricalData = (cityName: string, days: number = 7) => {
  const data = [];
  const now = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const aqi = generateMockAQI(cityName);
    data.push({
      date: date.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
      aqi,
      pm25: Math.floor(aqi * 0.5 + Math.random() * 20),
      pm10: Math.floor(aqi * 0.9 + Math.random() * 30),
      o3: Math.floor(30 + Math.random() * 25),
    });
  }
  
  return data;
};

export const generateHourlyData = (cityName: string) => {
  const data = [];
  const base = generateMockAQI(cityName);
  
  for (let i = 0; i < 24; i++) {
    const hour = i.toString().padStart(2, '0') + ':00';
    // Morning and evening peaks (traffic patterns)
    const peakMultiplier = (i >= 7 && i <= 10) || (i >= 17 && i <= 20) ? 1.2 : 1;
    const variation = Math.sin((i / 24) * Math.PI * 2) * 30;
    
    data.push({
      hour,
      aqi: Math.max(1, Math.min(500, Math.floor(base * peakMultiplier + variation + (Math.random() * 20 - 10)))),
    });
  }
  
  return data;
};

// Analytics helper functions
export const calculateMovingAverage = (data: number[], window: number = 3): number[] => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - window + 1);
    const slice = data.slice(start, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(Math.round(avg));
  }
  return result;
};

export const calculateTrendDirection = (data: number[]): 'improving' | 'worsening' | 'stable' => {
  if (data.length < 3) return 'stable';
  
  const recentAvg = data.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const olderAvg = data.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  if (change > 10) return 'worsening';
  if (change < -10) return 'improving';
  return 'stable';
};

export const getHealthRisk = (aqi: number): { level: string; color: string; icon: string } => {
  if (aqi <= 50) return { level: 'Low', color: 'text-aqi-good', icon: '✓' };
  if (aqi <= 100) return { level: 'Low-Moderate', color: 'text-aqi-moderate', icon: '○' };
  if (aqi <= 200) return { level: 'Moderate', color: 'text-aqi-unhealthy-sensitive', icon: '△' };
  if (aqi <= 300) return { level: 'High', color: 'text-aqi-unhealthy', icon: '◇' };
  if (aqi <= 400) return { level: 'Very High', color: 'text-aqi-very-unhealthy', icon: '⬡' };
  return { level: 'Severe', color: 'text-aqi-hazardous', icon: '⚠' };
};
