// Helper functions untuk membuat notifikasi manual
import { supabase } from './supabase-admin';

interface CreateNotificationParams {
  target: 'all_teachers' | 'all_users' | 'specific_user';
  userId?: string;
  type: 'alert' | 'system' | 'summary';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  title: string;
  message: string;
  metadata?: any;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const { target, userId, type, priority, title, message, metadata } = params;

    // Get target users
    let targetUsers: { id: string }[] = [];

    if (target === 'all_teachers') {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'teacher')
        .eq('is_active', true);
      targetUsers = data || [];
    } else if (target === 'all_users') {
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('is_active', true);
      targetUsers = data || [];
    } else if (target === 'specific_user' && userId) {
      targetUsers = [{ id: userId }];
    }

    if (targetUsers.length === 0) {
      return { success: false, error: 'No target users found' };
    }

    // Create notifications
    const notifications = targetUsers.map(u => ({
      user_id: u.id,
      type,
      priority,
      title,
      message,
      metadata: {
        ...metadata,
        source: 'system',
        created_at: new Date().toISOString(),
      },
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);

    if (error) {
      console.error('Create notification error:', error);
      return { success: false, error: error.message };
    }

    return { 
      success: true, 
      count: targetUsers.length,
      message: `Notification sent to ${targetUsers.length} user(s)`,
    };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}

// Specific notification helpers

export async function notifyBulkImport(className: string, studentCount: number) {
  return createNotification({
    target: 'all_teachers',
    type: 'system',
    priority: 'low',
    title: '👥 Data Siswa Baru Ditambahkan',
    message: `${studentCount} siswa baru berhasil ditambahkan ke ${className} melalui import Excel.`,
    metadata: {
      action: 'bulk_import',
      class_name: className,
      student_count: studentCount,
      import_method: 'excel',
    },
  });
}

export async function notifyClassCreated(className: string, classId: string) {
  return createNotification({
    target: 'all_teachers',
    type: 'system',
    priority: 'low',
    title: '🏫 Kelas Baru Dibuat',
    message: `Kelas ${className} berhasil dibuat. Anda sekarang dapat menambahkan siswa ke kelas ini.`,
    metadata: {
      action: 'class_created',
      class_id: classId,
      class_name: className,
    },
  });
}

export async function notifyStudentCheckin(
  studentName: string,
  className: string,
  emotion: string,
  notes?: string
) {
  const emotionEmoji: { [key: string]: string } = {
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    stressed: '😰',
  };

  const priority = emotion === 'sad' || emotion === 'stressed' ? 'high' : 'low';

  return createNotification({
    target: 'all_teachers',
    type: 'system',
    priority,
    title: `${emotionEmoji[emotion] || '📝'} Check-in Baru`,
    message: `${studentName} dari ${className} baru saja check-in dengan emosi: ${emotion}${notes ? `. Catatan: ${notes}` : ''}`,
    metadata: {
      action: 'student_checkin',
      student_name: studentName,
      class_name: className,
      emotion,
      notes,
    },
  });
}

export async function notifyTelegramAlert(
  studentName: string,
  className: string,
  alertType: string,
  details: any
) {
  return createNotification({
    target: 'all_teachers',
    type: 'alert',
    priority: 'urgent',
    title: '🚨 Alert dari Telegram Bot',
    message: `${studentName} dari ${className}: ${alertType}`,
    metadata: {
      source: 'telegram_bot',
      student_name: studentName,
      class_name: className,
      alert_type: alertType,
      details,
    },
  });
}

export async function notifyAdminAction(
  action: string,
  description: string,
  metadata?: any
) {
  return createNotification({
    target: 'all_teachers',
    type: 'system',
    priority: 'normal',
    title: '⚙️ Admin Action',
    message: description,
    metadata: {
      action,
      ...metadata,
    },
  });
}
