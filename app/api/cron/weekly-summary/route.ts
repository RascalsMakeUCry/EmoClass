// Cron job: Weekly Summary Notification
// Run this every Monday at 8 AM
// Vercel Cron: 0 8 * * 1 (8 AM every Monday)

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active teachers
    const { data: teachers } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'teacher')
      .eq('is_active', true);

    if (!teachers || teachers.length === 0) {
      return NextResponse.json({ message: 'No teachers found' });
    }

    // Get last 7 days check-in stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const { data: students } = await supabase
      .from('students')
      .select('id');

    const { data: checkins } = await supabase
      .from('emotion_checkins')
      .select('student_id, emotion, created_at')
      .gte('created_at', weekAgo.toISOString());

    const totalStudents = students?.length || 0;
    const uniqueCheckins = new Set(checkins?.map(c => c.student_id) || []);
    const activeStudents = uniqueCheckins.size;
    const participationRate = totalStudents > 0 ? Math.round((activeStudents / totalStudents) * 100) : 0;

    // Count emotions
    const happyCount = checkins?.filter(c => c.emotion === 'happy').length || 0;
    const neutralCount = checkins?.filter(c => c.emotion === 'neutral').length || 0;
    const sadCount = checkins?.filter(c => c.emotion === 'sad').length || 0;
    const stressedCount = checkins?.filter(c => c.emotion === 'stressed').length || 0;
    const totalCheckins = checkins?.length || 0;

    // Calculate average daily check-ins
    const avgDailyCheckins = Math.round(totalCheckins / 7);

    // Find students with concerning patterns (3+ negative emotions)
    const studentEmotionCount: { [key: string]: { negative: number; total: number } } = {};
    checkins?.forEach(c => {
      if (!studentEmotionCount[c.student_id]) {
        studentEmotionCount[c.student_id] = { negative: 0, total: 0 };
      }
      studentEmotionCount[c.student_id].total++;
      if (c.emotion === 'sad' || c.emotion === 'stressed') {
        studentEmotionCount[c.student_id].negative++;
      }
    });

    const concerningStudents = Object.values(studentEmotionCount).filter(
      s => s.negative >= 3
    ).length;

    // Determine overall mood trend
    let trendEmoji = '📊';
    let trendText = 'Stabil';
    const positiveRate = totalCheckins > 0 ? (happyCount / totalCheckins) * 100 : 0;
    const negativeRate = totalCheckins > 0 ? ((sadCount + stressedCount) / totalCheckins) * 100 : 0;

    if (positiveRate > 60) {
      trendEmoji = '📈';
      trendText = 'Positif';
    } else if (negativeRate > 30) {
      trendEmoji = '📉';
      trendText = 'Perlu Perhatian';
    }

    // Create notification for each teacher
    const notifications = teachers.map(teacher => ({
      user_id: teacher.id,
      type: 'summary',
      priority: concerningStudents > 0 ? 'high' : 'normal',
      title: `${trendEmoji} Ringkasan Mingguan (7 Hari Terakhir)`,
      message: `Partisipasi: ${participationRate}% (${activeStudents}/${totalStudents} siswa). Rata-rata ${avgDailyCheckins} check-in/hari. Trend: ${trendText}. ${concerningStudents > 0 ? concerningStudents + ' siswa memerlukan perhatian khusus.' : 'Kondisi kelas baik!'}`,
      metadata: {
        period: 'weekly',
        start_date: weekAgo.toISOString(),
        end_date: new Date().toISOString(),
        total_students: totalStudents,
        active_students: activeStudents,
        participation_rate: participationRate,
        total_checkins: totalCheckins,
        avg_daily_checkins: avgDailyCheckins,
        emotions: {
          happy: happyCount,
          neutral: neutralCount,
          sad: sadCount,
          stressed: stressedCount,
        },
        concerning_students: concerningStudents,
        trend: trendText,
      },
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Weekly summary sent to ${teachers.length} teachers`,
      stats: {
        totalStudents,
        activeStudents,
        participationRate,
        totalCheckins,
        avgDailyCheckins,
        concerningStudents,
        trend: trendText,
      },
    });
  } catch (error) {
    console.error('Weekly summary error:', error);
    return NextResponse.json(
      { error: 'Failed to create weekly summary' },
      { status: 500 }
    );
  }
}
