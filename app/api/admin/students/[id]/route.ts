// API endpoint for managing individual student (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

// PUT - Update student
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
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

    const updateData: any = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Nama siswa harus diisi' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (class_id !== undefined) {
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
      updateData.class_id = class_id;
    }

    // Update student
    const { data, error } = await supabase
      .from('students')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: data });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE - Delete student
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    
    // Verify admin authentication
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete student
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
