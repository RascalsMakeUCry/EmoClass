import { StatsCardData } from '@/lib/types';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'green' | 'yellow' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

const colorClasses = {
  green: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
    border: 'border-green-200',
    icon: 'bg-gradient-to-r from-green-400 to-emerald-500',
    text: 'text-green-700',
    value: 'text-green-600',
  },
  yellow: {
    bg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
    border: 'border-yellow-200',
    icon: 'bg-gradient-to-r from-yellow-400 to-orange-500',
    text: 'text-yellow-700',
    value: 'text-yellow-600',
  },
  red: {
    bg: 'bg-gradient-to-br from-red-50 to-pink-50',
    border: 'border-red-200',
    icon: 'bg-gradient-to-r from-red-400 to-pink-500',
    text: 'text-red-700',
    value: 'text-red-600',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`
        ${colors.bg} ${colors.border}
        border-2 rounded-2xl p-6
        transition-all duration-300
        hover:shadow-xl hover:scale-[1.02]
        cursor-default
      `}
    >
      {/* Icon and Title */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`
              ${colors.icon}
              w-12 h-12 rounded-xl
              flex items-center justify-center
              shadow-md text-white text-xl
            `}
          >
            {icon}
          </div>
          <div>
            <h3 className={`text-sm font-medium ${colors.text}`}>{title}</h3>
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && (
          <div
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold
              ${
                trend.direction === 'up'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }
            `}
          >
            <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <div className={`text-4xl font-bold ${colors.value}`}>{value}</div>
      </div>

      {/* Subtitle */}
      <div className={`text-sm ${colors.text}`}>{subtitle}</div>
    </div>
  );
}
