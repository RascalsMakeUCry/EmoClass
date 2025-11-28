// Cron job: Check Students Who Haven't Checked In
// Run this every day at 12 PM (noon)
// Vercel Cron: 0 12 * * * (12 PM daily)

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

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all students with their class info
    const { data: students } = await supabase
      .from('students')
      .select(`
        id,
        name,
        class_id,
        classes (
          name
        )
      `);

    if (!students || students.length === 0) {
      return NextResponse.json({ message: 'No students found' });
    }

    // Get today's check-ins
    const { data: todayCheckins } = await supabase
      .from('emotion_checkins')
      .select('student_id')
      .gte('created_at', today.toISOString());

    const checkedInIds = new Set(todayCheckins?.map(c => c.student_id) || []);

    // Find students who haven't checked in
    const missingStudents = students.filter(s => !checkedInIds.has(s.id));

    // Only send notification if there are missing check-ins
    if (missingStudents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All students have checked in today',
        stats: {
          totalStudents: students.length,
          checkedIn: students.length,
          missing: 0,
        },
      });
    }

    // Group by class
    const missingByClass: { [key: string]: { className: string; students: string[] } } = {};
    missingStudents.forEach(student => {
      const classId = student.class_id;
      const className = (student.classes as any)?.name || 'Unknown Class';
      
      if (!missingByClass[classId]) {
        missingByClass[classId] = { className, students: [] };
      }
      missingByClass[classId].students.push(student.name);
    });

    // Create summary message
    const classSummaries = Object.values(missingByClass).map(
      c => `${c.className}: ${c.students.length} siswa`
    );
    const summaryText = classSummaries.slice(0, 3).join(', ');
    const moreText = classSummaries.length > 3 ? ` dan ${classSummaries.length - 3} kelas lainnya` : '';

    // Determine priority based on percentage
    const missingPercentage = (missingStudents.length / students.length) * 100;
    let priority: 'urgent' | 'high' | 'normal' = 'normal';
    if (missingPercentage > 50) {
      priority = 'urgent';
    } else if (missingPercentage > 30) {
      priority = 'high';
    }

    // Create notification for each teacher
    const notifications = teachers.map(teacher => ({
      user_id: teacher.id,
      type: 'alert',
      priority,
      title: '⏰ Reminder: Siswa Belum Check-in',
      message: `${missingStudents.length} dari ${students.length} siswa belum melakukan check-in hari ini (${Math.round(missingPercentage)}%). ${summaryText}${moreText}.`,
      metadata: {
        date: today.toISOString(),
        total_students: students.length,
        checked_in: students.length - missingStudents.length,
        missing_count: missingStudents.length,
        missing_percentage: Math.round(missingPercentage),
        missing_by_class: missingByClass,
        missing_students: missingStudents.map(s => ({
          id: s.id,
          name: s.name,
          class_name: (s.classes as any)?.name,
        })),
      },
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: `Missing check-in alert sent to ${teachers.length} teachers`,
      stats: {
        totalStudents: students.length,
        checkedIn: students.length - missingStudents.length,
        missing: missingStudents.length,
        missingPercentage: Math.round(missingPercentage),
      },
    });
  } catch (error) {
    console.error('Check missing check-ins error:', error);
    return NextResponse.json(
      { error: 'Failed to check missing check-ins' },
      { status: 500 }
    );
  }
}
