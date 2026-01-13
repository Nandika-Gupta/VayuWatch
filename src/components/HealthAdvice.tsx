import { getAQIInfo } from '@/lib/aqi';
import { Heart, Activity, Wind, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HealthAdviceProps {
  aqi: number;
}

const HealthAdvice = ({ aqi }: HealthAdviceProps) => {
  const info = getAQIInfo(aqi);
  
  const recommendations = [
    {
      icon: Activity,
      title: 'Outdoor Exercise',
      getAdvice: (level: string) => {
        switch (level) {
          case 'good': return 'Great conditions for all outdoor activities';
          case 'moderate': return 'Safe for most people to exercise outdoors';
          case 'unhealthy-sensitive': return 'Sensitive groups should reduce intensity';
          case 'unhealthy': return 'Consider indoor exercise instead';
          default: return 'Avoid outdoor exercise';
        }
      },
    },
    {
      icon: Wind,
      title: 'Ventilation',
      getAdvice: (level: string) => {
        switch (level) {
          case 'good': return 'Open windows and enjoy fresh air';
          case 'moderate': return 'Good to keep windows open';
          case 'unhealthy-sensitive': return 'Limit window opening during peak hours';
          case 'unhealthy': return 'Keep windows mostly closed';
          default: return 'Keep all windows closed';
        }
      },
    },
    {
      icon: Heart,
      title: 'Sensitive Groups',
      getAdvice: (level: string) => {
        switch (level) {
          case 'good': return 'No special precautions needed';
          case 'moderate': return 'Unusually sensitive should monitor symptoms';
          case 'unhealthy-sensitive': return 'Take extra care if you have conditions';
          case 'unhealthy': return 'Stay indoors, use air purifiers';
          default: return 'Avoid all outdoor exposure';
        }
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main advice banner */}
      <div 
        className={cn(
          'p-4 rounded-lg flex items-start gap-3',
          info.level === 'good' && 'bg-aqi-good/10',
          info.level === 'moderate' && 'bg-aqi-moderate/10',
          info.level === 'unhealthy-sensitive' && 'bg-aqi-unhealthy-sensitive/10',
          info.level === 'unhealthy' && 'bg-aqi-unhealthy/10',
          info.level === 'very-unhealthy' && 'bg-aqi-very-unhealthy/10',
          info.level === 'hazardous' && 'bg-aqi-hazardous/10',
        )}
      >
        <AlertTriangle 
          className={cn(
            'h-5 w-5 mt-0.5 flex-shrink-0',
            info.textClass
          )} 
        />
        <div>
          <p className="font-medium text-foreground">{info.description}</p>
          <p className="text-sm text-muted-foreground mt-1">{info.advice}</p>
        </div>
      </div>

      {/* Detailed recommendations */}
      <div className="grid gap-3">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          return (
            <div 
              key={rec.title}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">{rec.title}</p>
                <p className="text-sm text-muted-foreground">
                  {rec.getAdvice(info.level)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HealthAdvice;
