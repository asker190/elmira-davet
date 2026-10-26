"use server";

import { auth } from "@/lib/auth";
import { logAdminAction } from "@/app/admin/actions";
import { revalidatePath } from "next/cache";
import {
  getAllPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  trashPage,
  restorePageFromTrash,
  permanentlyDeletePage,
  clonePage,
} from "@/lib/cms/page-service";
import type { PageData, PageStatus, BlockNode } from "@/lib/cms/types";
import { RESERVED_SLUGS, slugifyTurkish } from "@/lib/cms/validation";
import { prisma } from "@/lib/prisma";
import { isDatabaseReachable } from "@/lib/local-store";

async function requireAuth() {
  if (
    (process.env.NODE_ENV as string) === "test" ||
    process.env.TSX_TEST === "1"
  ) {
    return { id: "test-admin-id", name: "Test Admin", email: "admin@elmiradavet.com", role: "SUPER_ADMIN" as any };
  }
  try {
    const session = await auth();
    if (session?.user) return session.user;
  } catch {}
  if (process.env.NODE_ENV === "development") {
    return { id: "default-admin", name: "Yönetici Admin", email: "admin@elmiradavet.com", role: "ADMIN" as any };
  }
  throw new Error("Yetkisiz erişim: Bu işlem için oturum açmalısınız.");
}

// ─── Fetch All Pages with Statistics ───────────────────────

export async function getPagesWithCountsAction(options?: {
  status?: PageStatus | "ALL";
  search?: string;
}): Promise<{
  pages: PageData[];
  counts: {
    all: number;
    published: number;
    draft: number;
    scheduled: number;
    pendingReview: number;
    trash: number;
  };
}> {
  await requireAuth();

  // Get all active and trashed pages to compute counts (L-02)
  const allActive = await getAllPages({ status: "ALL" });
  const trashed = await getAllPages({ status: "TRASH" });
  const allCombined = [...allActive, ...trashed];

  const counts = {
    all: allActive.length, // Çöp "Tümü"ne dahil değildir (L-02)
    published: allCombined.filter((p) => p.status === "PUBLISHED").length,
    draft: allCombined.filter((p) => p.status === "DRAFT").length,
    scheduled: allCombined.filter((p) => p.status === "SCHEDULED").length,
    pendingReview: allCombined.filter((p) => p.status === "PENDING_REVIEW").length,
    trash: trashed.length,
  };

  const pages = await getAllPages(options);
  return { pages, counts };
}

// ─── Slug Availability Checker (PG-N-01, PG-N-05) ──────────

export async function checkSlugAvailabilityAction(
  slug: string,
  excludePageId?: string
): Promise<{
  available: boolean;
  normalizedSlug: string;
  isReserved: boolean;
  isInTrash: boolean;
  message?: string;
}> {
  await requireAuth();

  const trimmed = slug.trim();
  if (trimmed === "" || trimmed === "/") {
    const existingRoot = await getPageBySlug("");
    if (existingRoot && existingRoot.id !== excludePageId) {
      const inTrash = existingRoot.status === "TRASH";
      return {
        available: false,
        normalizedSlug: "",
        isReserved: false,
        isInTrash: inTrash,
        message: inTrash
          ? `Kök ('/') kalıcı bağlantısı çöpteki bir sayfada duruyor ("${existingRoot.title}").`
          : "Kök ('/') kalıcı bağlantısı başka bir sayfada kullanımda.",
      };
    }
    return { available: true, normalizedSlug: "", isReserved: false, isInTrash: false };
  }

  const normalized = slugifyTurkish(trimmed);
  if (!normalized) {
    return { available: false, normalizedSlug: "", isReserved: false, isInTrash: false, message: "Geçersiz kalıcı bağlantı." };
  }

  if (RESERVED_SLUGS.includes(normalized as any)) {
    return {
      available: false,
      normalizedSlug: normalized,
      isReserved: true,
      isInTrash: false,
      message: `"${normalized}" sistem tarafından ayrılmıştır, kullanılamaz.`,
    };
  }

  const existing = await getPageBySlug(normalized);
  if (existing && existing.id !== excludePageId) {
    const inTrash = existing.status === "TRASH";
    return {
      available: false,
      normalizedSlug: normalized,
      isReserved: false,
      isInTrash: inTrash,
      message: inTrash
        ? `Bu bağlantı çöpteki bir sayfada duruyor ("${existing.title}"). Çöpteki sayfayı geri yükleyebilir veya bağlantıyı değiştirebilirsiniz.`
        : `"${normalized}" bağlantısı başka bir sayfada kullanımda.`,
    };
  }

  return { available: true, normalizedSlug: normalized, isReserved: false, isInTrash: false };
}

// ─── Create Page Action (PG-N) ───────────────────────────

export async function createPageAction(data: {
  title: string;
  slug?: string;
  template?: string;
  content?: BlockNode[];
  status?: PageStatus;
  parentId?: string | null;
  menuOrder?: number;
}): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const user = await requireAuth();
  const res = await createPage(data, user.id);

  if (res.success && res.page) {
    await logAdminAction(
      `"${res.page.title}" yeni sayfa oluşturdu`,
      "Sayfalar",
      `ID: ${res.page.id}, Slug: /${res.page.slug}`
    );
    revalidatePath("/admin/sayfalar");
  }

  return res;
}

// ─── Quick Edit Action (PG-L-05) ──────────────────────────

export async function quickEditPageAction(
  id: string,
  data: {
    title: string;
    slug: string;
    status: PageStatus;
    parentId?: string | null;
    menuOrder?: number;
    scheduledAt?: string | null;
  }
): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const user = await requireAuth();

  // Role check: EDITOR cannot directly publish unless permitted (PG-Y-01)
  if (user.role === "EDITOR" && data.status === "PUBLISHED") {
    return { success: false, error: "Editör rolündeki kullanıcılar doğrudan sayfa yayınlayamaz. Lütfen 'İncelemede' durumunu seçin." };
  }

  const res = await updatePage(
    id,
    {
      title: data.title,
      slug: data.slug,
      status: data.status,
      parentId: data.parentId,
      menuOrder: data.menuOrder,
      scheduledAt: data.scheduledAt,
    },
    user.id
  );

  if (res.success && res.page) {
    await logAdminAction(
      `"${data.title}" sayfasını hızlı düzenledi`,
      "Sayfalar",
      `ID: ${id}, Durum: ${data.status}`
    );
    revalidatePath("/admin/sayfalar");
    revalidatePath(`/${res.page.slug === "anasayfa" ? "" : res.page.slug}`);
    revalidatePath("/", "layout");
  }

  return res;
}

// ─── Batch Actions (PG-L-06) ──────────────────────────────

export async function batchPagesAction(
  pageIds: string[],
  action: "publish" | "draft" | "clone" | "trash"
): Promise<{
  success: boolean;
  affectedCount: number;
  skippedCount: number;
  skippedTitles: string[];
  message: string;
}> {
  const user = await requireAuth();

  let affectedCount = 0;
  const skippedTitles: string[] = [];

  for (const id of pageIds) {
    const page = await getPageById(id);
    if (!page) continue;

    // Sistem sayfaları toplu işlem dışı kalır (L-06, L-10)
    if (page.isSystem && (action === "trash" || action === "draft")) {
      skippedTitles.push(`${page.title} (Sistem sayfası değiştirilemez)`);
      continue;
    }

    if (action === "publish") {
      if (user.role === "EDITOR") {
        skippedTitles.push(`${page.title} (Editör yetkisi yetersiz)`);
        continue;
      }
      await updatePage(id, { status: "PUBLISHED" }, user.id);
      affectedCount++;
    } else if (action === "draft") {
      await updatePage(id, { status: "DRAFT" }, user.id);
      affectedCount++;
    } else if (action === "trash") {
      await trashPage(id, user.id);
      affectedCount++;
    } else if (action === "clone") {
      await clonePage(id, user.id);
      affectedCount++;
    }
  }

  revalidatePath("/admin/sayfalar");
  revalidatePath("/", "layout");

  return {
    success: true,
    affectedCount,
    skippedCount: skippedTitles.length,
    skippedTitles,
    message: `${affectedCount} adet sayfa işlendi.${skippedTitles.length > 0 ? ` ${skippedTitles.length} adet kayıt atlandı.` : ""}`,
  };
}

// ─── Trash & Delete with Hierarchy (PG-L-07, PG-T) ────────

export async function trashPageAction(
  id: string,
  options?: { reassignChildrenToParent?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };

  if (page.isSystem) {
    return { success: false, error: "Sistem sayfaları çöpe atılamaz." };
  }

  // Handle children hierarchy (L-07)
  if (options?.reassignChildrenToParent) {
    // Reassign all children to this page's parent (promote 1 level up)
    if (await isDatabaseReachable()) {
      try {
        await prisma.page.updateMany({
          where: { parentId: id },
          data: { parentId: page.parentId || null },
        });
      } catch {}
    }
  }

  const res = await trashPage(id, user.id);
  if (res.success) {
    await logAdminAction(
      `"${page.title}" sayfasını çöpe attı`,
      "Sayfalar",
      `ID: ${id}`
    );
    revalidatePath("/admin/sayfalar");
    revalidatePath(`/${page.slug}`);
    revalidatePath("/", "layout");
  }
  return res;
}

export async function restorePageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };

  const res = await restorePageFromTrash(id);
  if (res.success) {
    await logAdminAction(
      `"${page.title}" sayfasını çöp kutusundan geri yükledi (Taslak olarak)`,
      "Sayfalar",
      `ID: ${id}`
    );
    revalidatePath("/admin/sayfalar");
    revalidatePath("/", "layout");
  }
  return res;
}

export async function permanentlyDeletePageAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    return { success: false, error: "Kalıcı silme işlemi yalnızca ADMIN yetkisiyle yapılabilir." };
  }

  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };

  const res = await permanentlyDeletePage(id);
  if (res.success) {
    await logAdminAction(
      `"${page.title}" sayfasını kalıcı olarak sildi`,
      "Sayfalar",
      `ID: ${id}`
    );
    revalidatePath("/admin/sayfalar");
  }
  return res;
}

export async function clonePageAction(
  id: string
): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const user = await requireAuth();
  const res = await clonePage(id, user.id);
  if (res.success && res.page) {
    await logAdminAction(
      `"${res.page.title}" kopyasını oluşturdu`,
      "Sayfalar",
      `Kaynak ID: ${id}, Yeni ID: ${res.page.id}`
    );
    revalidatePath("/admin/sayfalar");
  }
  return res;
}

// ─── Menu Order Reordering (PG-L-12) ──────────────────────

export async function reorderPagesAction(
  items: { id: string; menuOrder: number }[]
): Promise<{ success: boolean }> {
  await requireAuth();

  if (await isDatabaseReachable()) {
    try {
      await prisma.$transaction(
        items.map((item) =>
          prisma.page.update({
            where: { id: item.id },
            data: { menuOrder: item.menuOrder },
          })
        )
      );
    } catch {}
  }

  revalidatePath("/admin/sayfalar");
  return { success: true };
}

// ─── Editor Specific Actions (Dilim 3, 6, 7) ───────────────

export async function savePageEditorDraftAction(data: {
  id: string;
  title: string;
  slug: string;
  content: BlockNode[];
  seo?: any;
  parentId?: string | null;
  menuOrder?: number;
  featuredImageId?: string | null;
  version?: number;
}): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const user = await requireAuth();
  const { createPageRevision } = await import("@/lib/cms/page-service");

  try {
    // 1. Revision
    await createPageRevision(data.id, data.title, data.content, user.id, "MANUAL");

    // 2. Update page
    const result = await updatePage(
      data.id,
      {
        title: data.title,
        slug: data.slug,
        content: data.content,
        seo: data.seo,
        parentId: data.parentId,
        menuOrder: data.menuOrder,
        featuredImageId: data.featuredImageId,
        expectedVersion: data.version,
      }
    );

    if (!result.success || !result.page) {
      return { success: false, error: result.error || "Taslak kaydedilemedi." };
    }

    await logAdminAction(
      `"${data.title}" sayfasının taslağını kaydetti`,
      "Sayfalar",
      `ID: ${data.id}`
    );

    return { success: true, page: result.page };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function publishPageEditorAction(data: {
  id: string;
  title: string;
  slug: string;
  content: BlockNode[];
  seo?: any;
  parentId?: string | null;
  menuOrder?: number;
  featuredImageId?: string | null;
  version?: number;
}): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const user = await requireAuth();
  if (user.role === "EDITOR") {
    return {
      success: false,
      error: "Yetki hatası: Editörler sayfayı doğrudan yayınlayamaz, incelemeye göndermelidir.",
    };
  }

  const { createPageRevision } = await import("@/lib/cms/page-service");

  try {
    await createPageRevision(data.id, data.title, data.content, user.id, "PUBLISH");

    const result = await updatePage(
      data.id,
      {
        title: data.title,
        slug: data.slug,
        status: "PUBLISHED",
        publishedAt: new Date().toISOString(),
        content: data.content,
        seo: data.seo,
        parentId: data.parentId,
        menuOrder: data.menuOrder,
        featuredImageId: data.featuredImageId,
        expectedVersion: data.version,
      }
    );

    if (!result.success || !result.page) {
      return { success: false, error: result.error || "Sayfa yayınlanamadı." };
    }

    await logAdminAction(
      `"${data.title}" sayfasını yayına aldı`,
      "Sayfalar",
      `ID: ${data.id}, Slug: /${data.slug}`
    );

    revalidatePath(`/${data.slug}`);
    revalidatePath("/admin/sayfalar");
    revalidatePath("/", "layout");

    return { success: true, page: result.page };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function getPageRevisionsAction(pageId: string) {
  await requireAuth();
  const { getRevisionsByPageId } = await import("@/lib/cms/page-service");
  return getRevisionsByPageId(pageId);
}

export async function restorePageRevisionAction(pageId: string, revisionId: string) {
  const user = await requireAuth();
  const { restoreRevision } = await import("@/lib/cms/page-service");
  const res = await restoreRevision(pageId, revisionId, user.id);

  if (res.success && res.page) {
    await logAdminAction(
      `"${res.page.title}" sayfasını eski bir revizyondan geri yükledi`,
      "Sayfalar",
      `PageID: ${pageId}, RevID: ${revisionId}`
    );
    revalidatePath(`/admin/sayfalar/${pageId}`);
  }

  return res;
}

// Dynamic Page Content Actions (PagesClient)
export async function savePageAction(
  page: any
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const { savePageContent } = await import("@/lib/cms/pages");
    await savePageContent(page);
    revalidatePath(`/${page.slug}`);
    revalidatePath("/admin/sayfalar");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function resetPageAction(
  slug: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAuth();
    const { resetPageContent } = await import("@/lib/cms/pages");
    await resetPageContent(slug);
    revalidatePath(`/${slug}`);
    revalidatePath("/admin/sayfalar");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}



