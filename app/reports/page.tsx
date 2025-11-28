'use client';

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Class, EmotionType } from '@/lib/types';
import { getTodayDate } from '@/lib/utils';
import EmotionPieChart from '@/components/EmotionPieChart';


interface DailyData {
  date: string;
  emotions: Record<EmotionType, number>;
  total: number;
}

export default function ReportsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>(getTodayDate());
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [totalEmotions, setTotalEmotions] = useState<Record<EmotionType, number>>({
    happy: 0,
    normal: 0,
    stressed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
    // Set default start date to 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedClassId && startDate && endDate) {
      loadReportData();
    }
  }, [selectedClassId, startDate, endDate]);

  async function loadClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
      
      if (data && data.length > 0 && !selectedClassId) {
        setSelectedClassId(data[0].id);
      }
    } catch (err) {
      setError(handleSupabaseError(err));
    }
  }

  async function loadReportData() {
    setLoading(true);
    setError('');

    try {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      // Get all students for this class
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id')
        .eq('class_id', selectedClassId);

      if (studentsError) throw studentsError;

      const studentIds = students?.map(s => s.id) || [];

      if (studentIds.length === 0) {
        setDailyData([]);
        return;
      }

      // Get all check-ins in date range
      const { data: checkins, error: checkinsError } = await supabase
        .from('emotion_checkins')
        .select('emotion, created_at')
        .in('student_id', studentIds)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at');

      if (checkinsError) throw checkinsError;

      // Group by date
      const dataByDate: Record<string, Record<EmotionType, number>> = {};
      const totals: Record<EmotionType, number> = {
        happy: 0,
        normal: 0,
        stressed: 0,
      };

      checkins?.forEach(checkin => {
        const date = new Date(checkin.created_at).toISOString().split('T')[0];
        const emotion = checkin.emotion as EmotionType;

        if (!dataByDate[date]) {
          dataByDate[date] = {
            happy: 0,
            normal: 0,
            stressed: 0,
          };
        }

        dataByDate[date][emotion]++;
        totals[emotion]++;
      });

      // Convert to array
      const dailyArray: DailyData[] = Object.entries(dataByDate).map(([date, emotions]) => ({
        date,
        emotions,
        total: Object.values(emotions).reduce((a, b) => a + b, 0),
      }));

      dailyArray.sort((a, b) => b.date.localeCompare(a.date));

      setDailyData(dailyArray);
      setTotalEmotions(totals);
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setLoading(false);
    }
  }

  const totalCheckins = Object.values(totalEmotions).reduce((a, b) => a + b, 0);
  const avgPerDay = dailyData.length > 0 ? (totalCheckins / dailyData.length).toFixed(1) : '0';

  return (
    <div 
      className="min-h-screen p-4 lg:p-8"
      style={{ 
        background: 'radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Filters Section */}
        <div className="bg-gradient-to-r from-white/50 via-white/40 to-white/50 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/30 p-6 mb-8 relative z-10 hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col gap-6">
            {/* Header with Icon */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">📈</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Laporan Historis</h2>
                <p className="text-sm text-gray-600 mt-1">Analisis data emosi siswa berdasarkan periode waktu</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Class Selector */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📚</span>
                  <span>Kelas</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm hover:border-blue-300 transition-colors"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  <span>Dari Tanggal</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm hover:border-blue-300 transition-colors"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <span>📅</span>
                  <span>Sampai Tanggal</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={getTodayDate()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 font-medium shadow-sm hover:border-blue-300 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="mt-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}
          </div>
        </div>

        {selectedClassId && !loading && dailyData.length > 0 && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <span className="text-sm text-gray-600 mb-2 block">Total Check-in</span>
                <div className="text-3xl font-bold text-gray-900 mb-2">{totalCheckins}</div>
                <p className="text-xs text-gray-500">check-in tercatat</p>
              </div>

              <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <span className="text-sm text-gray-600 mb-2 block">Jumlah Hari</span>
                <div className="text-3xl font-bold text-gray-900 mb-2">{dailyData.length}</div>
                <p className="text-xs text-gray-500">hari dalam periode</p>
              </div>

              <div className="bg-white/40 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <span className="text-sm text-gray-600 mb-2 block">Rata-rata per Hari</span>
                <div className="text-3xl font-bold text-gray-900 mb-2">{avgPerDay}</div>
                <p className="text-xs text-gray-500">check-in per hari</p>
              </div>
            </div>

            {/* Overall Distribution */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Distribusi Emosi Keseluruhan</h3>
              <EmotionPieChart emotionData={totalEmotions} />
            </div>

            {/* Daily Breakdown */}
            <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Data Per Hari</h3>
              <div className="space-y-4">
                {dailyData.map((day) => (
                  <div key={day.date} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {new Date(day.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-500">Total: {day.total} check-in</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(day.emotions).map(([emotion, count]) => (
                        <div key={emotion} className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-2xl mb-1">
                            {emotion === 'happy' && '😊'}
                            {emotion === 'normal' && '😐'}
                            {emotion === 'stressed' && '😔'}
                          </div>
                          <div className="text-lg font-bold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-500">
                            {day.total > 0 ? ((count / day.total) * 100).toFixed(0) : 0}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {selectedClassId && !loading && dailyData.length === 0 && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <span className="text-6xl mb-4 block">📭</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Tidak Ada Data</h3>
            <p className="text-gray-600">
              Tidak ada data check-in untuk periode yang dipilih
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
        )}

        {!selectedClassId && (
          <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center">
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Pilih Kelas</h3>
            <p className="text-gray-600">
              Silakan pilih kelas untuk melihat laporan
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
