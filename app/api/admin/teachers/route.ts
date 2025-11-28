// Admin API for managing teachers
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken, hashPassword } from '@/lib/auth';

// GET all teachers
export async function GET(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: teachers, error } = await supabase
    .from('users')
    .select('id, email, full_name, is_active, created_at')
    .eq('role', 'teacher')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ teachers });
}

// POST create new teacher
export async function POST(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyToken(token);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create teacher
    const { data: teacher, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        full_name,
        role: 'teacher',
        is_active: true,
      })
      .select('id, email, full_name, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error) {
    console.error('Create teacher error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat akun guru' },
      { status: 500 }
    );
  }
}
