import { useState } from 'react';
import { 
  Shield, 
  Heart, 
  Activity, 
  Baby, 
  Users, 
  AlertCircle,
  CheckCircle,
  Info,
  Wind,
} from 'lucide-react';
import Layout from '@/components/Layout';
import AQICard from '@/components/AQICard';
import { getAQIInfo, type AQILevel } from '@/lib/aqi';
import { cn } from '@/lib/utils';

interface InsightGroup {
  title: string;
  icon: React.ElementType;
  levels: {
    level: AQILevel;
    advice: string;
    actions: string[];
  }[];
}

const insightGroups: InsightGroup[] = [
  {
    title: 'General Population',
    icon: Users,
    levels: [
      {
        level: 'good',
        advice: 'Air quality is ideal for all activities.',
        actions: ['Enjoy outdoor activities', 'Open windows for fresh air', 'Great day for exercise'],
      },
      {
        level: 'moderate',
        advice: 'Air quality is acceptable for most people.',
        actions: ['Normal activities are fine', 'Unusually sensitive people should monitor'],
      },
      {
        level: 'unhealthy-sensitive',
        advice: 'General public should be cautious.',
        actions: ['Reduce prolonged outdoor exertion', 'Take more breaks during outdoor activities'],
      },
      {
        level: 'unhealthy',
        advice: 'Everyone may experience health effects.',
        actions: ['Limit outdoor activities', 'Keep windows closed', 'Use air purifiers indoors'],
      },
      {
        level: 'very-unhealthy',
        advice: 'Health alert: serious effects possible.',
        actions: ['Avoid outdoor activities', 'Stay indoors', 'Wear N95 masks if going outside'],
      },
      {
        level: 'hazardous',
        advice: 'Emergency conditions.',
        actions: ['Do not go outside', 'Seal windows and doors', 'Run air purifiers continuously'],
      },
    ],
  },
  {
    title: 'Children & Elderly',
    icon: Baby,
    levels: [
      {
        level: 'good',
        advice: 'Safe for all outdoor activities.',
        actions: ['Outdoor play is encouraged', 'Park visits recommended'],
      },
      {
        level: 'moderate',
        advice: 'Generally safe with minor precautions.',
        actions: ['Monitor for any symptoms', 'Stay hydrated'],
      },
      {
        level: 'unhealthy-sensitive',
        advice: 'Extra care needed.',
        actions: ['Reduce outdoor time', 'Avoid strenuous outdoor activities', 'Watch for breathing issues'],
      },
      {
        level: 'unhealthy',
        advice: 'Keep children and elderly indoors.',
        actions: ['Indoor activities only', 'Ensure medications are accessible', 'Monitor symptoms closely'],
      },
      {
        level: 'very-unhealthy',
        advice: 'Strict precautions required.',
        actions: ['Stay indoors at all times', 'Have emergency contacts ready', 'Use air purifiers'],
      },
      {
        level: 'hazardous',
        advice: 'Maximum protection needed.',
        actions: ['Complete indoor isolation', 'Seek medical advice if needed', 'Evacuate if possible'],
      },
    ],
  },
  {
    title: 'People with Respiratory Conditions',
    icon: Heart,
    levels: [
      {
        level: 'good',
        advice: 'Conditions are favorable.',
        actions: ['Normal activities allowed', 'Keep rescue medications handy just in case'],
      },
      {
        level: 'moderate',
        advice: 'Monitor your condition.',
        actions: ['Have medications accessible', 'Know early warning signs'],
      },
      {
        level: 'unhealthy-sensitive',
        advice: 'Take precautions.',
        actions: ['Reduce outdoor exposure', 'Use preventive medications', 'Avoid high-traffic areas'],
      },
      {
        level: 'unhealthy',
        advice: 'Minimize outdoor exposure.',
        actions: ['Stay indoors', 'Use air purifiers', 'Have emergency plan ready'],
      },
      {
        level: 'very-unhealthy',
        advice: 'High risk - stay protected.',
        actions: ['Avoid going outside', 'Pre-treat with medications', 'Contact doctor if symptoms worsen'],
      },
      {
        level: 'hazardous',
        advice: 'Dangerous conditions.',
        actions: ['Complete indoor isolation', 'Consider temporary relocation', 'Seek medical help if needed'],
      },
    ],
  },
  {
    title: 'Athletes & Outdoor Workers',
    icon: Activity,
    levels: [
      {
        level: 'good',
        advice: 'Perfect conditions for outdoor exercise.',
        actions: ['All outdoor activities recommended', 'Great for long-distance training'],
      },
      {
        level: 'moderate',
        advice: 'Good for outdoor activities.',
        actions: ['Normal training is fine', 'Sensitive individuals should monitor'],
      },
      {
        level: 'unhealthy-sensitive',
        advice: 'Reduce intensity.',
        actions: ['Shorten outdoor workouts', 'Take frequent breaks', 'Consider indoor alternatives'],
      },
      {
        level: 'unhealthy',
        advice: 'Move activities indoors.',
        actions: ['Indoor training recommended', 'If outdoors, reduce duration significantly', 'Wear protective gear'],
      },
      {
        level: 'very-unhealthy',
        advice: 'Avoid outdoor exercise.',
        actions: ['Cancel outdoor training', 'Work from home if possible', 'Use N95 masks if must be outside'],
      },
      {
        level: 'hazardous',
        advice: 'No outdoor activities.',
        actions: ['Do not exercise outdoors', 'Outdoor work should be suspended', 'Prioritize safety over schedule'],
      },
    ],
  },
];

const aqiLevels: AQILevel[] = ['good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'very-unhealthy', 'hazardous'];

const Insights = () => {
  const [selectedLevel, setSelectedLevel] = useState<AQILevel>('good');

  const getIconForLevel = (level: AQILevel) => {
    const info = getAQIInfo(level === 'good' ? 25 : level === 'moderate' ? 75 : level === 'unhealthy-sensitive' ? 125 : level === 'unhealthy' ? 175 : level === 'very-unhealthy' ? 250 : 400);
    
    switch (level) {
      case 'good':
        return <CheckCircle className="h-4 w-4" style={{ color: info.color }} />;
      case 'moderate':
        return <Info className="h-4 w-4" style={{ color: info.color }} />;
      default:
        return <AlertCircle className="h-4 w-4" style={{ color: info.color }} />;
    }
  };

  const selectedInfo = getAQIInfo(
    selectedLevel === 'good' ? 25 : 
    selectedLevel === 'moderate' ? 75 : 
    selectedLevel === 'unhealthy-sensitive' ? 125 : 
    selectedLevel === 'unhealthy' ? 175 : 
    selectedLevel === 'very-unhealthy' ? 250 : 400
  );

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground font-mono">
            <span className="text-primary">{'<'}</span>Health Insights<span className="text-primary">{'/>'}</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            CPCB-based health recommendations for India's air quality levels
          </p>
        </div>

        {/* AQI Level Selector */}
        <AQICard title="Select AQI Level" icon={<Shield className="h-4 w-4" />}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
            {aqiLevels.map((level) => {
              const info = getAQIInfo(
                level === 'good' ? 25 : 
                level === 'moderate' ? 75 : 
                level === 'unhealthy-sensitive' ? 125 : 
                level === 'unhealthy' ? 175 : 
                level === 'very-unhealthy' ? 250 : 400
              );
              
              return (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    'p-3 rounded-lg border-2 transition-all text-left',
                    selectedLevel === level 
                      ? 'border-primary bg-accent' 
                      : 'border-transparent bg-muted/50 hover:bg-muted'
                  )}
                >
                  <div 
                    className="w-3 h-3 rounded-full mb-2"
                    style={{ backgroundColor: info.color }}
                  />
                  <p className="text-sm font-medium text-foreground">{info.label}</p>
                </button>
              );
            })}
          </div>
        </AQICard>

        {/* Current Level Summary */}
        <div 
          className="p-6 rounded-xl border-2"
          style={{ borderColor: selectedInfo.color, backgroundColor: `${selectedInfo.color}10` }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="p-3 rounded-lg"
              style={{ backgroundColor: selectedInfo.color }}
            >
              <Wind className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedInfo.label}</h2>
              <p className="text-muted-foreground mt-1">{selectedInfo.description}</p>
              <p className="font-medium mt-2" style={{ color: selectedInfo.color }}>
                {selectedInfo.advice}
              </p>
            </div>
          </div>
        </div>

        {/* Insight Groups */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {insightGroups.map((group) => {
            const Icon = group.icon;
            const levelData = group.levels.find(l => l.level === selectedLevel);
            
            if (!levelData) return null;
            
            return (
              <AQICard 
                key={group.title} 
                title={group.title}
                icon={<Icon className="h-4 w-4" />}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    {getIconForLevel(selectedLevel)}
                    <p className="text-sm text-foreground">{levelData.advice}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Recommended Actions
                    </p>
                    <ul className="space-y-2">
                      {levelData.actions.map((action, idx) => (
                        <li 
                          key={idx}
                          className="flex items-center gap-2 text-sm text-muted-foreground"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AQICard>
            );
          })}
        </div>

        {/* AQI Scale Reference - India CPCB Standard */}
        <AQICard title="India NAQI Scale (CPCB Standard)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">AQI Range</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Health Impact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { range: '0-50', level: 'Good', color: 'hsl(142, 71%, 45%)', concern: 'Minimal impact' },
                  { range: '51-100', level: 'Satisfactory', color: 'hsl(45, 93%, 47%)', concern: 'Minor breathing discomfort to sensitive people' },
                  { range: '101-200', level: 'Moderate', color: 'hsl(27, 96%, 61%)', concern: 'Breathing discomfort to people with lung/heart disease' },
                  { range: '201-300', level: 'Poor', color: 'hsl(0, 72%, 51%)', concern: 'Breathing discomfort to most people on prolonged exposure' },
                  { range: '301-400', level: 'Very Poor', color: 'hsl(282, 68%, 38%)', concern: 'Respiratory illness on prolonged exposure' },
                  { range: '401-500', level: 'Severe', color: 'hsl(340, 82%, 35%)', concern: 'Affects healthy people, seriously impacts those with diseases' },
                ].map((row) => (
                  <tr key={row.range} className="border-b border-border last:border-0">
                    <td className="py-3 px-4">
                      <span 
                        className="inline-block px-2 py-1 rounded text-white text-xs font-medium font-mono"
                        style={{ backgroundColor: row.color }}
                      >
                        {row.range}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">{row.level}</td>
                    <td className="py-3 px-4 text-muted-foreground">{row.concern}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-4 font-mono">
            Source: Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, India
          </p>
        </AQICard>
      </div>
    </Layout>
  );
};

export default Insights;
