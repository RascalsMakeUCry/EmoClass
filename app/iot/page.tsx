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

// Helper function untuk format waktu WIB
const formatWIBTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatWIBDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

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
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Fix hydration - mount after client side render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    console.log("🔍 Fetching data from Supabase...");
    setDebugInfo("Fetching data...");

    const { data, error } = await supabase
      .from("iot_sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    console.log("✅ Data received:", data);
    console.log("❌ Error:", error);
    console.log("📊 Total rows:", data?.length);

    if (error) {
      console.error("Error fetching data:", error);
      setDebugInfo(`Error: ${error.message}`);
      return;
    }

    if (data && data.length > 0) {
      console.log("🔢 First row:", data[0]);
      console.log("🌡️ Temperature:", data[0].temperature);
      console.log("💧 Humidity:", data[0].humidity);
      console.log(
        "🕒 Created at (WIB):",
        formatWIBDateTime(data[0].created_at)
      );
      setRows(data);
      setDebugInfo(
        `Loaded ${data.length} rows. Latest temp: ${
          data[0].temperature
        }°C at ${formatWIBTime(data[0].created_at)} WIB`
      );
    } else {
      console.warn("⚠️ No data found in database");
      setDebugInfo("No data found in database");
      setRows([]);
    }
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
          console.log("🔔 Realtime update:", payload.new);
          const currentTimeWIB = new Date().toLocaleTimeString("id-ID", {
            timeZone: "Asia/Jakarta",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          });
          setRows((prev) => [payload.new, ...prev].slice(0, 200));
          setDebugInfo(
            `New data: ${payload.new.temperature}°C at ${currentTimeWIB} WIB`
          );
        }
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
      });

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

  const graphData = useMemo(() => {
    return filtered
      .slice()
      .reverse()
      .map((row) => {
        // Format waktu ke WIB untuk graph
        const timestamp = row.created_at
          ? formatWIBTime(row.created_at)
          : new Date().toLocaleTimeString("id-ID", {
              timeZone: "Asia/Jakarta",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

        return {
          time: timestamp,
          temperature: row.temperature || 0,
          humidity: row.humidity || 0,
          gas: row.gas_analog || 0,
          light: row.light_analog || 0,
          sound: row.sound_analog || 0,
        };
      });
  }, [filtered]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div
      className="p-6 space-y-6"
      style={{
        background:
          'radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <h1 className="text-3xl font-bold mb-4">
        IoT Monitoring Dashboard
      </h1>

      {/* Debug Info */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="font-semibold text-blue-900">
          Debug Info (WIB - UTC+7):
        </p>
        <p className="text-sm text-blue-700">{debugInfo}</p>
        <p className="text-xs text-blue-600 mt-2">
          Total rows in state: {rows.length} | Filtered rows: {filtered.length}{" "}
          | Current WIB Time:{" "}
          {new Date().toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta" })}
        </p>
      </Card>

      {/* Sensor Filter */}
      <Card className="p-4 bg-white/40 border border-white/0">
        <p className="font-semibold mb-2">Filter Sensor</p>
        <Select
          onValueChange={(v: string) => setSensorFilter(v as SensorFilter)}
          value={sensorFilter}
        >
          <SelectTrigger className="w-64 bg-white/80">
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
        <Card className="bg-white/40 border border-white/0">
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
        <Card className="bg-white/40 border border-white/0">
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
        <Card className="bg-white/40 border border-white/0">
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

      {/* Charts - COMPLETELY FIXED */}
      <Card className="p-4 bg-white/40 border border-white/0">
        <CardTitle>Sensor Charts (WIB)</CardTitle>
        {graphData.length === 0 ? (
          <div
            className="mt-4 flex items-center justify-center text-gray-500"
            style={{ height: "320px" }}
          >
            No data available for chart
          </div>
        ) : (
          <div className="mt-4 w-full" style={{ height: "320px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={graphData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="time"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 10 }}
                />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                  }}
                  labelStyle={{ fontWeight: "bold" }}
                />
                <Legend />
                {(sensorFilter === "all" || sensorFilter === "temperature") && (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ff0000"
                    name="Temperature (°C)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {(sensorFilter === "all" || sensorFilter === "humidity") && (
                  <Line
                    type="monotone"
                    dataKey="humidity"
                    stroke="#0000ff"
                    name="Humidity (%)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {(sensorFilter === "all" || sensorFilter === "gas_analog") && (
                  <Line
                    type="monotone"
                    dataKey="gas"
                    stroke="#ff6600"
                    name="Gas Level"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {(sensorFilter === "all" ||
                  sensorFilter === "light_analog") && (
                  <Line
                    type="monotone"
                    dataKey="light"
                    stroke="#ffaa00"
                    name="Light Level"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {(sensorFilter === "all" ||
                  sensorFilter === "sound_analog") && (
                  <Line
                    type="monotone"
                    dataKey="sound"
                    stroke="#00aa00"
                    name="Sound Level"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Raw Data Table (for debugging) */}
      <Card className="p-4 bg-white/40 border border-white/0">
        <CardTitle className="mb-4">Raw Data - Last 5 Rows (WIB)</CardTitle>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Time (WIB)</th>
                <th className="px-4 py-2 text-left">Temp</th>
                <th className="px-4 py-2 text-left">Humidity</th>
                <th className="px-4 py-2 text-left">Gas</th>
                <th className="px-4 py-2 text-left">Light</th>
                <th className="px-4 py-2 text-left">Sound</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 5).map((row, idx) => (
                <tr key={idx} className="border-b">
                  <td className="px-4 py-2">
                    {row.created_at ? formatWIBDateTime(row.created_at) : "-"}
                  </td>
                  <td className="px-4 py-2">{row.temperature}°C</td>
                  <td className="px-4 py-2">{row.humidity}%</td>
                  <td className="px-4 py-2">{row.gas_analog}</td>
                  <td className="px-4 py-2">{row.light_analog}</td>
                  <td className="px-4 py-2">{row.sound_analog}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-4">No data available</p>
          )}
        </div>
      </Card>
    </div>
  );
}
