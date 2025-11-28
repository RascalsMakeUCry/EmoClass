'use client';

import { useState, useEffect } from 'react';
import { supabase, handleSupabaseError } from '@/lib/supabase';
import { Class, Student, EmotionType } from '@/lib/types';
import { getEmotionLabel, getEmotionEmoji, validateNoteLength, formatIndonesianDate } from '@/lib/utils';

export default function CheckInPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<any>(null);

  const emotions: EmotionType[] = ['happy', 'normal', 'stressed'];

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  // Load students when class is selected
  useEffect(() => {
    if (selectedClassId) {
      loadStudents(selectedClassId);
    } else {
      setStudents([]);
      setSelectedStudentId('');
    }
  }, [selectedClassId]);

  // Check if student has already checked in today
  useEffect(() => {
    if (selectedStudentId) {
      checkTodayCheckin(selectedStudentId);
    } else {
      setHasCheckedInToday(false);
      setTodayCheckin(null);
    }
  }, [selectedStudentId]);

  async function loadClasses() {
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name');

      if (error) throw error;
      setClasses(data || []);
    } catch (err) {
      setError(handleSupabaseError(err));
    }
  }

  async function loadStudents(classId: string) {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', classId)
        .order('name');

      if (error) throw error;
      
      setStudents(data || []);
      
      if (!data || data.length === 0) {
        setError('Tidak ada siswa di kelas ini. Silakan hubungi administrator.');
      }
    } catch (err) {
      setError(handleSupabaseError(err));
    }
  }

  async function checkTodayCheckin(studentId: string) {
    try {
      const today = new Date();
      const startOfDay = new Date(today);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('emotion_checkins')
        .select('*')
        .eq('student_id', studentId)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        setHasCheckedInToday(true);
        setTodayCheckin(data[0]);
      } else {
        setHasCheckedInToday(false);
        setTodayCheckin(null);
      }
    } catch (err) {
      console.error('Error checking today checkin:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!selectedClassId) {
      setError('Silakan pilih kelas terlebih dahulu');
      return;
    }

    if (!selectedStudentId) {
      setError('Silakan pilih nama siswa terlebih dahulu');
      return;
    }

    if (!selectedEmotion) {
      setError('Silakan pilih emoji yang menggambarkan perasaan Anda');
      return;
    }

    if (note && !validateNoteLength(note)) {
      setError('Catatan tidak boleh lebih dari 100 karakter');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('emotion_checkins')
        .insert({
          student_id: selectedStudentId,
          emotion: selectedEmotion,
          note: note.trim() || null,
        });

      if (error) throw error;

      // Success - refresh check-in status
      setSuccess('Check-in berhasil! Terima kasih sudah berbagi perasaan Anda hari ini 😊');
      
      // Check for alert (3 consecutive stressed emotions)
      if (selectedEmotion === 'stressed') {
        try {
          await fetch('/api/check-alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId: selectedStudentId }),
          });
        } catch {
          // Don't show error to user, alert is background process
        }
      }
      
      // Refresh check-in status to show "already checked in" message
      await checkTodayCheckin(selectedStudentId);
      
      setSelectedEmotion(null);
      setNote('');
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(handleSupabaseError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div 
      className="min-h-screen p-4" 
      style={{ 
        fontFamily: 'var(--font-poppins)',
        background: 'radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 pt-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
            Halloo..
          </h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
            Bagaimana Harimu pagi ini ?
          </h2>
          <p className="text-gray-500 font-medium">
            {formatIndonesianDate(new Date())}
          </p>
          <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
            Bagaimana perasaan Anda hari ini? Ceritakan kepada kami untuk membantu guru memahami kondisi kelas dengan lebih baik.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/40 rounded-3xl shadow-lg p-8 space-y-6 animate-fadeIn">
          {/* Class Selector */}
          <div>
            <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
              Pilih Kelas
            </label>
            <select
              id="class"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900"
              disabled={isSubmitting}
            >
              <option value="" className="text-gray-900">-- Pilih Kelas --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id} className="text-gray-900">
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* Student Selector - Only show when class is selected */}
          {selectedClassId && (
            <div className="animate-fadeIn">
              <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-2">
                Nama Siswa
              </label>
              <select
                id="student"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white text-gray-900"
                disabled={isSubmitting}
              >
                <option value="" className="text-gray-900">-- Pilih Nama Anda --</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id} className="text-gray-900">
                    {student.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Already Checked In Message */}
          {selectedStudentId && hasCheckedInToday && todayCheckin && (
            <div className="animate-fadeIn bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="text-center">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  Kamu Sudah Check-in Hari Ini!
                </h3>
                <p className="text-green-700 mb-4">
                  Terima kasih sudah berbagi perasaanmu hari ini
                </p>
                <div className="bg-white rounded-xl p-4 inline-block">
                  <div className="flex items-center gap-3">
                    <span className="text-5xl">{getEmotionEmoji(todayCheckin.emotion)}</span>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Perasaan kamu:</p>
                      <p className="text-lg font-bold text-gray-800">{getEmotionLabel(todayCheckin.emotion)}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(todayCheckin.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  {todayCheckin.note && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600 italic">"{todayCheckin.note}"</p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Kamu bisa check-in lagi besok untuk berbagi perasaanmu
                </p>
              </div>
            </div>
          )}

          {/* Emotion Buttons - Only show when student is selected and hasn't checked in */}
          {selectedStudentId && !hasCheckedInToday && (
            <div className="animate-fadeIn">
              <label className="block text-base font-medium text-gray-600 mb-4" style={{ fontFamily: 'var(--font-poppins)' }}>
                Bagaimana perasaan kamu hari ini?
              </label>
            <div className="grid grid-cols-3 gap-4">
              {emotions.map((emotion, index) => {
                return (
                  <button
                    key={emotion}
                    type="button"
                    onClick={() => setSelectedEmotion(selectedEmotion === emotion ? null : emotion)}
                    disabled={isSubmitting}
                    style={{ animationDelay: `${index * 0.1}s`, fontFamily: 'var(--font-poppins)' }}
                    className={`
                      flex flex-col items-center justify-center
                      min-h-[120px] p-4 rounded-2xl border-2 transition-all duration-200
                      animate-fadeIn
                      ${
                        selectedEmotion === emotion
                          ? 'border-blue-400 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                      }
                      disabled:opacity-50 disabled:cursor-not-allowed
                      active:scale-95
                    `}
                  >
                    <span className="text-5xl mb-3 transform transition-transform">
                      {getEmotionEmoji(emotion)}
                    </span>
                    <span className="text-base font-semibold text-gray-700 text-center">
                      {getEmotionLabel(emotion)}
                    </span>
                  </button>
                );
              })}
            </div>
            </div>
          )}

          {/* Note Input - Only show when student is selected and hasn't checked in */}
          {selectedStudentId && !hasCheckedInToday && (
            <div className="animate-fadeIn">
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ceritakan sedikit tentang perasaan Anda hari ini..."
              maxLength={100}
              rows={3}
              disabled={isSubmitting}
              className="w-full px-4 py-3 bg-white text-gray-800 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">
              {note.length}/100 karakter
            </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Submit Button - Only show when hasn't checked in */}
          {!hasCheckedInToday && (
          <button
            type="submit"
            disabled={isSubmitting || !selectedEmotion}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-4 px-6 rounded-xl transition-all disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-lg shadow-md hover:shadow-lg active:scale-95 disabled:scale-100"
            style={{ fontFamily: 'var(--font-poppins)' }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Mengirim...
              </span>
            ) : (
              'Kirim Check-in'
            )}
          </button>
          )}
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Data Anda akan membantu guru memahami kondisi kelas dengan lebih baik</p>
        </div>
      </div>
    </div>
  );
}
