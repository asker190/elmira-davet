import { prisma } from "@/lib/prisma";
import { mockGalleryCategories, mockGalleryImages } from "@/lib/mock-data";
import { GalleryClient } from "./gallery-client";

export const metadata = {
  title: "Galeri & Medya | Elmira Davet Yönetim Paneli",
};

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  let categories: any[] = [];
  let images: any[] = [];

  try {
    const [dbCategories, dbImages] = await Promise.all([
      prisma.galleryCategory.findMany({
        orderBy: { sortOrder: "asc" },
      }),
      prisma.galleryImage.findMany({
        include: { category: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    categories = dbCategories;
    images = dbImages;
  } catch {}

  // Fallbacks if database is offline or empty
  if (categories.length === 0) {
    categories = mockGalleryCategories;
  }

  // Check custom gallery and custom categories setting
  try {
    const { getSafeSetting } = await import("@/lib/local-store");
    const [raw, rawCats] = await Promise.all([
      getSafeSetting("admin_custom_gallery"),
      getSafeSetting("admin_custom_gallery_categories"),
    ]);

    if (rawCats) {
      try {
        const parsedCats = JSON.parse(rawCats);
        if (Array.isArray(parsedCats) && parsedCats.length > 0) {
          categories = [
            ...categories,
            ...parsedCats.filter(
              (pc: any) => !categories.some((c: any) => c.id === pc.id || c.slug === pc.slug)
            ),
          ];
        }
      } catch {}
    }

    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        images = parsed;
      }
    }
  } catch {}

  if (images.length === 0) {
    images = mockGalleryImages;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">Galeri Yönetimi</h1>
        <p className="text-text-secondary text-sm">
          Salon, düğün, nişan ve dekorasyon fotoğraflarını çoklu olarak sisteme ekleyin, en boy oranlarını belirleyin ve sıralayın.
        </p>
      </div>

      <GalleryClient
        initialCategories={categories}
        initialImages={images}
      />
    </div>
  );
}
