export type AqiLevel = 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface AqiCategory {
  level: AqiLevel;
  colors: {
    bg: string;
    border: string;
    text: string;
    glow: string;
    chart: string;
    chartFill: string;
  };
  recommendation: string;
  icon: string;
}

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) {
    return {
      level: 'Good',
      colors: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        glow: 'shadow-emerald-500/20',
        chart: '#34d399',
        chartFill: 'rgba(52, 211, 153, 0.2)'
      },
      recommendation: 'Air quality is satisfactory, and air pollution poses little or no risk. Safe for all outdoor activities.',
      icon: 'wind'
    };
  }
  if (aqi <= 100) {
    return {
      level: 'Moderate',
      colors: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        glow: 'shadow-yellow-500/20',
        chart: '#facc15',
        chartFill: 'rgba(250, 204, 21, 0.2)'
      },
      recommendation: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
      icon: 'alert-circle'
    };
  }
  if (aqi <= 150) {
    return {
      level: 'Unhealthy for Sensitive Groups',
      colors: {
        bg: 'bg-orange-500/10',
        border: 'border-orange-500/30',
        text: 'text-orange-400',
        glow: 'shadow-orange-500/20',
        chart: '#fb923c',
        chartFill: 'rgba(251, 146, 60, 0.2)'
      },
      recommendation: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected. Limit prolonged outdoor exertion.',
      icon: 'activity'
    };
  }
  if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      colors: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        glow: 'shadow-red-500/20',
        chart: '#f87171',
        chartFill: 'rgba(248, 113, 113, 0.2)'
      },
      recommendation: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects. Avoid prolonged outdoor exertion.',
      icon: 'shield-alert'
    };
  }
  if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      colors: {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-400',
        glow: 'shadow-purple-500/20',
        chart: '#c084fc',
        chartFill: 'rgba(192, 132, 252, 0.2)'
      },
      recommendation: 'Health alert: The risk of health effects is increased for everyone. Avoid all outdoor physical activities.',
      icon: 'skull'
    };
  }
  
  return {
    level: 'Hazardous',
    colors: {
      bg: 'bg-rose-900/20',
      border: 'border-rose-800/50',
      text: 'text-rose-500',
      glow: 'shadow-rose-900/40',
      chart: '#e11d48',
      chartFill: 'rgba(225, 29, 72, 0.2)'
    },
    recommendation: 'Health warning of emergency conditions: everyone is more likely to be affected. Remain indoors and keep windows closed.',
    icon: 'biohazard'
  };
}
