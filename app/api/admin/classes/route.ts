// API endpoint for managing classes (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

// GET - List all classes
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch classes with student count
    const { data: classes, error } = await supabase
      .from('classes')
      .select(`
        *,
        students(count)
      `)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ classes });
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

// POST - Create new class
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kelas harus diisi' },
        { status: 400 }
      );
    }

    // Check if class name already exists
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('name', name.trim())
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Nama kelas sudah digunakan' },
        { status: 400 }
      );
    }

    // Create class
    const { data, error } = await supabase
      .from('classes')
      .insert({ name: name.trim() })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ class: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
