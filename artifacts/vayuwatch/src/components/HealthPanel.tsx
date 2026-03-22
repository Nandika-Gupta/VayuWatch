import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, Activity, ShieldAlert, AlertTriangle, Wind } from 'lucide-react';
import { getAqiCategory, type AqiCategory } from '@/lib/aqi-utils';

interface HealthPanelProps {
  aqi: number;
}

export function HealthPanel({ aqi }: HealthPanelProps) {
  const category = getAqiCategory(aqi);

  // Select an appropriate icon based on the level
  const renderIcon = (level: string) => {
    switch(level) {
      case 'Good': return <HeartPulse className="w-8 h-8" />;
      case 'Moderate': return <Activity className="w-8 h-8" />;
      case 'Unhealthy for Sensitive Groups': return <ShieldAlert className="w-8 h-8" />;
      case 'Unhealthy': 
      case 'Very Unhealthy': return <AlertTriangle className="w-8 h-8" />;
      case 'Hazardous': return <Wind className="w-8 h-8" />;
      default: return <HeartPulse className="w-8 h-8" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="glass-panel rounded-3xl p-8 flex flex-col h-full relative overflow-hidden"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
          <HeartPulse className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-display font-bold text-white">Health Recommendations</h3>
      </div>

      <div className={`mt-4 p-6 rounded-2xl border ${category.colors.border} bg-black/20 backdrop-blur-md flex-1 flex flex-col justify-center transition-colors duration-1000`}>
        <div className={`mb-4 ${category.colors.text} transition-colors duration-1000`}>
          {renderIcon(category.level)}
        </div>
        <h4 className="text-2xl font-bold text-white mb-3">What does this mean?</h4>
        <p className="text-lg text-white/80 leading-relaxed font-medium">
          {category.recommendation}
        </p>
      </div>

      {/* Actionable tips list */}
      <div className="mt-6 space-y-4">
        <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Actionable Advice</h5>
        <ul className="space-y-3">
          <AdviceItem text="Keep windows closed to avoid dirty outdoor air" active={aqi > 100} />
          <AdviceItem text="Wear a mask (N95) if you must go outside" active={aqi > 150} />
          <AdviceItem text="Run an air purifier indoors" active={aqi > 50} />
          <AdviceItem text="Avoid strenuous outdoor exercise" active={aqi > 100} />
        </ul>
      </div>
    </motion.div>
  );
}

function AdviceItem({ text, active }: { text: string, active: boolean }) {
  return (
    <li className={`flex items-start gap-3 p-3 rounded-xl border ${active ? 'border-white/10 bg-white/5' : 'border-transparent opacity-50'}`}>
      <div className={`mt-0.5 rounded-full p-1 ${active ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/40'}`}>
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className={`text-sm font-medium ${active ? 'text-white/90' : 'text-white/50'}`}>{text}</span>
    </li>
  );
}
