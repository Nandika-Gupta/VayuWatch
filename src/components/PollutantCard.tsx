import { cn } from '@/lib/utils';

interface PollutantCardProps {
  name: string;
  value: number;
  unit: string;
  description: string;
}

const PollutantCard = ({ name, value, unit, description }: PollutantCardProps) => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
};

export default PollutantCard;
