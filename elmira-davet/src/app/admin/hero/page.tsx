import { prisma } from "@/lib/prisma";
import { getSafeSetting } from "@/lib/local-store";
import { HeroClient } from "./hero-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hero Slider Yönetimi | Elmira Davet Yönetim Paneli",
};

export default async function AdminHeroPage() {
  let slides: any[] = [];
  try {
    slides = await prisma.heroSlide.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {}

  let heroVideoSettings = {
    location: "İstanbul - Gaziosmanpaşa",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41378-large.mp4",
  };
  try {
    const raw = await getSafeSetting("admin_hero_video_settings");
    if (raw) heroVideoSettings = { ...heroVideoSettings, ...JSON.parse(raw) };
  } catch {}

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-heading text-text-primary">
          Hero Slider & Video Yönetimi
        </h2>
        <p className="text-sm text-text-muted mt-1">
          Ana sayfanın en üstünde gösterilen tam ekran görsel slaytları, arka plan video bağlantısını ve konum rozetini buradan yönetin.
        </p>
      </div>

      <HeroClient initialSlides={slides} initialVideoSettings={heroVideoSettings} />
    </div>
  );
}
