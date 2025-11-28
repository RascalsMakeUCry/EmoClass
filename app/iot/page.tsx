"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

// UI Components
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";

// Recharts
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ---- Classification ----
function classifyTemperature(t: number) {
  if (t < 20) return "❄️ Dingin";
  if (t <= 30) return "🙂 Normal";
  return "🔥 Panas";
}

function classifyHumidity(h: number) {
  if (h < 30) return "Kering";
  if (h <= 60) return "Normal";
  return "Lembap";
}

function classifyLight(l: number) {
  if (l < 1000) return "Gelap";
  if (l <= 2500) return "Normal";
  return "Terang";
}

function classifyGas(g: number) {
  if (g < 1000) return "Aman";
  if (g <= 2000) return "Waspada";
  return "⚠️ Berbahaya";
}

function classifySound(s: number) {
  if (s < 800) return "Tenang";
  if (s <= 1800) return "Normal";
  return "🔊 Berisik";
}

// ---- PAGE ----
type SensorFilter =
  | "all"
  | "temperature"
  | "humidity"
  | "gas_analog"
  | "light_analog"
  | "sound_analog";

export default function IoTPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [sensorFilter, setSensorFilter] = useState<SensorFilter>("all");

  // Fetch initial data
  const fetchData = async () => {
    const { data } = await supabase
      .from("iot_sensor_data")
      .select("*")
      .order("id", { ascending: false })
      .limit(200);

    if (data) setRows(data);
  };

  // Realtime listener
  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("realtime-iot")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "iot_sensor_data" },
        (payload) => {
          setRows((prev) => [payload.new, ...prev].slice(0, 200));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter by sensor
  const filtered = useMemo(() => {
    if (sensorFilter === "all") return rows;
    return rows.filter(
      (r) => r[sensorFilter] !== undefined && r[sensorFilter] !== null
    );
  }, [rows, sensorFilter]);

  const graphData = filtered
    .slice()
    .reverse()
    .map((row) => ({
      time: new Date(row.created_at).toLocaleTimeString(),
      temperature: row.temperature,
      humidity: row.humidity,
      gas: row.gas_analog,
      light: row.light_analog,
      sound: row.sound_analog,
    }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">📡 IoT Monitoring Dashboard</h1>

      {/* Sensor Filter */}
      <Card className="p-4">
        <p className="font-semibold mb-2">Filter Sensor</p>
        <Select
          onValueChange={(v) => setSensorFilter(v as SensorFilter)}
          value={sensorFilter}
        >
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Pilih sensor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Sensor</SelectItem>
            <SelectItem value="temperature">Temperature</SelectItem>
            <SelectItem value="humidity">Humidity</SelectItem>
            <SelectItem value="gas_analog">Gas</SelectItem>
            <SelectItem value="light_analog">Light</SelectItem>
            <SelectItem value="sound_analog">Sound</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Temperature</CardTitle>
          </CardHeader>
          <CardContent className="text-xl">
            <div className="font-bold text-3xl">
              {filtered[0]?.temperature ?? "-"}°C
            </div>
            <div className="text-sm text-gray-500">
              {filtered[0] ? classifyTemperature(filtered[0].temperature) : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Humidity</CardTitle>
          </CardHeader>
          <CardContent className="text-xl">
            <div className="font-bold text-3xl">
              {filtered[0]?.humidity ?? "-"}%
            </div>
            <div className="text-sm text-gray-500">
              {filtered[0] ? classifyHumidity(filtered[0].humidity) : "-"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gas Level</CardTitle>
          </CardHeader>
          <CardContent className="text-xl">
            <div className="font-bold text-3xl">
              {filtered[0]?.gas_analog ?? "-"}
            </div>
            <div className="text-sm text-gray-500">
              {filtered[0] ? classifyGas(filtered[0].gas_analog) : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Card className="p-4">
        <CardTitle>📊 Sensor Charts</CardTitle>
        <div className="h-80 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              {(sensorFilter === "all" || sensorFilter === "temperature") && (
                <Line type="monotone" dataKey="temperature" stroke="#ff0000" />
              )}
              {(sensorFilter === "all" || sensorFilter === "humidity") && (
                <Line type="monotone" dataKey="humidity" stroke="#0000ff" />
              )}
              {(sensorFilter === "all" || sensorFilter === "gas_analog") && (
                <Line type="monotone" dataKey="gas" stroke="#ff6600" />
              )}
              {(sensorFilter === "all" || sensorFilter === "light_analog") && (
                <Line type="monotone" dataKey="light" stroke="#ffaa00" />
              )}
              {(sensorFilter === "all" || sensorFilter === "sound_analog") && (
                <Line type="monotone" dataKey="sound" stroke="#00aa00" />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
