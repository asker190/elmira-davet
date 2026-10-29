import { prisma } from "@/lib/prisma";
import { mockSettings } from "@/lib/mock-data";
import {
  isDatabaseReachable,
  getSafeSetting,
  setSafeSetting,
  getAllSafeSettings,
} from "@/lib/local-store";

export type SiteSettings = Record<string, string>;

/**
 * Fetch all site settings as a key-value object.
 * Merges local store over mock settings, and syncs from DB if online.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const localSettings = getAllSafeSettings();
  let base: SiteSettings = { ...mockSettings, ...localSettings };

  const isOnline = await isDatabaseReachable();
  if (isOnline) {
    try {
      const settings = await prisma.siteSetting.findMany();
      if (settings && settings.length > 0) {
        const dbMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));
        base = { ...base, ...dbMap };
      }
    } catch {}
  }

  return base;
}

/**
 * Get a single site setting value by key.
 */
export async function getSetting(key: string): Promise<string | undefined> {
  const safeVal = await getSafeSetting(key);
  if (safeVal !== null && safeVal !== undefined) {
    return safeVal;
  }
  const settings = await getSiteSettings();
  return settings[key];
}

/**
 * Update a site setting. Safely persists to local store and database.
 */
export async function updateSetting(
  key: string,
  value: string
): Promise<void> {
  await setSafeSetting(key, value);
}
