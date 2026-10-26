import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx.
 * Handles conditional classes and deduplication.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generate a URL-friendly slug from a Turkish string.
 */
export function slugify(text: string): string {
  const turkishMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };

  return text
    .split("")
    .map((char) => turkishMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Format price in Turkish Lira.
 */
export function formatPrice(price: number | string | null | undefined): string {
  if (price === null || price === undefined) return "Fiyat için arayınız";

  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(numPrice)) return "Fiyat için arayınız";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Format a date for display in Turkish locale.
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Generate a WhatsApp URL with pre-filled message.
 */
export function getWhatsAppUrl(
  phone: string,
  message?: string
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encoded = message ? encodeURIComponent(message) : "";
  return `https://wa.me/${cleanPhone}${encoded ? `?text=${encoded}` : ""}`;
}

/**
 * Production-ready in-memory sliding window rate limiter with auto-pruning.
 * Prevents memory leaks and DoS / brute-force attacks.
 */
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();
let lastPruneTime = Date.now();
const MAX_RATE_LIMIT_ENTRIES = 5000;

function pruneRateLimitMap(now: number) {
  // Prune expired entries every 3 minutes or if cache grows too large
  if (now - lastPruneTime > 180000 || rateLimitMap.size > MAX_RATE_LIMIT_ENTRIES) {
    lastPruneTime = now;
    for (const [key, value] of rateLimitMap.entries()) {
      if (now - value.lastReset > 300000) {
        rateLimitMap.delete(key);
      }
    }
  }
}

export function checkRateLimit(
  key: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  pruneRateLimitMap(now);

  const entry = rateLimitMap.get(key);

  if (!entry || now - entry.lastReset > windowMs) {
    rateLimitMap.set(key, { count: 1, lastReset: now });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}
