import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classUuid = searchParams.get('classId');

    if (!classUuid) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // First, get the numeric class_id from classes table
    // classes table uses UUID, but iot_devices.class_id uses int2 (1, 2, 3...)
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('id, name')
      .order('name');

    console.log('📚 Classes fetched:', classes);

    if (classesError || !classes) {
      console.error('❌ Error fetching classes:', classesError);
      return NextResponse.json(
        { error: 'Failed to fetch classes' },
        { status: 500 }
      );
    }

    // Find the index (1-based) of the class
    const classIndex = classes.findIndex(c => c.id === classUuid);
    console.log('🔍 Looking for classUuid:', classUuid);
    console.log('📍 Found at index:', classIndex);
    
    if (classIndex === -1) {
      console.error('❌ Class not found in list');
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    const numericClassId = classIndex + 1; // 1-based index
    console.log('🔢 Numeric class_id:', numericClassId);

    // Get ALL devices for this class
    const { data: devices, error: deviceError } = await supabase
      .from('iot_devices')
      .select('id')
      .eq('class_id', numericClassId);

    console.log('📡 Device query result:', { devices, error: deviceError });

    if (deviceError || !devices || devices.length === 0) {
      console.error('❌ No device found for class_id:', numericClassId);
      return NextResponse.json(
        { error: 'No IoT device found for this class', hasDevice: false },
        { status: 404 }
      );
    }

    // Get latest sensor data from ANY device in this class
    // This handles multiple devices and picks the most recent data
    const deviceIds = devices.map(d => d.id);
    const { data: sensorData, error: sensorError } = await supabase
      .from('iot_sensor_data')
      .select('*')
      .in('device_id', deviceIds)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (sensorError || !sensorData) {
      return NextResponse.json(
        { error: 'No sensor data available', hasDevice: true, hasData: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: sensorData,
      hasDevice: true,
      hasData: true,
    });
  } catch (error) {
    console.error('Error fetching environment data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
