import type {
  EmotionCheckin,
  EmotionType,
  DashboardStats,
  EmotionDistribution,
  WeeklyTrend,
  Student,
  Class,
} from './types';

/**
 * Calculate comprehensive dashboard statistics from check-in data
 */
export function calculateDashboardStats(
  checkins: EmotionCheckin[],
  totalStudents: number
): DashboardStats {
  if (totalStudents === 0) {
    return {
      studentsCheckedIn: { count: 0, total: 0, percentage: 0 },
      positiveEmotions: { percentage: 0, count: 0 },
      tiredLowEnergy: { percentage: 0, count: 0 },
      needsSupport: { percentage: 0, count: 0 },
    };
  }

  const checkedInCount = checkins.length;
  // Cap at 100% if more checkins than total students (shouldn't happen but handle gracefully)
  const checkedInPercentage = Math.min(100, (checkedInCount / totalStudents) * 100);

  // Categorize emotions
  const positiveEmotions = ['happy', 'neutral'];
  const tiredEmotions = ['sleepy'];
  const negativeEmotions = ['stressed', 'normal']; // 'normal' can indicate issues

  const positiveCount = checkins.filter((c) =>
    positiveEmotions.includes(c.emotion)
  ).length;
  const tiredCount = checkins.filter((c) =>
    tiredEmotions.includes(c.emotion)
  ).length;
  const negativeCount = checkins.filter((c) =>
    negativeEmotions.includes(c.emotion)
  ).length;

  // Calculate percentages based on checked-in students
  const positivePercentage =
    checkedInCount > 0 ? (positiveCount / checkedInCount) * 100 : 0;
  const tiredPercentage =
    checkedInCount > 0 ? (tiredCount / checkedInCount) * 100 : 0;
  const negativePercentage =
    checkedInCount > 0 ? (negativeCount / checkedInCount) * 100 : 0;

  return {
    studentsCheckedIn: {
      count: checkedInCount,
      total: totalStudents,
      percentage: Math.round(checkedInPercentage),
    },
    positiveEmotions: {
      percentage: Math.round(positivePercentage),
      count: positiveCount,
    },
    tiredLowEnergy: {
      percentage: Math.round(tiredPercentage),
      count: tiredCount,
    },
    needsSupport: {
      percentage: Math.round(negativePercentage),
      count: negativeCount,
    },
  };
}

/**
 * Calculate emotion distribution with counts and percentages
 */
export function calculateEmotionDistribution(
  checkins: EmotionCheckin[],
  classId?: string
): EmotionDistribution[] {
  // Filter by class if specified
  const filteredCheckins = classId
    ? checkins.filter((c) => {
        // Note: We'll need to join with students to get class_id
        // For now, we'll work with all checkins
        return true;
      })
    : checkins;

  const total = filteredCheckins.length;

  if (total === 0) {
    return [];
  }

  // Count emotions
  const emotionCounts: Record<EmotionType, number> = {
    happy: 0,
    neutral: 0,
    normal: 0,
    stressed: 0,
    sleepy: 0,
  };

  filteredCheckins.forEach((checkin) => {
    emotionCounts[checkin.emotion]++;
  });

  // Map emotions to colors
  const emotionColors: Record<EmotionType, string> = {
    happy: '#10b981', // green
    neutral: '#6ee7b7', // light green
    normal: '#fbbf24', // yellow
    stressed: '#ef4444', // red
    sleepy: '#f59e0b', // orange
  };

  // Convert to distribution array
  const distribution: EmotionDistribution[] = Object.entries(emotionCounts)
    .filter(([_, count]) => count > 0)
    .map(([emotion, count]) => ({
      emotion: emotion as EmotionType,
      count,
      percentage: Math.round((count / total) * 100),
      color: emotionColors[emotion as EmotionType],
    }))
    .sort((a, b) => b.count - a.count);

  return distribution;
}

/**
 * Calculate weekly mood trend for the past 7 days
 */
export function calculateWeeklyTrend(
  checkins: EmotionCheckin[],
  classes: Class[],
  endDate: Date = new Date()
): WeeklyTrend {
  // Generate last 7 days
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  // Initialize data structure
  const data: WeeklyTrend['data'] = {};
  const classColors = ['#ef4444', '#3b82f6', '#8b5cf6']; // red, blue, purple

  classes.forEach((cls, index) => {
    data[cls.id] = {
      className: cls.name,
      scores: new Array(7).fill(0),
      color: classColors[index % classColors.length],
    };
  });

  // Calculate positive mood score for each day and class
  dates.forEach((date, dateIndex) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    // Filter checkins for this day
    const dayCheckins = checkins.filter((c) => {
      const checkinDate = new Date(c.created_at);
      return checkinDate >= dayStart && checkinDate <= dayEnd;
    });

    // Calculate score for each class
    // Note: We need to join with students to get class_id
    // For now, calculate overall score
    if (dayCheckins.length > 0) {
      const positiveCount = dayCheckins.filter((c) =>
        ['happy', 'neutral'].includes(c.emotion)
      ).length;
      const score = Math.round((positiveCount / dayCheckins.length) * 100);

      // Apply score to all classes (temporary until we have proper class filtering)
      Object.keys(data).forEach((classId) => {
        data[classId].scores[dateIndex] = score;
      });
    }
  });

  return { dates, data };
}

/**
 * Get emotion color based on emotion type
 */
export function getEmotionColor(emotion: EmotionType): string {
  const colors: Record<EmotionType, string> = {
    happy: '#10b981',
    neutral: '#6ee7b7',
    normal: '#fbbf24',
    stressed: '#ef4444',
    sleepy: '#f59e0b',
  };
  return colors[emotion];
}

/**
 * Get semantic color category (for consistency checking)
 */
export function getSemanticColor(color: string): 'positive' | 'warning' | 'negative' {
  const greenShades = ['#10b981', '#6ee7b7'];
  const yellowShades = ['#fbbf24', '#f59e0b'];
  const redShades = ['#ef4444'];

  if (greenShades.includes(color)) return 'positive';
  if (yellowShades.includes(color)) return 'warning';
  if (redShades.includes(color)) return 'negative';

  return 'warning'; // default
}
