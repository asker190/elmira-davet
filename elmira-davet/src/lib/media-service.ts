import { prisma } from "@/lib/prisma";
import { getSafeSetting, setSafeSetting } from "@/lib/local-store";
import { mockGalleryImages } from "@/lib/mock-data";
import { revalidatePath } from "next/cache";

export interface MediaItem {
  id: string;
  imageUrl: string;
  title: string;
  alt: string;
  categoryId: string;
  aspectRatio?: string;
  createdAt?: string;
}

/**
 * Registers any uploaded image into the central Media & Gallery library.
 * This guarantees that photos uploaded anywhere on the site automatically
 * appear in the Admin Gallery / Media module and database.
 */
export async function addMediaToGallery(params: {
  imageUrl: string;
  title?: string;
  alt?: string;
  categoryId?: string;
  aspectRatio?: string;
}): Promise<MediaItem> {
  const mediaId = "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6);
  const title = params.title || "Elmira Davet Görseli";
  const alt = params.alt || title;
  const categoryId = params.categoryId || "cat-1";
  const aspectRatio = params.aspectRatio || "16/9";

  const mediaItem: MediaItem = {
    id: mediaId,
    imageUrl: params.imageUrl,
    title,
    alt,
    categoryId,
    aspectRatio,
    createdAt: new Date().toISOString(),
  };

  // 1. Sync to local safe store
  try {
    const raw = await getSafeSetting("admin_custom_gallery");
    let list: MediaItem[] = [];
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {}
    }
    if (list.length === 0) {
      list = [...mockGalleryImages];
    }

    // Insert at front
    list.unshift(mediaItem);
    await setSafeSetting("admin_custom_gallery", JSON.stringify(list));
  } catch (err) {
    console.error("Local safe store media error:", err);
  }

  // 2. Sync to Prisma / MySQL if database is reachable
  try {
    await prisma.galleryImage.create({
      data: {
        id: mediaId,
        imageUrl: params.imageUrl,
        title,
        alt,
        categoryId,
      },
    });
  } catch (err) {
    // Database might be in local mode or offline, local store already persisted
  }

  try {
    revalidatePath("/galeri");
    revalidatePath("/admin/galeri");
  } catch {}

  return mediaItem;
}

/**
 * Retrieves all media items from the central gallery store.
 */
export async function getAllMediaItems(): Promise<MediaItem[]> {
  try {
    const raw = await getSafeSetting("admin_custom_gallery");
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list;
      }
    }
  } catch {}

  try {
    const dbImages = await prisma.galleryImage.findMany({
      orderBy: { createdAt: "desc" },
    });
    if (dbImages.length > 0) {
      return dbImages.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        title: img.title || "Elmira Davet Görseli",
        alt: img.alt,
        categoryId: img.categoryId,
        createdAt: img.createdAt.toISOString(),
      }));
    }
  } catch {}

  return mockGalleryImages;
}
