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

function classifyGas(g: number) {
  if (g < 1000) return "Aman";
  if (g <= 2000) return "Waspada";
  return "⚠️ Berbahaya";
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
  const [mounted, setMounted] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  // Fix hydration - mount after client side render
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch initial data
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("iot_sensor_data")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      return;
    }

    if (data && data.length > 0) {
      setRows(data);
    } else {
      setRows([]);
    }
  };

  // Realtime listener
  useEffect(() => {
    fetchData();
    setRealtimeStatus('connecting');

    const channel = supabase
      .channel("realtime-iot")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "iot_sensor_data" },
        (payload) => {
          setRows((prev) => [payload.new, ...prev].slice(0, 200));
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
        }
      });

    return () => {
      setRealtimeStatus('disconnected');
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
      className="min-h-screen p-4 lg:p-8"
      style={{
        background:
          'radial-gradient(circle at 70% 70%, #FFC966 0%, #FFE5B4 30%, #FFF8E7 60%)',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* IoT Monitoring Header */}
        <div className="relative z-30 mb-8">
          <div className="bg-gradient-to-r from-white/50 via-white/40 to-white/50 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/30 p-6 hover:shadow-3xl transition-all duration-300">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 tracking-tight">
                      IoT Monitoring Dashboard
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-gray-500 font-medium">
                        Pemantauan Lingkungan Kelas Real-time
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Section */}
        <div className="bg-gradient-to-r from-white/50 via-white/40 to-white/50 backdrop-blur-md rounded-3xl shadow-2xl border-2 border-white/30 p-6 mb-8 relative z-10 hover:shadow-3xl transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Realtime Status Indicator */}
              <div className="flex items-center gap-3 px-4 py-2.5 bg-white/100 rounded-xl border border-white/0">
                <div className={`w-3 h-3 rounded-full shadow-lg ${
                  realtimeStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`} />
                <span className="text-sm font-bold text-gray-800">
                  {realtimeStatus === 'connected' ? 'Live Update Aktif' :
                   realtimeStatus === 'connecting' ? 'Menghubungkan...' :
                   'Live Update Nonaktif'}
                </span>
              </div>
              
              {/* Last Updated */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white/100 rounded-xl">
                <span className="text-sm text-gray-500">Update Terakhir :</span>
                <span className="text-sm font-medium text-gray-600">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Sensor Filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Filter Sensor:</label>
              <Select
                onValueChange={(v: string) => setSensorFilter(v as SensorFilter)}
                value={sensorFilter}
              >
                <SelectTrigger className="w-64 px-5 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white text-gray-900 font-bold shadow-md hover:shadow-lg transition-all hover:border-orange-300">
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
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/40 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
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
          <Card className="bg-white/40 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
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
          <Card className="bg-white/40 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300">
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
        <Card className="p-8 bg-white/40 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-300 mb-8">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-6">Sensor Charts (WIB)</CardTitle>
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

        {/* Raw Data Table */}
        <Card className="p-8 bg-white/40 backdrop-blur-sm border border-white/20 hover:shadow-2xl transition-all duration-300">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-6">Data Terbaru (WIB)</CardTitle>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Time (WIB)</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Temp</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Humidity</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Gas</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Light</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Sound</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 5).map((row, idx) => (
                  <tr key={idx} className="border-b hover:bg-white/50 transition-colors">
                    <td className="px-4 py-3">
                      {row.created_at ? formatWIBDateTime(row.created_at) : "-"}
                    </td>
                    <td className="px-4 py-3 font-medium">{row.temperature}°C</td>
                    <td className="px-4 py-3 font-medium">{row.humidity}%</td>
                    <td className="px-4 py-3 font-medium">{row.gas_analog}</td>
                    <td className="px-4 py-3 font-medium">{row.light_analog}</td>
                    <td className="px-4 py-3 font-medium">{row.sound_analog}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-6xl mb-4">📭</span>
                <p className="text-lg">Tidak ada data tersedia</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
