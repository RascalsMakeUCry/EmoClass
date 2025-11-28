// app/api/iot/apiBE/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase dengan SERVICE ROLE KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Interface data dari ESP32
interface SensorData {
  temperature: number;
  humidity: number;
  gas: { analog: number; digital: number };
  light: { analog: number; digital: number };
  sound: { analog: number; digital: number };
  deviceId: string; // MAC Address ESP32
}

export async function POST(request: Request) {
  try {
    const data: SensorData = await request.json();
    const { deviceId } = data;

    console.log("📥 Data diterima dari ESP32:", data);

    // Validasi data
    if (!deviceId || typeof data.temperature !== "number") {
      return NextResponse.json(
        {
          success: false,
          message: "Data tidak valid. Device ID dan temperature diperlukan.",
        },
        { status: 400 }
      );
    }

    // Cari device di database berdasarkan MAC Address
    const { data: deviceRecord, error: deviceError } = await supabase
      .from("iot_devices")
      .select("id, class_id")
      .eq("device_id", deviceId)
      .single();

    if (deviceError || !deviceRecord) {
      console.warn(`⚠️ Device ${deviceId} belum terdaftar`);
      return NextResponse.json(
        {
          success: false,
          message: `Device ${deviceId} not registered. Please add it to iot_devices table.`,
        },
        { status: 404 }
      );
    }

    // Simpan data sensor ke Supabase
    const { error: insertError } = await supabase
      .from("iot_sensor_data")
      .insert({
        device_id: deviceRecord.id,
        temperature: data.temperature,
        humidity: data.humidity,
        gas_analog: data.gas.analog,
        gas_digital: data.gas.digital,
        light_analog: data.light.analog,
        light_digital: data.light.digital,
        sound_analog: data.sound.analog,
        sound_digital: data.sound.digital,
      });

    if (insertError) {
      console.error("❌ Error insert ke Supabase:", insertError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal menyimpan data ke database",
          error: insertError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      `✅ Data dari ${deviceId} (Class: ${deviceRecord.class_id}) berhasil disimpan`
    );

    return NextResponse.json({
      success: true,
      message: "Data berhasil diterima dan disimpan",
      deviceId: deviceId,
      classId: deviceRecord.class_id,
    });
  } catch (error: any) {
    console.error("❌ Error API:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS untuk CORS (kalau perlu)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// GET endpoint untuk cek status (opsional)
export async function GET() {
  return NextResponse.json({
    status: "API IoT ready",
    timestamp: new Date().toISOString(),
  });
}
// Updated: 2025-11-29 05:30
