'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { analyzeEnvironment, adcToGasPPM, adcToLux, adcToDecibels, type EnvironmentData } from '@/lib/environment-helper';

interface EnvironmentAlertCardProps {
  classId: string;
}

export default function EnvironmentAlertCard({ classId }: EnvironmentAlertCardProps) {
  const [environmentData, setEnvironmentData] = useState<EnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasDevice, setHasDevice] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    console.log('🔄 EnvironmentAlertCard mounted/updated. classId:', classId);
    
    if (!classId) {
      console.log('⚠️ No classId provided, skipping fetch');
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchEnvironmentData();

    // Setup Supabase Realtime subscription
    setRealtimeStatus('connecting');
    console.log('📡 Setting up Realtime subscription for iot_sensor_data...');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const channel = supabase
      .channel('environment-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'iot_sensor_data',
        },
        (payload) => {
          console.log('🔔 Realtime update received:', payload.new);
          // Update data instantly if it's for our class
          // We'll fetch to ensure it's the right device
          fetchEnvironmentData();
        }
      )
      .subscribe((status) => {
        console.log('📡 Realtime status:', status);
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
          console.log('✅ Realtime connected!');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeStatus('disconnected');
          console.log('❌ Realtime disconnected');
        }
      });

    // Fallback: Polling every 30 seconds (in case Realtime fails)
    const interval = setInterval(() => {
      if (realtimeStatus !== 'connected') {
        console.log('🔄 Fallback polling (Realtime not connected)');
        fetchEnvironmentData();
      }
    }, 30000);

    return () => {
      console.log('🧹 EnvironmentAlertCard cleanup');
      setRealtimeStatus('disconnected');
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [classId]);

  async function fetchEnvironmentData() {
    try {
      console.log('🌡️ Fetching environment data for classId:', classId);
      const response = await fetch(`/api/environment/current?classId=${classId}`);
      const result = await response.json();
      console.log('📊 API Response:', result);

      if (!response.ok) {
        console.log('❌ API Error:', result);
        if (result.hasDevice === false) {
          setHasDevice(false);
          setError('Kelas ini belum memiliki sensor IoT');
        } else if (result.hasData === false) {
          setError('Belum ada data sensor tersedia');
        } else {
          setError(result.error || 'Gagal memuat data lingkungan');
        }
        setEnvironmentData(null);
        setLoading(false);
        return;
      }

      console.log('✅ Environment data loaded successfully');
      setEnvironmentData(result.data);
      setHasDevice(true);
      setError('');
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching environment data:', err);
      setError('Gagal memuat data lingkungan');
      setLoading(false);
    }
  }

  // Don't show card if no device
  if (!loading && !hasDevice) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Error state (but has device)
  if (error && hasDevice) {
    return (
      <div className="bg-white/40 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📡</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              🌡️ Kondisi Ruang Kelas
            </h3>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!environmentData) {
    return null;
  }

  const analysis = analyzeEnvironment(environmentData);
  
  // Alert-Only Mode: Only show card if there are issues
  const hasIssues = analysis.level !== 'safe';

  // If everything is safe, show minimal compact card
  if (!hasIssues) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl shadow-md p-4 hover:shadow-lg transition-all duration-300 animate-fadeInScale">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">✅</div>
            <div>
              <h3 className="text-base font-bold text-green-900">
                Kondisi Ruangan Normal
              </h3>
              <p className="text-xs text-green-700">
                Semua sensor dalam kondisi baik
                {realtimeStatus === 'connected' && (
                  <span className="ml-2">• Live</span>
                )}
              </p>
            </div>
          </div>
          <a 
            href="/iot" 
            className="text-xs text-green-700 hover:text-green-900 underline"
          >
            Lihat Detail
          </a>
        </div>
      </div>
    );
  }

  // If there are issues, show simplified alert
  const bgColor = 
    analysis.level === 'danger' ? 'bg-red-50 border-red-300' :
    'bg-yellow-50 border-yellow-300';

  const iconColor =
    analysis.level === 'danger' ? 'text-red-600' :
    'text-yellow-600';

  const titleText =
    analysis.level === 'danger' ? 'Kondisi Ruangan Berbahaya' :
    'Kondisi Ruangan Perlu Perhatian';

  return (
    <div className={`${bgColor} rounded-2xl shadow-lg border-2 p-4 hover:shadow-xl transition-all duration-300 animate-fadeInScale`}>
      {/* Simplified Header */}
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${iconColor}`}>{analysis.icon}</div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-gray-900 mb-1">
            {titleText}
          </h3>
          
          {/* Issues - Compact */}
          <div className="text-sm text-gray-700 mb-2">
            {analysis.issues.join(' • ')}
          </div>

          {/* Single Main Recommendation */}
          <div className="text-sm text-gray-800 font-medium">
            💡 {analysis.recommendations[0]}
          </div>

          {/* Link to detail */}
          <a 
            href="/iot" 
            className="text-xs text-gray-600 hover:text-gray-900 underline mt-2 inline-block"
          >
            Lihat detail →
          </a>
        </div>
      </div>
    </div>
  );
}
