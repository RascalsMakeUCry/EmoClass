// pages/api/dashboard/class/[classId].ts
import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Inisialisasi Supabase Client dengan SERVICE ROLE KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tipe untuk data siswa yang perlu perhatian
interface StudentNeedingAttention {
  studentId: string;
  studentName: string;
  emotion: "stressed" | "sleepy" | "normal";
  note: string | null;
  timestamp: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { classId } = req.query;

  if (!classId || typeof classId !== "string") {
    return res
      .status(400)
      .json({ message: "Class ID is required and must be a string." });
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  try {
    // --- 1. Ambil DAFTAR LENGKAP SISWA untuk dropdown ---
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("*")
      .eq("class_id", classId)
      .order("name");

    if (studentsError) throw studentsError;

    const studentIds = students?.map((s) => s.id) || [];
    const totalStudents = studentIds.length;

    // --- 2. Cari perangkat IoT yang terkait dengan kelas ini ---
    let latestSensorData = null;
    const { data: device, error: deviceError } = await supabase
      .from("iot_devices")
      .select("id")
      .eq("class_id", classId)
      .single();

    if (device && !deviceError) {
      const { data: sensorData, error: sensorError } = await supabase
        .from("iot_sensor_data")
        .select("*")
        .eq("device_id", device.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (sensorData && !sensorError) latestSensorData = sensorData;
    }

    // --- 3. Ambil data emosi ---
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    let emotionCounts = {
      happy: 0,
      neutral: 0,
      normal: 0,
      stressed: 0,
      sleepy: 0,
    };
    let checkedInCount = 0;

    if (studentIds.length > 0) {
      const { data: checkins, error: checkinsError } = await supabase
        .from("emotion_checkins")
        .select("emotion, student_id")
        .in("student_id", studentIds)
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString());
      if (checkinsError) throw checkinsError;

      const uniqueStudents = new Set(checkins?.map((c) => c.student_id) || []);
      checkedInCount = uniqueStudents.size;

      checkins?.forEach((checkin) => {
        const emotion = checkin.emotion as keyof typeof emotionCounts;
        if (emotion in emotionCounts) emotionCounts[emotion]++;
      });
    }

    // --- 4. Ambil data siswa yang perlu perhatian ---
    let studentsNeedingAttention: StudentNeedingAttention[] = [];
    if (studentIds.length > 0) {
      const { data: attentionCheckins, error: attentionError } = await supabase
        .from("emotion_checkins")
        .select("id, student_id, emotion, note, created_at, students(name)")
        .in("student_id", studentIds)
        .in("emotion", ["stressed", "sleepy", "normal"])
        .gte("created_at", startOfDay.toISOString())
        .lte("created_at", endOfDay.toISOString())
        .order("created_at", { ascending: false });
      if (attentionError) throw attentionError;

      studentsNeedingAttention =
        attentionCheckins?.map((checkin) => ({
          studentId: checkin.student_id,
          studentName: (checkin.students as any)?.name || "Unknown",
          emotion: checkin.emotion as "stressed" | "sleepy" | "normal",
          note: checkin.note,
          timestamp: checkin.created_at,
        })) || [];
    }

    // --- 5. Kembalikan semua data, termasuk DAFTAR SISWA ---
    return res.status(200).json({
      students: students, // <-- TAMBAHKAN INI
      emotionData: emotionCounts,
      totalStudents: totalStudents,
      checkedInCount: checkedInCount,
      latestSensorData: latestSensorData,
      studentsNeedingAttention: studentsNeedingAttention,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
