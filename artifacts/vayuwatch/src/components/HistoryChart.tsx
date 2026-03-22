import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
  type ChartOptions
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { ActivitySquare, AlertCircle } from 'lucide-react';
import type { AqiReading } from '@workspace/api-client-react';
import { getAqiCategory } from '@/lib/aqi-utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

interface HistoryChartProps {
  data: AqiReading[] | undefined;
  isLoading: boolean;
  currentAqi?: number;
}

export function HistoryChart({ data, isLoading, currentAqi = 50 }: HistoryChartProps) {
  const category = getAqiCategory(currentAqi);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Sort by time ascending
    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    const labels = sortedData.map(d => {
      try {
        return format(new Date(d.time), 'MMM d, HH:mm');
      } catch (e) {
        return d.time.substring(5, 16); // Fallback
      }
    });

    const aqiValues = sortedData.map(d => d.aqi);

    return {
      labels,
      datasets: [
        {
          label: 'AQI Level',
          data: aqiValues,
          borderColor: category.colors.chart,
          backgroundColor: category.colors.chartFill,
          borderWidth: 3,
          pointBackgroundColor: '#131521', // Match card background
          pointBorderColor: category.colors.chart,
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4, // Smooth curves
        },
      ],
    };
  }, [data, category]);

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    color: 'rgba(255, 255, 255, 0.7)',
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false, // We'll use a custom title
      },
      tooltip: {
        backgroundColor: 'rgba(19, 21, 33, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: category.colors.chart,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        titleFont: { family: 'Outfit', size: 14, weight: 600 },
        bodyFont: { family: 'DM Sans', size: 16, weight: 700 },
        callbacks: {
          label: function(context) {
            return `AQI: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { family: 'DM Sans', size: 11 },
          maxRotation: 45,
          minRotation: 45,
          maxTicksLimit: 8
        },
        border: { display: false }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          font: { family: 'DM Sans', size: 11 },
          padding: 10
        },
        border: { display: false },
        beginAtZero: true,
      },
    },
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
      className="glass-panel rounded-3xl p-6 md:p-8 col-span-1 lg:col-span-3 mt-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/20 rounded-xl text-primary">
            <ActivitySquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">Historical Trend</h3>
            <p className="text-sm text-muted-foreground mt-1">7-Day Air Quality Index history</p>
          </div>
        </div>
        
        {/* Simple Legend */}
        <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span> 0-50 Good
          </div>
          <div className="flex items-center gap-2 hidden sm:flex">
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span> 51-100 Mod.
          </div>
          <div className="flex items-center gap-2 hidden md:flex">
            <span className="w-3 h-3 rounded-full bg-red-500"></span> 151+ Unhealthy
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : chartData && chartData.labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="text-lg font-medium">No historical data available for this location</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
