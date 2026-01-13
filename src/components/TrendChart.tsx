import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getAQIInfo } from '@/lib/aqi';

interface TrendChartProps {
  data: Array<{ date?: string; hour?: string; aqi: number }>;
  dataKey?: string;
  showGrid?: boolean;
  height?: number;
}

const TrendChart = ({ 
  data, 
  dataKey = 'aqi', 
  showGrid = true,
  height = 300 
}: TrendChartProps) => {
  const xKey = data[0]?.date ? 'date' : 'hour';
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const aqi = payload[0].value;
      const info = getAQIInfo(aqi);
      
      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: info.color }}
            />
            <span className="text-lg font-bold text-foreground">{aqi}</span>
            <span className="text-sm text-muted-foreground">{info.label}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="aqiGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="hsl(168, 76%, 42%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        
        {showGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        )}
        
        <XAxis 
          dataKey={xKey} 
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
        />
        
        <YAxis 
          tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
          axisLine={{ stroke: 'hsl(var(--border))' }}
          tickLine={false}
          domain={[0, 'auto']}
        />
        
        <Tooltip content={<CustomTooltip />} />
        
        {/* Reference lines for AQI thresholds */}
        <ReferenceLine 
          y={50} 
          stroke="hsl(142, 71%, 45%)" 
          strokeDasharray="3 3" 
          strokeOpacity={0.5}
        />
        <ReferenceLine 
          y={100} 
          stroke="hsl(45, 93%, 47%)" 
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />
        <ReferenceLine 
          y={150} 
          stroke="hsl(27, 96%, 61%)" 
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />
        
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(168, 76%, 42%)"
          strokeWidth={2}
          fill="url(#aqiGradient)"
          dot={false}
          activeDot={{ r: 6, fill: 'hsl(168, 76%, 42%)', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendChart;
