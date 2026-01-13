import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AQICardProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const AQICard = ({ title, children, className, icon }: AQICardProps) => {
  return (
    <div 
      className={cn(
        'bg-card rounded-xl border border-border p-6 shadow-card transition-shadow duration-200 hover:shadow-card-hover',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-primary">{icon}</span>}
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
};

export default AQICard;
