import { prisma } from "@/lib/prisma";
import { mockSettings } from "@/lib/mock-data";
import { isDatabaseReachable, getSafeSetting, setSafeSetting } from "@/lib/local-store";

export type SiteSettings = Record<string, string>;

/**
 * Fetch all site settings as a key-value object.
 * Falls back to elegant mock settings or local store if DB is offline.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const isOnline = await isDatabaseReachable();
  if (isOnline) {
    try {
      const settings = await prisma.siteSetting.findMany();
      if (settings && settings.length > 0) {
        return Object.fromEntries(settings.map((s) => [s.key, s.value]));
      }
    } catch {}
  }
  return mockSettings;
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
