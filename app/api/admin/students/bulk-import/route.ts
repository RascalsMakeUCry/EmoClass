// API endpoint for bulk importing students from Excel (admin only)
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-admin';
import { verifyToken } from '@/lib/auth';
import * as XLSX from 'xlsx';

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

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('class_id') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'File Excel harus diupload' },
        { status: 400 }
      );
    }

    if (!classId) {
      return NextResponse.json(
        { error: 'Kelas harus dipilih' },
        { status: 400 }
      );
    }

    // Verify class exists
    const { data: classData } = await supabase
      .from('classes')
      .select('id, name')
      .eq('id', classId)
      .single();

    if (!classData) {
      return NextResponse.json(
        { error: 'Kelas tidak ditemukan' },
        { status: 404 }
      );
    }

    // Read Excel file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Parse Excel
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'File Excel kosong atau format tidak valid' },
        { status: 400 }
      );
    }

    // Validate and prepare student data
    const students: { name: string; class_id: string }[] = [];
    const errors: string[] = [];

    data.forEach((row: any, index: number) => {
      const rowNumber = index + 2; // Excel row number (header is row 1)
      
      // Check for 'nama' or 'name' column (case insensitive)
      const name = row.nama || row.Nama || row.NAMA || 
                   row.name || row.Name || row.NAME ||
                   row['Nama Siswa'] || row['nama siswa'];

      if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push(`Baris ${rowNumber}: Nama siswa tidak valid atau kosong`);
        return;
      }

      students.push({
        name: name.trim(),
        class_id: classId,
      });
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Terdapat data yang tidak valid',
          details: errors,
          validCount: students.length,
          errorCount: errors.length
        },
        { status: 400 }
      );
    }

    if (students.length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data siswa yang valid untuk diimport' },
        { status: 400 }
      );
    }

    // Insert students in bulk
    const { data: insertedStudents, error: insertError } = await supabase
      .from('students')
      .insert(students)
      .select();

    if (insertError) {
      console.error('Bulk insert error:', insertError);
      return NextResponse.json(
        { error: 'Gagal menyimpan data siswa ke database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil mengimport ${insertedStudents?.length || 0} siswa ke kelas ${classData.name}`,
      count: insertedStudents?.length || 0,
      students: insertedStudents,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengimport data' },
      { status: 500 }
    );
  }
}
