import fs from "fs";
import path from "path";
import { getSafeSetting } from "@/lib/local-store";

const BACKUP_DIR = path.join(process.cwd(), "backups");

/**
 * Creates a complete snapshot of all store settings, Meta leads, CRM records, and logs.
 */
export async function createSystemBackup(): Promise<{
  success: boolean;
  filePath?: string;
  sizeBytes?: number;
  itemCounts?: Record<string, number>;
  error?: string;
}> {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .replace("T", "_")
      .slice(0, 19);

    const fileName = `elmira_backup_${timestamp}.json`;
    const fullPath = path.join(BACKUP_DIR, fileName);

    const keysToBackup = [
      "meta_leads",
      "meta_app_config",
      "meta_sync_logs",
      "admin_crm_leads",
      "reservations",
      "site_settings",
      "halls_data",
      "packages_data",
    ];

    const backupData: Record<string, any> = {
      backupCreatedAt: new Date().toISOString(),
      version: "1.0",
      data: {},
    };

    const itemCounts: Record<string, number> = {};

    for (const key of keysToBackup) {
      const val = await getSafeSetting(key);
      if (val) {
        try {
          const parsed = JSON.parse(val);
          backupData.data[key] = parsed;
          itemCounts[key] = Array.isArray(parsed) ? parsed.length : 1;
        } catch {
          backupData.data[key] = val;
          itemCounts[key] = 1;
        }
      }
    }

    const content = JSON.stringify(backupData, null, 2);
    fs.writeFileSync(fullPath, content, "utf-8");

    const stat = fs.statSync(fullPath);

    return {
      success: true,
      filePath: fullPath,
      sizeBytes: stat.size,
      itemCounts,
    };
  } catch (err: any) {
    console.error("Backup creation error:", err);
    return { success: false, error: err.message };
  }
}
