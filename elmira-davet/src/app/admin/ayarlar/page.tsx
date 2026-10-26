import { prisma } from "@/lib/prisma";
import { mockSettings } from "@/lib/mock-data";
import { SettingsClient } from "./settings-client";

export const metadata = {
  title: "Site Ayarları | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings: Record<string, string> = { ...mockSettings };

  try {
    const settingsRows = await prisma.siteSetting.findMany();
    if (settingsRows.length > 0) {
      settingsRows.forEach((s) => {
        settings[s.key] = s.value;
      });
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">Site Ayarları</h1>
        <p className="text-text-secondary text-sm">
          Logo, marka renkleri, iletişim bilgileri, sosyal medya hesapları, arama motoru (SEO) etiketleri ve KVKK aydınlatma metnini buradan yönetin.
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
