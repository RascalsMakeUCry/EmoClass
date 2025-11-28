// API endpoint for managing individual class (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';

// PUT - Update class
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
    const { name } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Nama kelas harus diisi' },
        { status: 400 }
      );
    }

    // Check if class name already exists (excluding current class)
    const { data: existing } = await supabase
      .from('classes')
      .select('id')
      .eq('name', name.trim())
      .neq('id', params.id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Nama kelas sudah digunakan' },
        { status: 400 }
      );
    }

    // Update class
    const { data, error } = await supabase
      .from('classes')
      .update({ name: name.trim() })
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json({ class: data });
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    );
  }
}

// DELETE - Delete class
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

    // Delete class (students will be cascade deleted if foreign key is set up)
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    );
  }
}
