// Skeleton loader components for better loading UX

export function StatsCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 transition-opacity duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 animate-shimmer rounded w-3/4 mb-3"></div>
          <div className="h-8 animate-shimmer rounded w-1/2 mb-2"></div>
          <div className="h-3 animate-shimmer rounded w-2/3"></div>
        </div>
        <div className="w-12 h-12 animate-shimmer rounded-xl"></div>
      </div>
    </div>
  );
}

export function PieChartSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-opacity duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 animate-shimmer rounded-lg"></div>
        <div className="h-6 animate-shimmer rounded w-48"></div>
      </div>
      <div className="flex items-center justify-center h-64">
        <div className="w-48 h-48 animate-shimmer rounded-full"></div>
      </div>
    </div>
  );
}

export function ProgressCircleSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 transition-opacity duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 animate-shimmer rounded-lg"></div>
        <div className="h-6 animate-shimmer rounded w-48"></div>
      </div>
      <div className="flex flex-col items-center justify-center h-64">
        <div className="w-40 h-40 animate-shimmer rounded-full mb-6"></div>
        <div className="h-6 animate-shimmer rounded w-40 mb-2"></div>
        <div className="h-4 animate-shimmer rounded w-32"></div>
      </div>
    </div>
  );
}

export function AttentionListSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:col-span-2 transition-opacity duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 animate-shimmer rounded-lg"></div>
        <div className="h-6 animate-shimmer rounded w-56"></div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="w-12 h-12 animate-shimmer rounded-full flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-5 animate-shimmer rounded w-32"></div>
              <div className="h-4 animate-shimmer rounded w-24"></div>
              <div className="h-3 animate-shimmer rounded w-48"></div>
            </div>
            <div className="w-24 h-6 animate-shimmer rounded-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
