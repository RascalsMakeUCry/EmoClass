// Helper functions for environment monitoring and classification

export interface EnvironmentData {
  temperature: number;
  humidity: number;
  gas_analog: number;
  light_analog: number;
  sound_analog: number;
  created_at: string;
}

// Conversion functions: ADC (0-4095) → Real units
// These are approximate formulas based on common sensor characteristics

/**
 * Convert MQ sensor ADC to approximate ppm (CO2 equivalent)
 * Formula based on typical MQ-135 characteristics
 */
export function adcToGasPPM(adc: number): number {
  // Approximate conversion for MQ-135
  // This is a simplified linear approximation
  // For accurate conversion, need sensor-specific calibration
  const minPPM = 400;   // Outdoor air baseline
  const maxPPM = 5000;  // Maximum expected in classroom
  const ppm = minPPM + ((adc / 4095) * (maxPPM - minPPM));
  return Math.round(ppm);
}

/**
 * Convert LDR ADC to approximate lux
 * Formula based on typical LDR with 10kΩ pull-down resistor
 * Adjusted for realistic indoor lighting (0-2000 lux range)
 */
export function adcToLux(adc: number): number {
  // Approximate conversion for LDR
  // Higher ADC = brighter light
  if (adc < 100) return 0;
  
  // Map ADC to realistic indoor lux range (0-2000 lux)
  // ADC 0-1000 → 0-300 lux (dark to dim)
  // ADC 1000-3000 → 300-800 lux (normal classroom)
  // ADC 3000-4095 → 800-2000 lux (very bright)
  const normalized = adc / 4095;
  const lux = Math.pow(normalized, 0.5) * 2000;
  return Math.round(lux);
}

/**
 * Convert Microphone ADC to approximate dB
 * Formula based on typical electret microphone module
 */
export function adcToDecibels(adc: number): number {
  // Approximate conversion for microphone sensor
  // Baseline: 30 dB (very quiet)
  // Maximum: 90 dB (very loud)
  const minDB = 30;
  const maxDB = 90;
  
  // Logarithmic scale for sound (more realistic)
  if (adc < 50) return minDB;
  
  const normalized = Math.min(adc / 2000, 1); // Cap at 2000 ADC
  const db = minDB + (normalized * (maxDB - minDB));
  return Math.round(db);
}

export interface EnvironmentAlert {
  level: 'safe' | 'warning' | 'danger';
  issues: string[];
  recommendations: string[];
  icon: string;
}

// Classification thresholds in REAL UNITS (after conversion)
const THRESHOLDS = {
  temperature: {
    cold: 20,      // °C
    hot: 30,       // °C
    extreme: 35,   // °C
  },
  humidity: {
    dry: 30,       // %
    humid: 70,     // %
    extreme: 85,   // %
  },
  gas: {
    // CO2/Gas in ppm (parts per million)
    safe: 800,       // < 800 ppm = Udara bersih
    warning: 1200,   // 800-1200 ppm = Mulai pengap
    danger: 1500,    // ≥ 1500 ppm = Kualitas udara buruk
  },
  light: {
    // Illuminance in lux (adjusted for indoor range)
    dark: 200,       // < 200 lux = Gelap
    dim: 400,        // 200-400 lux = Redup
    bright: 1200,    // > 1200 lux = Sangat terang
  },
  sound: {
    // Sound level in dB (decibels)
    quiet: 40,       // < 40 dB = Tenang
    normal: 55,      // 40-55 dB = Normal
    noisy: 70,       // ≥ 70 dB = Berisik
  },
};

export function classifyTemperature(temp: number): { status: string; level: 'safe' | 'warning' | 'danger' } {
  if (temp < THRESHOLDS.temperature.cold) {
    return { status: '❄️ Dingin', level: 'warning' };
  }
  if (temp >= THRESHOLDS.temperature.extreme) {
    return { status: '🔥 Sangat Panas', level: 'danger' };
  }
  if (temp > THRESHOLDS.temperature.hot) {
    return { status: '🌡️ Panas', level: 'warning' };
  }
  return { status: '✅ Normal', level: 'safe' };
}

export function classifyHumidity(humidity: number): { status: string; level: 'safe' | 'warning' | 'danger' } {
  if (humidity >= THRESHOLDS.humidity.extreme) {
    return { status: '💧 Sangat Lembap', level: 'danger' };
  }
  if (humidity > THRESHOLDS.humidity.humid) {
    return { status: '💦 Lembap', level: 'warning' };
  }
  if (humidity < THRESHOLDS.humidity.dry) {
    return { status: '🏜️ Kering', level: 'warning' };
  }
  return { status: '✅ Normal', level: 'safe' };
}

export function classifyGas(gas: number): { status: string; level: 'safe' | 'warning' | 'danger' } {
  if (gas >= THRESHOLDS.gas.danger) {
    return { status: '⚠️ Berbahaya', level: 'danger' };
  }
  if (gas >= THRESHOLDS.gas.warning) {
    return { status: '⚡ Waspada', level: 'warning' };
  }
  return { status: '✅ Aman', level: 'safe' };
}

export function classifyLight(light: number): { status: string; level: 'safe' | 'warning' | 'danger' } {
  if (light < THRESHOLDS.light.dark) {
    return { status: '🌙 Gelap', level: 'warning' };
  }
  if (light < THRESHOLDS.light.dim) {
    return { status: '💡 Redup', level: 'warning' };
  }
  if (light > THRESHOLDS.light.bright) {
    return { status: '☀️ Sangat Terang', level: 'warning' };
  }
  return { status: '✅ Normal', level: 'safe' };
}

export function classifySound(sound: number): { status: string; level: 'safe' | 'warning' | 'danger' } {
  if (sound >= THRESHOLDS.sound.noisy) {
    return { status: '🔊 Berisik', level: 'danger' };
  }
  if (sound > THRESHOLDS.sound.normal) {
    return { status: '📢 Agak Berisik', level: 'warning' };
  }
  if (sound < THRESHOLDS.sound.quiet) {
    return { status: '🤫 Tenang', level: 'safe' };
  }
  return { status: '✅ Normal', level: 'safe' };
}

export function analyzeEnvironment(data: EnvironmentData): EnvironmentAlert {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let maxLevel: 'safe' | 'warning' | 'danger' = 'safe';

  // Convert ADC values to real units
  const gasPPM = adcToGasPPM(data.gas_analog);
  const lightLux = adcToLux(data.light_analog);
  const soundDB = adcToDecibels(data.sound_analog);

  // Analyze temperature
  const tempClass = classifyTemperature(data.temperature);
  if (tempClass.level !== 'safe') {
    issues.push(`Suhu: ${data.temperature.toFixed(1)}°C (${tempClass.status})`);
    if (data.temperature >= THRESHOLDS.temperature.extreme) {
      recommendations.push('🚨 SEGERA nyalakan AC atau pindah ke ruangan lebih sejuk');
      maxLevel = 'danger';
    } else if (data.temperature > THRESHOLDS.temperature.hot) {
      recommendations.push('Nyalakan AC atau buka jendela untuk sirkulasi udara');
      if (maxLevel === 'safe') maxLevel = 'warning';
    } else if (data.temperature < THRESHOLDS.temperature.cold) {
      recommendations.push('Tutup jendela atau nyalakan pemanas ruangan');
      if (maxLevel === 'safe') maxLevel = 'warning';
    }
  }

  // Analyze humidity
  const humidClass = classifyHumidity(data.humidity);
  if (humidClass.level !== 'safe') {
    issues.push(`Kelembaban: ${data.humidity.toFixed(1)}% (${humidClass.status})`);
    if (data.humidity >= THRESHOLDS.humidity.extreme) {
      recommendations.push('Gunakan dehumidifier atau tingkatkan ventilasi');
      if (maxLevel !== 'danger') maxLevel = 'warning';
    } else if (data.humidity > THRESHOLDS.humidity.humid) {
      recommendations.push('Buka jendela untuk mengurangi kelembaban');
      if (maxLevel === 'safe') maxLevel = 'warning';
    } else if (data.humidity < THRESHOLDS.humidity.dry) {
      recommendations.push('Gunakan humidifier atau letakkan wadah air di ruangan');
      if (maxLevel === 'safe') maxLevel = 'warning';
    }
  }

  // Analyze gas/air quality (converted to ppm)
  const gasClass = classifyGas(gasPPM);
  if (gasClass.level !== 'safe') {
    issues.push(`Kualitas Udara: ${gasPPM} ppm (${gasClass.status})`);
    if (gasPPM >= THRESHOLDS.gas.danger) {
      recommendations.push('🚨 BAHAYA! Evakuasi siswa dan buka semua jendela');
      maxLevel = 'danger';
    } else if (gasPPM >= THRESHOLDS.gas.warning) {
      recommendations.push('Buka jendela untuk sirkulasi udara segar');
      if (maxLevel === 'safe') maxLevel = 'warning';
    }
  }

  // Analyze light (converted to lux)
  const lightClass = classifyLight(lightLux);
  if (lightClass.level !== 'safe') {
    issues.push(`Kecerahan: ${lightLux} lux (${lightClass.status})`);
    if (lightLux < THRESHOLDS.light.dark) {
      recommendations.push('Nyalakan lampu untuk pencahayaan yang lebih baik');
      if (maxLevel === 'safe') maxLevel = 'warning';
    } else if (lightLux > THRESHOLDS.light.bright) {
      recommendations.push('Tutup tirai atau kurangi intensitas cahaya');
      if (maxLevel === 'safe') maxLevel = 'warning';
    }
  }

  // Analyze sound (converted to dB)
  const soundClass = classifySound(soundDB);
  if (soundClass.level !== 'safe') {
    issues.push(`Kebisingan: ${soundDB} dB (${soundClass.status})`);
    if (soundDB >= THRESHOLDS.sound.noisy) {
      recommendations.push('Kelas terlalu berisik, coba aktivitas yang lebih tenang');
      if (maxLevel !== 'danger') maxLevel = 'warning';
    } else if (soundDB > THRESHOLDS.sound.normal) {
      recommendations.push('Tingkat kebisingan agak tinggi, perhatikan konsentrasi siswa');
      if (maxLevel === 'safe') maxLevel = 'warning';
    }
  }

  // Determine icon based on level
  const icon = maxLevel === 'danger' ? '🚨' : maxLevel === 'warning' ? '⚠️' : '✅';

  // If no issues, add positive message
  if (issues.length === 0) {
    issues.push('Semua kondisi lingkungan dalam keadaan baik');
    recommendations.push('Pertahankan kondisi ruangan yang nyaman ini');
  }

  return {
    level: maxLevel,
    issues,
    recommendations,
    icon,
  };
}
