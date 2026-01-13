import { getAQIInfo } from '@/lib/aqi';
import { cn } from '@/lib/utils';

interface AQIGaugeProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
}

const AQIGauge = ({ value, size = 'lg' }: AQIGaugeProps) => {
  const info = getAQIInfo(value);
  
  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-36 w-36',
    lg: 'h-48 w-48',
  };
  
  const numberClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  };
  
  const labelClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  // Calculate the stroke dash for the circular progress
  const circumference = 2 * Math.PI * 45;
  const progress = Math.min(value / 500, 1);
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn('relative', sizeClasses[size])}>
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={info.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('font-bold text-foreground', numberClasses[size])}>
            {value}
          </span>
          <span className={cn('text-muted-foreground font-medium', labelClasses[size])}>
            AQI
          </span>
        </div>
      </div>
      
      {/* Status label */}
      <div 
        className={cn(
          'px-4 py-2 rounded-full text-sm font-medium',
          info.bgClass,
          'text-white'
        )}
      >
        {info.label}
      </div>
    </div>
  );
};

export default AQIGauge;
