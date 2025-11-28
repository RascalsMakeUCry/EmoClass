// TypeScript interfaces for EmoClass application

export interface Class {
  id: string;
  name: string;
  created_at: string;
}

export interface Student {
  id: string;
  name: string;
  class_id: string;
  created_at: string;
}

export type EmotionType = 'happy' | 'neutral' | 'normal' | 'stressed' | 'sleepy';

export interface EmotionCheckin {
  id: string;
  student_id: string;
  emotion: EmotionType;
  note: string | null;
  created_at: string;
}

export interface DashboardData {
  emotionDistribution: Record<EmotionType, number>;
  studentsNeedingAttention: Array<{
    studentId: string;
    studentName: string;
    emotion: EmotionType;
    note: string | null;
    timestamp: string;
  }>;
  progress: {
    checkedIn: number;
    total: number;
  };
}

export interface CheckInFormData {
  classId: string;
  studentId: string;
  emotion: EmotionType;
  note?: string;
}

export interface EnvironmentalData {
  brightness: number; // 0-100
  noiseLevel: number[]; // Hourly data
}

// Dashboard UI Upgrade Types

export interface DashboardStats {
  studentsCheckedIn: {
    count: number;
    total: number;
    percentage: number;
  };
  positiveEmotions: {
    percentage: number;
    count: number;
  };
  tiredLowEnergy: {
    percentage: number;
    count: number;
  };
  needsSupport: {
    percentage: number;
    count: number;
  };
}

export interface EmotionDistribution {
  emotion: EmotionType;
  count: number;
  percentage: number;
  color: string;
}

export interface WeeklyTrend {
  dates: string[]; // Last 7 days in ISO format
  data: {
    [classId: string]: {
      className: string;
      scores: number[]; // One score per day (0-100)
      color: string;
    };
  };
}

export interface TrendDataPoint {
  date: string;
  scores: {
    [classId: string]: number;
  };
}

export interface StatsCardData {
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

export interface UserProfile {
  name: string;
  avatar: string;
  email?: string;
}
