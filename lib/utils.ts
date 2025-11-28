// Utility functions for formatting and data manipulation

/**
 * Format date to Indonesian locale
 * Example: "Senin, 27 November 2025"
 */
export function formatIndonesianDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const dayName = days[dateObj.getDay()];
  const day = dateObj.getDate();
  const monthName = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Format time to Indonesian locale (24-hour format)
 * Example: "13:45"
 */
export function formatIndonesianTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format number with Indonesian conventions
 * Example: 1000 -> "1.000"
 */
export function formatIndonesianNumber(num: number): string {
  return num.toLocaleString('id-ID');
}

/**
 * Get emotion label in Indonesian
 */
export function getEmotionLabel(emotion: string): string {
  const labels: Record<string, string> = {
    happy: 'Senang',
    neutral: 'Baik',
    normal: 'Biasa Saja',
    stressed: 'Sedih',
    sleepy: 'Mengantuk',
  };

  return labels[emotion] || emotion;
}

/**
 * Get emotion emoji
 */
export function getEmotionEmoji(emotion: string): string {
  const emojis: Record<string, string> = {
    happy: '😊',
    neutral: '👍',
    normal: '😐',
    stressed: '😔',
    sleepy: '😴',
  };

  return emojis[emotion] || '😐';
}

/**
 * Check if emotion is negative (needs attention)
 */
export function isNegativeEmotion(emotion: string): boolean {
  return emotion === 'stressed' || emotion === 'sleepy';
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validate note length (max 100 characters)
 */
export function validateNoteLength(note: string): boolean {
  return note.length <= 100;
}
