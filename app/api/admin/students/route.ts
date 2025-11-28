// API endpoint for managing students (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

// GET - List all students (optionally filtered by class)
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

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('class_id');

    let query = supabase
      .from('students')
      .select('*')
      .order('name');

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data: students, error } = await query;

    if (error) throw error;

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST - Create new student
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
    const { name, class_id } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama siswa harus diisi' },
        { status: 400 }
      );
    }

    if (!class_id) {
      return NextResponse.json(
        { error: 'Kelas harus dipilih' },
        { status: 400 }
      );
    }

    // Verify class exists
    const { data: classData } = await supabase
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .single();

    if (!classData) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Create student
    const { data, error } = await supabase
      .from('students')
      .insert({ 
        name: name.trim(),
        class_id 
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ student: data }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
