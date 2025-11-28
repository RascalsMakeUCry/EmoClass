// app/iot/apiBE.ts
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Inisialisasi Supabase Client dengan SERVICE ROLE KEY
// Karena ini adalah lingkungan server yang terpercaya, gunakan kunci dengan akses penuh.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tipe data yang diterima dari ESP32
interface SensorData {
  temperature: number;
  humidity: number;
  gas: { analog: number; digital: number };
  light: { analog: number; digital: number };
  sound: { analog: number; digital: number };
  deviceId: string; // Ini adalah MAC Address dari ESP32
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Hanya menerima metode POST
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    const data: SensorData = req.body;
    const { deviceId } = data;

    // Validasi sederhana
    if (!deviceId || typeof data.temperature !== "number") {
      return res.status(400).json({
        success: false,
        message: "Data tidak valid. Device ID dan temperature diperlukan.",
      });
    }

    // Cari ID perangkat di tabel iot_devices berdasarkan MAC Address
    // Ini adalah langkah penting untuk menghubungkan data sensor ke kelas yang benar
    const { data: deviceRecord, error: deviceError } = await supabase
      .from("iot_devices")
      .select("id, class_id")
      .eq("device_id", deviceId)
      .single();

    if (deviceError || !deviceRecord) {
      console.warn(
        `Perangkat dengan ID ${deviceId} belum terdaftar. Data tidak disimpan.`
      );
      // Kembalikan error agar tim IoT tahu bahwa perangkat perlu didaftarkan terlebih dahulu
      return res.status(404).json({
        success: false,
        message: `Device with ID ${deviceId} not found. Please register it in the system first.`,
      });
    }

    // Simpan data sensor dengan device_id (primary key) yang benar
    const { error: insertError } = await supabase
      .from("iot_sensor_data")
      .insert({
        device_id: deviceRecord.id, // Gunakan ID (primary key) dari tabel iot_devices
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
      console.error("Error menyimpan data sensor ke Supabase:", insertError);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan data sensor ke database.",
      });
    }

    console.log(
      `✅ Data dari ${deviceId} (Kelas ID: ${deviceRecord.class_id}) berhasil disimpan.`
    );
    return res
      .status(200)
      .json({ success: true, message: "Data berhasil diterima dan disimpan." });
  } catch (error) {
    console.error("❌ Error pada API IoT:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
}
