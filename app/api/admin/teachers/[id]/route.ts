// Admin API for managing individual teacher
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken, hashPassword } from '@/lib/auth';

// PUT update teacher
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id } = await params;
    const { email, password, full_name, is_active } = await request.json();
    const updateData: any = {};

    if (email) updateData.email = email;
    if (full_name) updateData.full_name = full_name;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;
    if (password) {
      updateData.password_hash = await hashPassword(password);
    }

    updateData.updated_at = new Date().toISOString();

    const { data: teacher, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .eq('role', 'teacher')
      .select('id, email, full_name, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teacher });
  } catch (error) {
    console.error('Update teacher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat update akun guru' },
      { status: 500 }
    );
  }
}

// DELETE teacher
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)
    .eq('role', 'teacher');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
