import { StatsCardData } from '@/lib/types';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  percentage?: string;
}

const colorClasses = {
  green: {
    bg: 'bg-white/40',
    color: '#C7EA83',
  },
  yellow: {
    bg: 'bg-white/40',
    color: '#EFBC60',
  },
  red: {
    bg: 'bg-white/40',
    color: '#ED8D8D',
  },
  blue: {
    bg: 'bg-white/40',
    color: '#D8C4FF',
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  percentage,
}: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className={`
        ${colors.bg}
        rounded-2xl p-6
        transition-all duration-300
        hover:shadow-xl
        cursor-default
        shadow-md
      `}
      style={{ fontFamily: 'var(--font-poppins)' }}
    >
      {/* Top Section: Circle and Title */}
      <div className="flex items-start gap-4 mb-4">
        {/* Circular Percentage */}
        {percentage && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="#ffffff"
                //stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke={colors.color}
                strokeWidth="6"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - parseInt(percentage) / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            {/* Percentage text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-900">
                {percentage}
              </span>
            </div>
          </div>
        )}

        {/* Title Section */}
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-1" style={{ color: colors.color }}>
            {title}
          </h3>
          <div className="text-base font-semibold text-gray-900">{subtitle}</div>
        </div>
      </div>

      {/* Bottom Section: Value */}
      <div className="text-sm text-gray-600">{value}</div>
    </div>
  );
}
