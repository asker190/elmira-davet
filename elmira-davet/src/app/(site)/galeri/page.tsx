import { prisma } from "@/lib/prisma";
import { getPageBySlug, extractStaticFields } from "@/lib/cms/page-service";
import { MasonryGallery } from "@/components/site/masonry-gallery";
import { mockGalleryCategories, mockGalleryImages } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("galeri");
  const fields = page ? extractStaticFields(page) : null;
  return {
    title: fields?.seoTitle || "Fotoğraf Galerisi | Elmira Davet Gaziosmanpaşa",
    description:
      fields?.seoDescription ||
      "Kristal Salon ve Kır Bahçesi fotoğrafları, düğün masası süslemeleri ve gelin yolu detayları.",
  };
}

export default async function GalleryPage() {
  const [dbCategories, dbImages, cmsPage] = await Promise.all([
    prisma.galleryCategory
      .findMany({
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    prisma.galleryImage
      .findMany({
        include: { category: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    getPageBySlug("galeri"),
  ]);
  const page = cmsPage ? extractStaticFields(cmsPage) : { title: "Fotoğraf & Video Galerisi", subtitle: "Kristal Salon ve Kır Bahçesi görüntüleri", badgeText: "Görsel Deneyim", heroImageUrl: "", bodyHtml: "", seoTitle: "", seoDescription: "" };

  const categories = dbCategories.length > 0 ? dbCategories : mockGalleryCategories;
  const images = dbImages.length > 0 ? dbImages : mockGalleryImages;

  return (
    <div className="pt-28 pb-20 space-y-12">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <span className="text-xs uppercase tracking-[0.3em] text-gold font-medium">
          {page.badgeText || "Görsel Deneyim"}
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {cmsPage?.title || page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {page.subtitle}
        </p>
      </section>

      {/* Masonry Shared Layout Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MasonryGallery categories={categories} images={images} />
      </section>
    </div>
  );
}
