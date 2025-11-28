"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  gas_analog: number;
  gas_digital: number;
  light_analog: number;
  light_digital: number;
  sound_analog: number;
  sound_digital: number;
  created_at: string;
}

export default function IoTPage() {
  const [data, setData] = useState<SensorData | null>(null);

  // Ambil data awal + dengarkan realtime
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("iot_sensor_data")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      setData(data);
    };

    fetchData();

    // Realtime listener
    const channel = supabase
      .channel("iot-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "iot_sensor_data" },
        (payload) => {
          setData(payload.new as SensorData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Monitoring IoT</h1>
        <p className="text-gray-500">Memuat data sensor...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Monitoring IoT</h1>
      <p className="text-gray-500">
        Update terakhir: {new Date(data.created_at).toLocaleString()}
      </p>

      {/* Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Suhu */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold">Suhu</h2>
          <p className="text-3xl font-bold text-blue-600">
            {data.temperature} °C
          </p>
        </div>

        {/* Kelembapan */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold">Kelembapan</h2>
          <p className="text-3xl font-bold text-blue-600">{data.humidity} %</p>
        </div>

        {/* Gas */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold">Kualitas Udara (MQ)</h2>
          <p className="text-xl font-bold">{data.gas_analog}</p>
          <p
            className={`mt-2 font-semibold ${
              data.gas_digital === 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {data.gas_digital === 0 ? "Berbahaya" : "Aman"}
          </p>
        </div>

        {/* Cahaya */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold">Cahaya (LDR)</h2>
          <p className="text-xl font-bold">{data.light_analog}</p>
          <p
            className={`mt-2 font-semibold ${
              data.light_digital === 0 ? "text-yellow-600" : "text-blue-600"
            }`}
          >
            {data.light_digital === 0 ? "Gelap" : "Terang"}
          </p>
        </div>

        {/* Suara */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-lg font-semibold">Kebisingan</h2>
          <p className="text-xl font-bold">{data.sound_analog}</p>
          <p
            className={`mt-2 font-semibold ${
              data.sound_digital === 0 ? "text-red-600" : "text-green-600"
            }`}
          >
            {data.sound_digital === 0 ? "Bising" : "Hening"}
          </p>
        </div>
      </div>
    </div>
  );
}
