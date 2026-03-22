import React from 'react';
import { MapPin, Clock, Thermometer, Droplets, Zap } from 'lucide-react';
import { getAqiCategory } from '@/lib/aqi-utils';
import type { AqiData } from '@workspace/api-client-react';
import { format } from 'date-fns';

interface AqiCardProps {
  data: AqiData;
  searchedCity: string;
}

export function AqiCard({ data, searchedCity }: AqiCardProps) {
  const category = getAqiCategory(data.aqi);

  let formattedTime = 'Unknown time';
  try {
    if (data.time) {
      formattedTime = format(new Date(data.time), 'MMM d, yyyy • h:mm a');
    }
  } catch {
    formattedTime = data.time;
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border ${category.colors.border} ${category.colors.bg} shadow-2xl ${category.colors.glow} p-8 flex flex-col h-full`}
    >
      {/* Decorative glow blob */}
      <div
        className={`absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none ${category.colors.text}`}
        style={{ background: 'currentColor' }}
      />

      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MapPin className="w-4 h-4" />
              <span className="font-medium uppercase tracking-wider text-xs">Current Location</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white capitalize">
              {searchedCity}
            </h2>
            {data.stationName && data.stationName !== searchedCity && (
              <p className="text-sm text-muted-foreground mt-1 max-w-[250px] truncate" title={data.stationName}>
                Station: {data.stationName}
              </p>
            )}
          </div>

          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-medium uppercase tracking-wider">Last Updated</span>
            </div>
            <p className="text-sm text-white/80 font-medium">{formattedTime}</p>
          </div>
        </div>

        {/* AQI Number */}
        <div className="flex-1 flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              US AQI Index
            </span>
            <div
              className={`text-8xl md:text-9xl font-display font-black leading-none tracking-tighter ${category.colors.text} text-glow`}
            >
              {data.aqi}
            </div>
            <div
              className={`mt-4 inline-flex items-center px-4 py-1.5 rounded-full border ${category.colors.border} bg-black/20 backdrop-blur-md`}
            >
              <span className={`text-lg font-bold tracking-wide ${category.colors.text}`}>
                {category.level}
              </span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-auto pt-8 border-t border-white/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Dominant</span>
            </div>
            <span className="text-xl font-bold text-white uppercase">{data.dominentpol || 'N/A'}</span>
          </div>

          <div className="flex flex-col border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
              <Thermometer className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Temp</span>
            </div>
            <span className="text-xl font-bold text-white">
              {data.temperature != null ? `${data.temperature}°C` : '--'}
            </span>
          </div>

          <div className="flex flex-col border-l border-white/10 pl-4">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1.5">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Humidity</span>
            </div>
            <span className="text-xl font-bold text-white">
              {data.humidity != null ? `${data.humidity}%` : '--'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
