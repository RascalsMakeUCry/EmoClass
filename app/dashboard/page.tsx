'use client';

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Class, EmotionType } from '@/lib/types';
import { formatIndonesianDate, getTodayDate } from '@/lib/utils';
import { calculateDashboardStats } from '@/lib/dashboard-stats';
import EmotionPieChart from '@/components/EmotionPieChart';
import StatsCard from '@/components/StatsCard';
import DashboardHeader from '@/components/DashboardHeader';
import { StatsCardSkeleton, PieChartSkeleton, ProgressCircleSkeleton, AttentionListSkeleton } from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [emotionData, setEmotionData] = useState<Record<EmotionType, number>>({
    happy: 0,
    neutral: 0,
    normal: 0,
    stressed: 0,
    sleepy: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [totalStudents, setTotalStudents] = useState(0);
  const [checkedInCount, setCheckedInCount] = useState(0);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [studentsNeedingAttention, setStudentsNeedingAttention] = useState<Array<{
    studentId: string;
    studentName: string;
    emotion: EmotionType;
    note: string | null;
    timestamp: string;
  }>>([]);

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Load dashboard data when class changes
  useEffect(() => {
    if (selectedClassId) {
      setIsInitialLoad(true);
      loadDashboardData();
    }
  }, [selectedClassId]);

  // Set up Realtime subscription
  useEffect(() => {
    if (!selectedClassId) {
      setRealtimeStatus('disconnected');
      return;
    }

    setRealtimeStatus('connecting');

    // Supabase Realtime subscription
    const channel = supabase
      .channel('dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'emotion_checkins',
        },
        () => {
          // Pass true to indicate this is a realtime update
          loadDashboardData(true);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        }
      });

    // Cleanup
    return () => {
      setRealtimeStatus('disconnected');
      supabase.removeChannel(channel);
    };
  }, [selectedClassId]);

  async function loadClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
      
      // Auto-select first class
      if (data && data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    } catch (err) {
      setError(handleSupabaseError(err));
    }
  }

  async function loadDashboardData(isRealtimeUpdate = false) {
    // Only show loading spinner on initial load, not on realtime updates
    if (!isRealtimeUpdate) {
      setIsLoading(true);
    }
    setError('');

    try {
      // Always get today's data
      const today = getTodayDate();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      // Get all students for this class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', selectedClassId);

      if (studentsError) throw studentsError;

      const studentIds = students?.map(s => s.id) || [];
      setTotalStudents(studentIds.length);

      if (studentIds.length === 0) {
        setEmotionData({ happy: 0, neutral: 0, normal: 0, stressed: 0, sleepy: 0 });
        setCheckedInCount(0);
        return;
      }

      // Get check-ins for these students on selected date
      const { data: checkins, error: checkinsError } = await supabase
        .from('emotion_checkins')
        .select('emotion, student_id')
        .in('student_id', studentIds)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString());

      if (checkinsError) throw checkinsError;

      // Count unique students who checked in
      const uniqueStudents = new Set(checkins?.map(c => c.student_id) || []);
      setCheckedInCount(uniqueStudents.size);

      // Count emotions
      const counts: Record<EmotionType, number> = {
        happy: 0,
        neutral: 0,
        normal: 0,
        stressed: 0,
        sleepy: 0,
      };

      checkins?.forEach(checkin => {
        const emotion = checkin.emotion as EmotionType;
        if (emotion in counts) {
          counts[emotion]++;
        }
      });

      setEmotionData(counts);

      // Get students needing attention (stressed or sleepy)
      const { data: attentionCheckins, error: attentionError } = await supabase
        .from('emotion_checkins')
        .select('id, student_id, emotion, note, created_at, students(name)')
        .in('student_id', studentIds)
        .in('emotion', ['stressed', 'sleepy'])
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (attentionError) throw attentionError;

      // Format attention list
      const attentionList = attentionCheckins?.map(checkin => ({
        studentId: checkin.student_id,
        studentName: (checkin.students as any)?.name || 'Unknown',
        emotion: checkin.emotion as EmotionType,
        note: checkin.note,
        timestamp: checkin.created_at,
      })) || [];

      setStudentsNeedingAttention(attentionList);
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  }



  // Calculate dashboard stats
  const dashboardStats = calculateDashboardStats(
    Object.entries(emotionData).flatMap(([emotion, count]) =>
      Array(count).fill({ emotion: emotion as EmotionType })
    ),
    totalStudents
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto relative">
        {/* Dashboard Header */}
        <div className="relative z-30">
          <DashboardHeader lastUpdated={new Date()} />
        </div>

        {/* Class Selector and Controls */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Realtime Status Indicator */}
              <div className={`w-3 h-3 rounded-full ${
                realtimeStatus === 'connected' ? 'bg-green-500' :
                realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                'bg-red-500'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {realtimeStatus === 'connected' ? 'Live Update Aktif' :
                 realtimeStatus === 'connecting' ? 'Menghubungkan...' :
                 'Live Update Nonaktif'}
              </span>
            </div>

            {/* Class Selector */}
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium transition-colors"
            >
              <option value="" className="text-gray-900">-- Pilih Kelas --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="text-gray-900">
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl">❌</span>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {selectedClassId && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-0">
            {isInitialLoad ? (
              <>
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </>
            ) : (
              <>
                <div className="animate-fadeInScale" style={{ animationDelay: '0ms' }}>
                  <StatsCard
                    title="Students Checked In"
                    value={`${dashboardStats.studentsCheckedIn.count}/${dashboardStats.studentsCheckedIn.total}`}
                    subtitle={`${dashboardStats.studentsCheckedIn.percentage}% participation today`}
                    icon="✓"
                    color="green"
                  />
                </div>
                <div className="animate-fadeInScale" style={{ animationDelay: '50ms' }}>
                  <StatsCard
                    title="Positive Emotions"
                    value={`${dashboardStats.positiveEmotions.percentage}%`}
                    subtitle={`${dashboardStats.positiveEmotions.count} students feeling happy`}
                    icon="😊"
                    color="green"
                  />
                </div>
                <div className="animate-fadeInScale" style={{ animationDelay: '100ms' }}>
                  <StatsCard
                    title="Tired / Low Energy"
                    value={`${dashboardStats.tiredLowEnergy.percentage}%`}
                    subtitle={`${dashboardStats.tiredLowEnergy.count} students need energy boost`}
                    icon="😴"
                    color="yellow"
                  />
                </div>
                <div className="animate-fadeInScale" style={{ animationDelay: '150ms' }}>
                  <StatsCard
                    title="Needs Support"
                    value={`${dashboardStats.needsSupport.percentage}%`}
                    subtitle={`${dashboardStats.needsSupport.count} students anxious or sad`}
                    icon="⚠️"
                    color="red"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Main Content */}
        {selectedClassId ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-0">
            {/* Emotion Distribution Chart */}
            {isInitialLoad ? (
              <PieChartSkeleton />
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-fadeInScale" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Distribusi Emosi Kelas
                  </h2>
                </div>
                <EmotionPieChart emotionData={emotionData} />
              </div>
            )}

            {/* Progress Indicator */}
            {isInitialLoad ? (
              <ProgressCircleSkeleton />
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 hover:shadow-2xl transition-all duration-300 animate-fadeInScale" style={{ animationDelay: '250ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">📈</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Progress Check-in
                  </h2>
                </div>
                <div className="flex flex-col items-center justify-center h-64">
                  {/* Progress Circle */}
                  <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      {/* Background circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#3b82f6"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - (totalStudents > 0 ? checkedInCount / totalStudents : 0))}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    {/* Percentage text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-gray-800">
                        {totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0}%
                      </span>
                    </div>
                  </div>

                  {/* Progress text */}
                  <p className="text-2xl font-semibold text-gray-800 mb-2">
                    {checkedInCount} dari {totalStudents} siswa
                  </p>
                  <p className="text-gray-600">
                    sudah check-in hari ini
                  </p>

                  {/* Status badge */}
                  {checkedInCount === totalStudents && totalStudents > 0 && (
                    <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold">
                      ✓ Semua siswa sudah check-in!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Students Needing Attention */}
            {isInitialLoad ? (
              <AttentionListSkeleton />
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:col-span-2 hover:shadow-2xl transition-all duration-300 animate-fadeInScale" style={{ animationDelay: '300ms' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-sm">⚠️</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Siswa yang Perlu Perhatian
                  </h2>
                </div>

                {/* Telegram Notification Info */}
                {studentsNeedingAttention.length > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">📱</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900 mb-1">
                          Notifikasi Otomatis Aktif
                        </p>
                        <p className="text-xs text-blue-700">
                          Sistem akan otomatis mengirim alert ke Guru BK via Telegram Bot jika siswa menunjukkan emosi negatif 3 hari berturut-turut.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {studentsNeedingAttention.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Semua siswa dalam kondisi baik 😊</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentsNeedingAttention.map((student, index) => (
                    <div
                      key={`${student.studentId}-${index}`}
                      className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg"
                    >
                      {/* Emotion Icon */}
                      <div className="text-3xl flex-shrink-0">
                        {student.emotion === 'stressed' ? '😔' : '😴'}
                      </div>

                      {/* Student Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {student.studentName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">
                          {student.emotion === 'stressed' ? 'Sedih' : 'Mengantuk'}
                        </p>
                        {student.note && (
                          <p className="text-sm text-gray-700 italic">
                            "{student.note}"
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(student.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      {/* Alert Badge */}
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Perlu Perhatian
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">
              Silakan pilih kelas untuk melihat dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
