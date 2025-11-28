// API endpoint to mark all notifications as read
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}
