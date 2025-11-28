// Cron job: Daily Summary Notification
// Run this every day at 3 PM
// Vercel Cron: 0 15 * * * (3 PM daily)

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

    // Get today's check-in stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: students } = await supabase
      .from('students')
      .select('id');

    const { data: checkins } = await supabase
      .from('emotion_checkins')
      .select('student_id, emotion')
      .gte('created_at', today.toISOString());

    const totalStudents = students?.length || 0;
    const uniqueCheckins = new Set(checkins?.map(c => c.student_id) || []);
    const checkedInCount = uniqueCheckins.size;
    const checkinRate = totalStudents > 0 ? Math.round((checkedInCount / totalStudents) * 100) : 0;

    // Count emotions
    const happyCount = checkins?.filter(c => c.emotion === 'happy').length || 0;
    const normalCount = checkins?.filter(c => c.emotion === 'normal').length || 0;
    const stressedCount = checkins?.filter(c => c.emotion === 'stressed').length || 0;

    // Determine mood
    let moodText = 'Netral';
    if (happyCount > stressedCount && happyCount > normalCount) {
      moodText = 'Positif 😊';
    } else if (stressedCount > happyCount) {
      moodText = 'Perlu Perhatian ⚠️';
    }

    // Create notification for each teacher
    const notifications = teachers.map(teacher => ({
      user_id: teacher.id,
      type: 'summary',
      priority: 'normal',
      title: '📊 Ringkasan Check-in Hari Ini',
      message: `Check-in hari ini: ${checkinRate}% (${checkedInCount}/${totalStudents} siswa). Mood kelas: ${moodText}. ${stressedCount > 0 ? stressedCount + ' siswa perlu perhatian.' : 'Semua siswa dalam kondisi baik!'}`,
      metadata: {
        date: today.toISOString(),
        total_students: totalStudents,
        checked_in: checkedInCount,
        checkin_rate: checkinRate,
        mood_positive: happyCount,
        mood_normal: normalCount,
        mood_negative: stressedCount,
        needs_attention: stressedCount,
      },
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Daily summary sent to ${teachers.length} teachers`,
      stats: {
        totalStudents,
        checkedInCount,
        checkinRate,
        happyCount,
        normalCount,
        stressedCount,
      },
    });
  } catch (error) {
    console.error('Daily summary error:', error);
    return NextResponse.json(
      { error: 'Failed to create daily summary' },
      { status: 500 }
    );
  }
}
