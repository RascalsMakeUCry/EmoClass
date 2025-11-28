// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format tanggal Indonesia (contoh: Senin, 29 November 2025)
export function formatIndonesianDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

// Validasi panjang catatan (maks 100 karakter)
export function validateNoteLength(note: string) {
  return note.trim().length <= 100;
}

// Ambil label perasaan dari EmotionType
export function getEmotionLabel(
  emotion: "happy" | "normal" | "stressed"
): string {
  switch (emotion) {
    case "happy":
      return "Senang";
    case "normal":
      return "Biasa Saja";
    case "stressed":
      return "Sedih";
    default:
      return "";
  }
}

// Ambil emoji perasaan dari EmotionType
export function getEmotionEmoji(
  emotion: "happy" | "normal" | "stressed"
): string {
  switch (emotion) {
    case "happy":
      return "😊";
    case "normal":
      return "😐";
    case "stressed":
      return "😔";
    default:
      return "";
  }
}

// Dapatkan tanggal hari ini dalam format Indonesia
export function getTodayDate(): string {
  return formatIndonesianDate(new Date());
}
