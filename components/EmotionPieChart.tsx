'use client';

import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { getEmotionLabel, getEmotionEmoji } from '@/lib/utils';
import { EmotionType } from '@/lib/types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface EmotionPieChartProps {
  emotionData: Record<EmotionType, number>;
}

const emotionConfig: Record<EmotionType, {
  label: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
}> = {
  happy: {
    label: 'Senang',
    emoji: '😊',
    color: 'rgba(34, 197, 94, 0.8)',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    description: 'Perasaan positif dan bahagia'
  },
  neutral: {
    label: 'Netral',
    emoji: '😐',
    color: 'rgba(59, 130, 246, 0.8)',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    description: 'Perasaan biasa saja'
  },
  normal: {
    label: 'Normal',
    emoji: '🙂',
    color: 'rgba(156, 163, 175, 0.8)',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    description: 'Kondisi normal dan stabil'
  },
  stressed: {
    label: 'Sedih',
    emoji: '😔',
    color: 'rgba(239, 68, 68, 0.8)',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    description: 'Butuh perhatian khusus'
  },
  sleepy: {
    label: 'Mengantuk',
    emoji: '😴',
    color: 'rgba(168, 85, 247, 0.8)',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    description: 'Kurang energi atau lelah'
  },
};

export default function EmotionPieChart({ emotionData }: EmotionPieChartProps) {
  const emotions: EmotionType[] = ['happy', 'neutral', 'normal', 'stressed', 'sleepy'];
  
  // Calculate total
  const totalStudents = emotions.reduce((sum, e) => sum + (emotionData[e] || 0), 0);
  
  // Check if there's any data
  const hasData = totalStudents > 0;

  // Prepare data for chart
  const labels = emotions.map(e => `${emotionConfig[e].emoji} ${emotionConfig[e].label}`);
  const data = emotions.map(e => emotionData[e] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Jumlah Siswa',
        data,
        backgroundColor: emotions.map(e => emotionConfig[e].color),
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverOffset: 10,
      },
    ],
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create custom legend
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const value = context.parsed || 0;
            const percentage = totalStudents > 0 ? ((value / totalStudents) * 100).toFixed(1) : '0';
            return `${value} siswa (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: '#fff',
        font: {
          weight: 'bold',
          size: 14,
        },
        formatter: (value: number) => {
          if (value === 0) return '';
          const percentage = totalStudents > 0 ? ((value / totalStudents) * 100).toFixed(1) : '0';
          return `${percentage}%`;
        },
      },
    },
  };

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <p className="text-lg font-medium text-gray-600">Belum ada data check-in</p>
        <p className="text-sm mt-1 text-gray-500">Siswa belum melakukan check-in emosi hari ini</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Layout: Chart + Legend side by side on desktop, stacked on mobile */}
      <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-start">
        {/* Chart */}
        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-xs h-64">
            <Pie data={chartData} options={options} />
          </div>
        </div>

        {/* Compact Legend */}
        <div className="w-full lg:w-1/2 space-y-1.5">
          {emotions.map((emotion) => {
            const config = emotionConfig[emotion];
            const count = emotionData[emotion] || 0;
            const percentage = totalStudents > 0 ? ((count / totalStudents) * 100).toFixed(1) : '0';
            
            return (
              <div
                key={emotion}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.emoji}</span>
                  <span className="text-sm font-medium text-gray-800">
                    {config.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-900">
                    {count}
                  </span>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {percentage}%
                  </span>
                  {/* Color indicator */}
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="pt-2 mt-2 border-t border-gray-200">
            <div className="flex items-center justify-between px-3 py-1">
              <span className="text-xs text-gray-600">Total</span>
              <span className="font-bold text-gray-900">{totalStudents} siswa</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
