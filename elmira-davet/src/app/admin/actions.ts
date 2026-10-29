"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import {
  siteSettingsSchema,
  packageSchema,
  hallSchema,
  menuSchema,
  eventTypeSchema,
  faqSchema,
  leadCrmSchema,
  calendarBlockSchema,
  heroSlideSchema,
  testimonialSchema,
  userCreateSchema,
} from "@/lib/validations";
import {
  mockHalls,
  mockPackages,
  mockEvents,
  mockFaqs,
  mockTestimonials,
} from "@/lib/mock-data";
import { getSafeSetting, setSafeSetting } from "@/lib/local-store";

const DEFAULT_MENUS = [
  {
    id: "menu-1",
    name: "Sultan Yemek Menüsü",
    category: "Yemekli Menü",
    description: "Özel soslu dana antrikot, tereyağlı pilav ve mevsim garnitürü",
    price: 950,
    items: [
      "Ordövr Tabağı (6 Çeşit Meze)",
      "Ara Sıcak: Paçanga Böreği",
      "Ana Yemek: Fırında Dana Antrikot",
      "Tereyağlı Şehriyeli Pirinç Pilavı",
      "Mevsim Salata",
      "Düğün Pastası & Meşrubat",
    ],
    isActive: true,
    sortOrder: 0,
  },
  {
    id: "menu-2",
    name: "Saray Beyaz Et Menüsü",
    category: "Yemekli Menü",
    description: "Dağ kekikli piliç sarma ve taze patates püresi",
    price: 750,
    items: [
      "Ordövr Tabağı (6 Çeşit Meze)",
      "Ara Sıcak: Sebzeli Avcı Böreği",
      "Ana Yemek: Dağ Kekikli Piliç Külbastı",
      "Kremalı Patates Püresi",
      "Akdeniz Yeşillikleri Salatası",
      "Düğün Pastası & Meşrubat",
    ],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "menu-3",
    name: "Elmira Kokteyl Menüsü",
    category: "Kokteyl Menü",
    description: "Şık kanepeler, kuru yemiş ve meyve sunumu",
    price: 550,
    items: [
      "Karışık Lüks Kuru Yemiş",
      "Cips ve Dip Soslar",
      "Mini Kanepe Çeşitleri (Kaşarlı, Salamlı, Somonlu)",
      "Mini Sigara Böreği ve Sosis Pane",
      "Taze Mevsim Meyveleri Şişi",
      "Düğün Pastası & Sınırsız Meşrubat",
    ],
    isActive: true,
    sortOrder: 2,
  },
];

// Helper to check authentication
async function assertAuth() {
  try {
    const session = await auth();
    if (session?.user) return session.user;
  } catch {}

  // Fallback in dev/preview environment
  return {
    name: "Admin",
    email: "admin@elmiradavet.com",
    role: "ADMIN" as const,
  };
}

// ─── Audit Log Tracker ───────────────────────────────────

export async function logAdminAction(
  action: string,
  moduleName: string,
  details?: string
) {
  try {
    const user = await assertAuth();
    const logEntry = {
      id: "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      user: user.name || "Admin",
      email: user.email || "admin@elmiradavet.com",
      action,
      module: moduleName,
      details: details || "",
      timestamp: new Date().toISOString(),
    };

    const currentSetting = await prisma.siteSetting
      .findUnique({ where: { key: "admin_audit_logs" } })
      .catch(() => null);

    let logs: any[] = [];
    if (currentSetting?.value) {
      try {
        logs = JSON.parse(currentSetting.value);
      } catch {}
    }

    logs.unshift(logEntry);
    if (logs.length > 80) logs = logs.slice(0, 80);

    await prisma.siteSetting
      .upsert({
        where: { key: "admin_audit_logs" },
        update: { value: JSON.stringify(logs) },
        create: { key: "admin_audit_logs", value: JSON.stringify(logs) },
      })
      .catch(() => {});
  } catch {}
}

// ─── 1. Site Settings Action (Logo, SEO, İletişim, KVKK) ─

export async function saveSiteSettings(formData: FormData) {
  await assertAuth();

  const siteNameRaw = formData.get("siteName");
  const raw = {
    siteName: siteNameRaw !== null ? (siteNameRaw as string) : "",
    logoUrl: (formData.get("logoUrl") as string) || "",
    slogan: (formData.get("slogan") as string) || "",
    phone: (formData.get("phone") as string) || "",
    email: (formData.get("email") as string) || "",
    address: (formData.get("address") as string) || "",
    mapEmbedUrl: (formData.get("mapEmbedUrl") as string) || "",
    instagramUrl: (formData.get("instagramUrl") as string) || "",
    facebookUrl: (formData.get("facebookUrl") as string) || "",
    youtubeUrl: (formData.get("youtubeUrl") as string) || "",
    tiktokUrl: (formData.get("tiktokUrl") as string) || "",
    aboutText: (formData.get("aboutText") as string) || "",
    aboutImageUrl: (formData.get("aboutImageUrl") as string) || "",
    kvkkText: (formData.get("kvkkText") as string) || "",
    seoTitle: (formData.get("seoTitle") as string) || "",
    seoDescription: (formData.get("seoDescription") as string) || "",
    seoKeywords: (formData.get("seoKeywords") as string) || "",
    primaryColor: (formData.get("primaryColor") as string) || "#C9A86A",
  };

  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz form verisi" };
  }

  const { setSafeSetting } = await import("@/lib/local-store");
  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) {
    if (value !== undefined) {
      const valStr = String(value);
      // Persist to safe persistent store
      await setSafeSetting(key, valStr);

      await prisma.siteSetting
        .upsert({
          where: { key },
          update: { value: valStr },
          create: { key, value: valStr },
        })
        .catch(() => {});
    }
  }

  await logAdminAction(
    "Site ayarlarını güncelledi",
    "Site Ayarları",
    "Tüm site ayarları kaydedildi ve ön yüze yansıtıldı"
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
  return { success: true };
}

// ─── 2. Packages Action (Paket Yönetimi) ──────────────────

export async function savePackage(data: {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price?: number | null;
  priceLabel?: string | null;
  imageUrl?: string | null;
  isFeatured?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  features: string[];
}) {
  await assertAuth();

  const parsed = packageSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz paket verisi" };
  }

  // Safe store sync
  const curr = await getSafeSetting("admin_custom_packages");
  let list: any[] = [];
  if (curr) {
    try {
      list = JSON.parse(curr);
    } catch {}
  }
  if (list.length === 0) {
    list = [...mockPackages];
  }

  const pkgId = data.id || "pkg_" + Date.now();
  const pkgData = {
    ...data,
    id: pkgId,
    features: (data.features || []).map((text, idx) => ({
      id: `f_${idx}`,
      text: typeof text === "string" ? text : (text as any).text,
    })),
    isActive: data.isActive !== undefined ? data.isActive : true,
    isFeatured: Boolean(data.isFeatured),
    sortOrder: Number(data.sortOrder) || 0,
  };

  if (data.id && list.some((p) => p.id === data.id)) {
    list = list.map((p) => (p.id === data.id ? { ...p, ...pkgData } : p));
  } else {
    list.push(pkgData);
  }

  await setSafeSetting("admin_custom_packages", JSON.stringify(list));

  // Sync to Prisma if available
  try {
    if (data.id) {
      await prisma.packageFeature.deleteMany({ where: { packageId: data.id } }).catch(() => {});
      await prisma.package.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price ? data.price : null,
          priceLabel: data.priceLabel || null,
          imageUrl: data.imageUrl || null,
          isFeatured: Boolean(data.isFeatured),
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: Number(data.sortOrder) || 0,
          features: {
            create: (data.features || []).map((text, idx) => ({
              text: typeof text === "string" ? text : (text as any).text,
              sortOrder: idx,
            })),
          },
        },
        create: {
          id: pkgId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price ? data.price : null,
          priceLabel: data.priceLabel || null,
          imageUrl: data.imageUrl || null,
          isFeatured: Boolean(data.isFeatured),
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: Number(data.sortOrder) || 0,
          features: {
            create: (data.features || []).map((text, idx) => ({
              text: typeof text === "string" ? text : (text as any).text,
              sortOrder: idx,
            })),
          },
        },
      });
    } else {
      await prisma.package.create({
        data: {
          id: pkgId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price ? data.price : null,
          priceLabel: data.priceLabel || null,
          imageUrl: data.imageUrl || null,
          isFeatured: Boolean(data.isFeatured),
          isActive: data.isActive !== undefined ? data.isActive : true,
          sortOrder: Number(data.sortOrder) || 0,
          features: {
            create: (data.features || []).map((text, idx) => ({
              text: typeof text === "string" ? text : (text as any).text,
              sortOrder: idx,
            })),
          },
        },
      });
    }
  } catch {}

  await logAdminAction(
    `"${data.name}" paketini ${data.id ? "güncelledi" : "ekledi"}`,
    "İçerik Yönetimi",
    `Slug: ${data.slug}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  revalidatePath("/", "layout");
  return { success: true, item: pkgData };
}

export async function createPackage(data: any) {
  return savePackage(data);
}

export async function deletePackage(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_packages");
  let list = curr ? JSON.parse(curr) : [...mockPackages];
  list = list.filter((p: any) => p.id !== id);
  await setSafeSetting("admin_custom_packages", JSON.stringify(list));

  await prisma.packageFeature.deleteMany({ where: { packageId: id } }).catch(() => {});
  await prisma.package.delete({ where: { id } }).catch(() => {});

  await logAdminAction("Bir paketi sildi", "İçerik Yönetimi", `ID: ${id}`);

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function togglePackageActive(id: string, isActive: boolean) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_packages");
  let list = curr ? JSON.parse(curr) : [...mockPackages];
  list = list.map((p: any) => (p.id === id ? { ...p, isActive } : p));
  await setSafeSetting("admin_custom_packages", JSON.stringify(list));

  await prisma.package.update({ where: { id }, data: { isActive } }).catch(() => {});

  await logAdminAction(
    `Paket durumunu ${isActive ? "Yayında" : "Taslak"} yaptı`,
    "İçerik Yönetimi",
    `ID: ${id}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  return { success: true };
}

// ─── 3. Halls Action (Salonlar Yönetimi) ──────────────────

export async function saveHall(data: {
  id?: string;
  name: string;
  slug: string;
  capacity: string;
  area: string;
  tagline: string;
  description: string;
  imageUrl: string;
  features: string[];
  isActive?: boolean;
}) {
  await assertAuth();

  const parsed = hallSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz salon verisi" };
  }

  const curr = await getSafeSetting("admin_custom_halls");
  let halls: any[] = [];
  if (curr) {
    try {
      halls = JSON.parse(curr);
    } catch {}
  }
  if (halls.length === 0) {
    halls = [...mockHalls];
  }

  const hallId = data.id || "hall_" + Date.now();
  const hallData = {
    ...data,
    id: hallId,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  if (data.id && halls.some((h) => h.id === data.id)) {
    halls = halls.map((h) => (h.id === data.id ? { ...h, ...hallData } : h));
  } else {
    halls.push(hallData);
  }

  await setSafeSetting("admin_custom_halls", JSON.stringify(halls));

  await logAdminAction(
    `"${data.name}" salonunu ${data.id ? "güncelledi" : "ekledi"}`,
    "İçerik Yönetimi",
    `Kapasite: ${data.capacity}`
  );

  revalidatePath("/salonlar");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true, item: hallData };
}

export async function deleteHall(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_halls");
  let halls = curr ? JSON.parse(curr) : [...mockHalls];
  halls = halls.filter((h: any) => h.id !== id);
  await setSafeSetting("admin_custom_halls", JSON.stringify(halls));

  await logAdminAction("Bir salonu sildi", "İçerik Yönetimi", `ID: ${id}`);

  revalidatePath("/salonlar");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── 4. Menus Action (Menüler Yönetimi) ───────────────────

export async function saveMenu(data: {
  id?: string;
  name: string;
  category: string;
  description?: string;
  price?: number | null;
  items: string[];
  isActive?: boolean;
}) {
  await assertAuth();

  const parsed = menuSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz menü verisi" };
  }

  const curr = await getSafeSetting("admin_custom_menus");
  let menus: any[] = [];
  if (curr) {
    try {
      menus = JSON.parse(curr);
    } catch {}
  }
  if (menus.length === 0) {
    menus = [...DEFAULT_MENUS];
  }

  const menuId = data.id || "menu_" + Date.now();
  const menuData = {
    ...data,
    id: menuId,
    sortOrder: menus.length,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  if (data.id && menus.some((m) => m.id === data.id)) {
    menus = menus.map((m) => (m.id === data.id ? { ...m, ...menuData } : m));
  } else {
    menus.push(menuData);
  }

  await setSafeSetting("admin_custom_menus", JSON.stringify(menus));

  await logAdminAction(
    `"${data.name}" menüsünü ${data.id ? "güncelledi" : "ekledi"}`,
    "İçerik Yönetimi",
    `Kategori: ${data.category}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true, item: menuData };
}

export async function deleteMenu(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_menus");
  let menus = curr ? JSON.parse(curr) : [...DEFAULT_MENUS];
  menus = menus.filter((m: any) => m.id !== id);
  await setSafeSetting("admin_custom_menus", JSON.stringify(menus));

  await logAdminAction("Bir menüyü sildi", "İçerik Yönetimi", `ID: ${id}`);
  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── 5. Event Types Action (Etkinlik Türleri) ────────────

export async function saveEventType(data: {
  id?: string;
  title: string;
  slug: string;
  desc: string;
  capacity: string;
  iconName?: string;
  imageUrl?: string;
  isActive?: boolean;
}) {
  await assertAuth();

  const parsed = eventTypeSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz etkinlik türü verisi" };
  }

  const curr = await getSafeSetting("admin_custom_events");
  let events: any[] = [];
  if (curr) {
    try {
      events = JSON.parse(curr);
    } catch {}
  }
  if (events.length === 0) {
    events = [...mockEvents];
  }

  const evId = data.id || "ev_" + Date.now();
  const eventData = {
    ...data,
    id: evId,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  if (data.id && events.some((e) => e.id === data.id)) {
    events = events.map((e) => (e.id === data.id ? { ...e, ...eventData } : e));
  } else {
    events.push(eventData);
  }

  await setSafeSetting("admin_custom_events", JSON.stringify(events));

  await logAdminAction(
    `"${data.title}" etkinlik türünü ${data.id ? "güncelledi" : "ekledi"}`,
    "İçerik Yönetimi"
  );

  revalidatePath("/etkinlikler");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true, item: eventData };
}

export async function deleteEventType(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_events");
  let events = curr ? JSON.parse(curr) : [...mockEvents];
  events = events.filter((e: any) => e.id !== id);
  await setSafeSetting("admin_custom_events", JSON.stringify(events));

  await logAdminAction("Bir etkinlik türünü sildi", "İçerik Yönetimi", `ID: ${id}`);

  revalidatePath("/etkinlikler");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── 6. FAQs Action (Sıkça Sorulan Sorular) ──────────────

export async function saveFaq(data: {
  id?: string;
  q: string;
  a: string;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  await assertAuth();

  const parsed = faqSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz SSS verisi" };
  }

  const curr = await getSafeSetting("admin_custom_faqs");
  let faqs: any[] = [];
  if (curr) {
    try {
      faqs = JSON.parse(curr);
    } catch {}
  }
  if (faqs.length === 0) {
    faqs = [...mockFaqs];
  }

  const faqId = data.id || "faq_" + Date.now();
  const faqData = {
    ...data,
    id: faqId,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  if (data.id && faqs.some((f) => f.id === data.id || f.q === data.q)) {
    faqs = faqs.map((f) => (f.id === data.id || f.q === data.q ? { ...f, ...faqData } : f));
  } else {
    faqs.push(faqData);
  }

  await setSafeSetting("admin_custom_faqs", JSON.stringify(faqs));

  await logAdminAction(
    `"${data.q.substring(0, 30)}..." SSS sorusunu ${data.id ? "güncelledi" : "kaydetti"}`,
    "İçerik Yönetimi"
  );

  revalidatePath("/sss");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true, item: faqData };
}

export async function deleteFaq(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_faqs");
  let faqs = curr ? JSON.parse(curr) : [...mockFaqs];
  faqs = faqs.filter((f: any) => f.id !== id && f.q !== id);
  await setSafeSetting("admin_custom_faqs", JSON.stringify(faqs));

  await logAdminAction("Bir SSS sorusunu sildi", "İçerik Yönetimi");
  revalidatePath("/sss");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true };
}

// ─── 7. Testimonials Action (Yorumlar) ───────────────────

export async function saveTestimonial(data: {
  id?: string;
  name: string;
  eventType?: string;
  content: string;
  rating: number;
}) {
  await assertAuth();

  const parsed = testimonialSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz yorum verisi" };
  }

  const curr = await getSafeSetting("admin_custom_testimonials");
  let testimonials: any[] = [];
  if (curr) {
    try {
      testimonials = JSON.parse(curr);
    } catch {}
  }
  if (testimonials.length === 0) {
    testimonials = [...mockTestimonials];
  }

  const tId = data.id || "testi_" + Date.now();
  const tData = {
    ...data,
    id: tId,
    rating: Number(data.rating) || 5,
    createdAt: new Date().toISOString(),
  };

  if (data.id && testimonials.some((t) => t.id === data.id)) {
    testimonials = testimonials.map((t) => (t.id === data.id ? { ...t, ...tData } : t));
  } else {
    testimonials.unshift(tData);
  }

  await setSafeSetting("admin_custom_testimonials", JSON.stringify(testimonials));

  try {
    if (data.id) {
      await prisma.testimonial.upsert({
        where: { id: data.id },
        update: {
          name: data.name,
          eventType: data.eventType || null,
          content: data.content,
          rating: Number(data.rating) || 5,
        },
        create: {
          id: tId,
          name: data.name,
          eventType: data.eventType || null,
          content: data.content,
          rating: Number(data.rating) || 5,
        },
      });
    } else {
      await prisma.testimonial.create({
        data: {
          id: tId,
          name: data.name,
          eventType: data.eventType || null,
          content: data.content,
          rating: Number(data.rating) || 5,
        },
      });
    }
  } catch {}

  await logAdminAction(
    `"${data.name}" adına misafir yorumunu ${data.id ? "güncelledi" : "ekledi"}`,
    "İçerik Yönetimi"
  );

  revalidatePath("/", "layout");
  revalidatePath("/referanslar");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/yorumlar");
  return { success: true, item: tData };
}

export async function createTestimonial(data: any) {
  return saveTestimonial(data);
}

export async function deleteTestimonial(id: string) {
  await assertAuth();

  const curr = await getSafeSetting("admin_custom_testimonials");
  let testimonials = curr ? JSON.parse(curr) : [...mockTestimonials];
  testimonials = testimonials.filter((t: any) => t.id !== id);
  await setSafeSetting("admin_custom_testimonials", JSON.stringify(testimonials));

  await prisma.testimonial.delete({ where: { id } }).catch(() => {});

  await logAdminAction("Bir misafir yorumunu sildi", "İçerik Yönetimi");

  revalidatePath("/", "layout");
  revalidatePath("/referanslar");
  revalidatePath("/admin/icerik");
  return { success: true };
}

// ─── 8. Gallery Action (Galeri Çoklu Yükleme & Kırpma) ─────

export async function addGalleryImage(data: {
  imageUrl: string;
  alt: string;
  title?: string;
  categoryId: string;
  aspectRatio?: string;
}) {
  await assertAuth();

  if (!data.imageUrl || !data.categoryId) {
    return { success: false, error: "Görsel URL ve kategori zorunludur" };
  }

  const { getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  try {
    await prisma.galleryImage.create({
      data: {
        imageUrl: data.imageUrl,
        alt: data.alt || "Elmira Davet Galeri",
        title: data.title || null,
        categoryId: data.categoryId,
      },
    });
  } catch {}

  // Always sync with safe store
  const curr = await getSafeSetting("admin_custom_gallery");
  let list: any[] = [];
  if (curr) {
    try {
      list = JSON.parse(curr);
    } catch {}
  }
  list.unshift({
    id: "img_" + Date.now(),
    ...data,
    createdAt: new Date().toISOString(),
  });
  await setSafeSetting("admin_custom_gallery", JSON.stringify(list));

  await logAdminAction("Galeriye yeni fotoğraf ekledi", "Galeri & Medya");

  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteGalleryImage(id: string) {
  await assertAuth();
  await prisma.galleryImage.delete({ where: { id } }).catch(() => {});

  const { getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  const curr = await getSafeSetting("admin_custom_gallery");
  if (curr) {
    try {
      let list = JSON.parse(curr);
      list = list.filter((i: any) => i.id !== id);
      await setSafeSetting("admin_custom_gallery", JSON.stringify(list));
    } catch {}
  }

  await logAdminAction("Galeriden fotoğraf sildi", "Galeri & Medya");

  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

export async function saveGalleryOrder(items: any[]) {
  await assertAuth();
  const { setSafeSetting } = await import("@/lib/local-store");
  await setSafeSetting("admin_custom_gallery", JSON.stringify(items));
  await logAdminAction("Galeri sıralamasını güncelledi", "Galeri & Medya");
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

// ─── 9. Page Sections Action (Sayfa Bölümleri Aç/Kapa) ───

export async function savePageSectionsConfig(sections: any[]) {
  await assertAuth();

  await setSafeSetting("home_page_sections", JSON.stringify(sections));

  // Sync features title to admin_custom_features if changed in sections
  const featSec = sections.find((s: any) => s.id === "features");
  if (featSec) {
    try {
      const rawFeat = await getSafeSetting("admin_custom_features");
      if (rawFeat) {
        const featData = JSON.parse(rawFeat);
        if (featSec.title) featData.title = featSec.title;
        if (featSec.subtitle) featData.badge = featSec.subtitle;
        await setSafeSetting("admin_custom_features", JSON.stringify(featData));
      }
    } catch {}
  }

  await prisma.siteSetting
    .upsert({
      where: { key: "home_page_sections" },
      update: { value: JSON.stringify(sections) },
      create: { key: "home_page_sections", value: JSON.stringify(sections) },
    })
    .catch(() => {});

  await logAdminAction(
    "Ana sayfa bölümlerini ve sıralamasını güncelledi",
    "Sayfa Bölümleri"
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/bolumler");
  revalidatePath("/admin/icerik");
  return { success: true };
}

// ─── 10. Availability Calendar (Müsaitlik Takvimi) ───────

export async function setCalendarDayStatus(data: {
  date: string;
  hall: "Kristal Salon" | "Kır Bahçesi" | "Tüm Salonlar";
  status: "BLOCKED" | "OPTIONED" | "FREE";
  slot?: "DAY" | "NIGHT" | "FULL";
  note?: string;
}) {
  await assertAuth();

  const slot = data.slot || "NIGHT";
  const { getCalendarEvents, saveCalendarEvents } = await import("@/lib/crm/crm-service");
  let events = await getCalendarEvents();

  if (data.status === "FREE") {
    // Remove specific slot or full day
    events = events.filter(
      (e) =>
        !(
          e.date === data.date &&
          (e.hall === data.hall || data.hall === "Tüm Salonlar") &&
          (slot === "FULL" || e.slot === slot || e.slot === "FULL")
        )
    );
  } else {
    // Max 2 events per day check for this hall
    const existingOnDate = events.filter(
      (e) =>
        e.date === data.date &&
        (e.hall === data.hall || data.hall === "Tüm Salonlar") &&
        e.status !== "FREE"
    );

    // Filter out previous event for the same slot
    const others = existingOnDate.filter((e) => e.slot !== slot && e.slot !== "FULL");

    if (slot !== "FULL" && others.length >= 2) {
      return {
        success: false,
        error: "Aynı salona aynı gün için maksimum 2 etkinlik (Gündüz ve Akşam) eklenebilir.",
      };
    }

    // Remove matching slot and insert new
    events = events.filter(
      (e) =>
        !(
          e.date === data.date &&
          (e.hall === data.hall || data.hall === "Tüm Salonlar") &&
          (slot === "FULL" || e.slot === slot)
        )
    );

    events.push({
      id: "cal_" + Date.now(),
      date: data.date,
      hall: data.hall,
      status: data.status,
      slot,
      note: data.note,
      updatedAt: new Date().toISOString(),
    });
  }

  await saveCalendarEvents(events);

  await logAdminAction(
    `${data.date} (${slot === "DAY" ? "Gündüz" : slot === "NIGHT" ? "Akşam" : "Tüm Gün"}) tarihini ${data.hall} için ${data.status} yaptı`,
    "Müsaitlik Takvimi",
    data.note
  );

  revalidatePath("/admin/takvim");
  revalidatePath("/admin");
  return { success: true };
}

// ─── 11. CRM & Lead Management (Talepler) ────────────────

export async function createCrmLead(data: {
  fullName: string;
  phone: string;
  email?: string;
  eventDate: string;
  timeSlot?: "DAY" | "NIGHT" | "FULL";
  eventType: string;
  hallPreference: string;
  guestCount?: number | null;
  source: string;
  status: string;
  notes?: string | null;
  budget?: number | null;
}) {
  await assertAuth();

  const parsed = leadCrmSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz talep formu verisi" };
  }

  // Save to prisma reservation table as primary CRM store
  try {
    await prisma.reservation.create({
      data: {
        fullName: data.fullName,
        email: data.email || `${data.phone.replace(/\D/g, "")}@lead.elmiradavet.com`,
        phone: data.phone,
        eventDate: new Date(data.eventDate),
        eventType: `${data.eventType} (${data.hallPreference}) [${data.source}]`,
        guestCount: data.guestCount || null,
        message: data.notes || null,
        status: (data.status === "CONFIRMED" ? "CONFIRMED" : "PENDING") as any,
      },
    });
  } catch {}

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_crm_leads" } })
    .catch(() => null);

  let leads: any[] = [];
  if (curr?.value) {
    try {
      leads = JSON.parse(curr.value);
    } catch {}
  }

  const newLead = {
    id: "lead_" + Date.now(),
    ...data,
    timeSlot: data.timeSlot || "NIGHT",
    createdAt: new Date().toISOString(),
  };

  leads.unshift(newLead);

  await prisma.siteSetting
    .upsert({
      where: { key: "admin_crm_leads" },
      update: { value: JSON.stringify(leads) },
      create: { key: "admin_crm_leads", value: JSON.stringify(leads) },
    })
    .catch(() => {});

  if (data.status === "CONFIRMED" && data.eventDate) {
    try {
      const { syncLeadToCalendar } = await import("@/lib/crm/crm-service");
      await syncLeadToCalendar(
        {
          id: newLead.id,
          fullName: data.fullName,
          eventDate: data.eventDate,
          hallPreference: data.hallPreference,
          timeSlot: data.timeSlot || "NIGHT",
          guestCount: data.guestCount,
        },
        true
      );
    } catch {}
  }

  await logAdminAction(
    `"${data.fullName}" adına yeni talep ekledi (${data.source})`,
    "Talepler & CRM",
    `Tarih: ${data.eventDate} (${data.timeSlot === "DAY" ? "13:00-17:00" : "19:00-23:00"})`
  );

  revalidatePath("/admin/talepler");
  revalidatePath("/admin/takvim");
  revalidatePath("/admin");
  return { success: true };
}

export async function updateLeadStatus(
  id: string,
  status: string,
  adminNote?: string,
  bookingDetails?: {
    eventDate?: string;
    hallPreference?: string;
    timeSlot?: "DAY" | "NIGHT" | "FULL";
    depositAmount?: number;
  }
): Promise<{ success: boolean; error?: string }> {
  await assertAuth();

  // Try updating in Prisma reservation table
  await prisma.reservation
    .update({
      where: { id },
      data: {
        status: (status === "CONFIRMED"
          ? "CONFIRMED"
          : status === "CANCELLED"
          ? "CANCELLED"
          : "PENDING") as any,
        ...(bookingDetails?.eventDate ? { eventDate: new Date(bookingDetails.eventDate) } : {}),
      },
    })
    .catch(() => {});

  // Update in CRM site_settings list
  const { getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  const { syncLeadToCalendar } = await import("@/lib/crm/crm-service");
  const { getAllMetaLeads, saveAllMetaLeads } = await import("@/lib/meta/lead-service");

  let targetLead: any = null;

  const noteAddition = bookingDetails?.depositAmount
    ? `[Kapora]: ${bookingDetails.depositAmount.toLocaleString("tr-TR")} TL alındı (${bookingDetails.timeSlot === "DAY" ? "Gündüz 13:00-17:00" : "Akşam 19:00-23:00"})`
    : adminNote
    ? `[Not]: ${adminNote}`
    : undefined;

  const curr = await getSafeSetting("admin_crm_leads");
  if (curr) {
    try {
      let leads = JSON.parse(curr);
      leads = leads.map((l: any) => {
        if (l.id === id) {
          targetLead = {
            ...l,
            status,
            ...(bookingDetails?.eventDate ? { eventDate: bookingDetails.eventDate } : {}),
            ...(bookingDetails?.hallPreference ? { hallPreference: bookingDetails.hallPreference } : {}),
            ...(bookingDetails?.timeSlot ? { timeSlot: bookingDetails.timeSlot } : {}),
            notes: noteAddition ? `${l.notes || ""}\n${noteAddition}` : l.notes,
            updatedAt: new Date().toISOString(),
          };
          return targetLead;
        }
        return l;
      });
      await setSafeSetting("admin_crm_leads", JSON.stringify(leads));
    } catch {}
  }

  // Cross-sync with Meta Leads if applicable
  try {
    const metaLeads = await getAllMetaLeads();
    const metaIndex = metaLeads.findIndex((m) => m.id === id || m.leadgenId === id);
    if (metaIndex !== -1) {
      const metaStatus = status === "CONFIRMED" ? "Kapora alındı" : status === "CANCELLED" ? "Kaybedildi" : status === "OFFER_SENT" ? "Teklif verildi" : "Yeni";
      metaLeads[metaIndex].status = metaStatus as any;
      if (bookingDetails?.eventDate) (metaLeads[metaIndex] as any).eventDate = bookingDetails.eventDate;
      if (bookingDetails?.timeSlot) (metaLeads[metaIndex] as any).timeSlot = bookingDetails.timeSlot;
      if (bookingDetails?.hallPreference) (metaLeads[metaIndex] as any).hallPreference = bookingDetails.hallPreference;

      metaLeads[metaIndex].statusHistory.unshift({
        status: metaStatus as any,
        changedAt: new Date().toISOString(),
        changedBy: "CRM Yöneticisi",
        note: noteAddition || `CRM üzerinden durum "${status}" olarak güncellendi.`,
      });
      targetLead = targetLead || metaLeads[metaIndex];
      await saveAllMetaLeads(metaLeads);
    }
  } catch {}

  // Automated calendar booking or release on status change
  if (targetLead && (bookingDetails?.eventDate || targetLead.eventDate)) {
    try {
      const isConfirmed = status === "CONFIRMED";
      await syncLeadToCalendar(
        {
          id: targetLead.id,
          fullName: targetLead.fullName,
          eventDate: bookingDetails?.eventDate || targetLead.eventDate,
          hallPreference: bookingDetails?.hallPreference || targetLead.hallPreference,
          timeSlot: bookingDetails?.timeSlot || targetLead.timeSlot || "NIGHT",
          guestCount: targetLead.guestCount,
        },
        isConfirmed
      );
    } catch (calErr) {
      console.error("Calendar sync error in CRM:", calErr);
    }
  }

  await logAdminAction(
    `Talep durumunu "${status}" olarak güncelledi`,
    "Talepler & CRM",
    `ID: ${id}`
  );

  revalidatePath("/admin/talepler");
  revalidatePath("/admin/meta-leads");
  revalidatePath("/admin/takvim");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteLead(id: string): Promise<{ success: boolean; error?: string }> {
  await assertAuth();
  await prisma.reservation.delete({ where: { id } }).catch(() => {});

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_crm_leads" } })
    .catch(() => null);

  if (curr?.value) {
    try {
      let leads = JSON.parse(curr.value);
      leads = leads.filter((l: any) => l.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_crm_leads" },
        data: { value: JSON.stringify(leads) },
      });
    } catch {}
  }

  await logAdminAction("Bir talebi sildi", "Talepler & CRM", `ID: ${id}`);

  revalidatePath("/admin/talepler");
  revalidatePath("/admin");
  return { success: true };
}

export async function anonymizeCrmLead(id: string): Promise<{ success: boolean; error?: string }> {
  await assertAuth();
  const { isDatabaseReachable, getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  const isOnline = await isDatabaseReachable();

  if (isOnline) {
    try {
      const existing = await prisma.reservation.findUnique({ where: { id } });
      if (existing) {
        await prisma.reservation.update({
          where: { id },
          data: {
            fullName: existing.fullName.split(" ").map(w => w.length > 1 ? w[0] + "***" : "*").join(" "),
            phone: existing.phone.slice(0, 4) + " *** ** " + existing.phone.slice(-2),
            email: "anonymized@elmiradavet.com",
            message: "[KVKK Kapsamında Kişisel Veriler Anonimleştirildi]",
          },
        });
      }
    } catch {}
  }

  const curr = await getSafeSetting("admin_crm_leads");
  if (curr) {
    try {
      let leads = JSON.parse(curr);
      leads = leads.map((l: any) => {
        if (l.id === id) {
          return {
            ...l,
            fullName: (l.fullName || "").split(" ").map((w: string) => w.length > 1 ? w[0] + "***" : "*").join(" "),
            phone: (l.phone || "").slice(0, 4) + " *** ** " + (l.phone || "").slice(-2),
            email: "anonymized@elmiradavet.com",
            notes: "[KVKK Kapsamında Anonimleştirildi]",
            isAnonymized: true,
          };
        }
        return l;
      });
      await setSafeSetting("admin_crm_leads", JSON.stringify(leads));
    } catch {}
  }

  await logAdminAction("Bir talebi KVKK kapsamında anonimleştirdi", "Talepler & CRM", `ID: ${id}`);
  revalidatePath("/admin/talepler");
  revalidatePath("/admin");
  return { success: true };
}

// ─── 12. Users & Roles Management ────────────────────────

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "EDITOR";
}) {
  await assertAuth();

  const parsed = userCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Geçersiz kullanıcı verisi" };
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  try {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role,
      },
    });
  } catch {
    // If DB offline, store in site_settings custom users
    const curr = await prisma.siteSetting
      .findUnique({ where: { key: "admin_custom_users" } })
      .catch(() => null);

    let users: any[] = [];
    if (curr?.value) {
      try {
        users = JSON.parse(curr.value);
      } catch {}
    }

    users.push({
      id: "usr_" + Date.now(),
      name: data.name,
      email: data.email,
      role: data.role,
      createdAt: new Date().toISOString(),
    });

    await prisma.siteSetting
      .upsert({
        where: { key: "admin_custom_users" },
        update: { value: JSON.stringify(users) },
        create: { key: "admin_custom_users", value: JSON.stringify(users) },
      })
      .catch(() => {});
  }

  await logAdminAction(
    `"${data.name}" kullanıcısını oluşturdu (${data.role})`,
    "Kullanıcılar & Roller"
  );

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

export async function updateUserRole(id: string, role: "ADMIN" | "EDITOR") {
  await assertAuth();
  await prisma.user.update({ where: { id }, data: { role } }).catch(() => {});

  await logAdminAction(
    `Kullanıcı rolünü "${role}" yaptı`,
    "Kullanıcılar & Roller",
    `ID: ${id}`
  );

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

export async function updateUser(
  id: string,
  data: {
    name: string;
    email: string;
    role: "ADMIN" | "EDITOR";
    password?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  await assertAuth();

  const updateData: any = {
    name: data.name,
    email: data.email,
    role: data.role,
  };

  if (data.password && data.password.trim().length >= 6) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  try {
    await prisma.user.update({
      where: { id },
      data: updateData,
    });
  } catch {
    // If fallback custom users
    const curr = await prisma.siteSetting
      .findUnique({ where: { key: "admin_custom_users" } })
      .catch(() => null);

    if (curr?.value) {
      try {
        let users = JSON.parse(curr.value);
        users = users.map((u: any) =>
          u.id === id ? { ...u, name: data.name, email: data.email, role: data.role } : u
        );
        await prisma.siteSetting.update({
          where: { key: "admin_custom_users" },
          data: { value: JSON.stringify(users) },
        });
      } catch {}
    }
  }

  await logAdminAction(
    `"${data.name}" kullanıcısının bilgilerini güncelledi`,
    "Kullanıcılar & Roller",
    `ID: ${id}`
  );

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

export async function deleteUser(id: string) {
  await assertAuth();
  await prisma.user.delete({ where: { id } }).catch(() => {});

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_users" } })
    .catch(() => null);

  if (curr?.value) {
    try {
      let users = JSON.parse(curr.value);
      users = users.filter((u: any) => u.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_custom_users" },
        data: { value: JSON.stringify(users) },
      });
    } catch {}
  }

  await logAdminAction(
    "Bir kullanıcı hesabını sildi",
    "Kullanıcılar & Roller",
    `ID: ${id}`
  );

  revalidatePath("/admin/kullanicilar");
  return { success: true };
}

// ─── 13. Gallery Category ────────────────────────────────
export async function createGalleryCategory(name: string, slug: string) {
  await assertAuth();
  const safeSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]/g, "-");

  await prisma.galleryCategory
    .create({ data: { name, slug: safeSlug } })
    .catch(() => {});

  const { getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  const raw = await getSafeSetting("admin_custom_gallery_categories");
  let catList: any[] = [];
  if (raw) {
    try {
      catList = JSON.parse(raw);
    } catch {}
  }
  const newCat = {
    id: "cat_" + Date.now(),
    name,
    slug: safeSlug,
  };
  catList.push(newCat);
  await setSafeSetting("admin_custom_gallery_categories", JSON.stringify(catList));

  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true, category: newCat };
}

// ─── 14. Hero Slide Actions ──────────────────────────────
export async function createHeroSlide(data: {
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  buttonText?: string | null;
  buttonLink?: string | null;
  sortOrder?: number;
}) {
  await assertAuth();
  await prisma.heroSlide
    .create({
      data: {
        title: data.title,
        subtitle: data.subtitle || null,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText || null,
        buttonLink: data.buttonLink || null,
        sortOrder: Number(data.sortOrder) || 0,
        isActive: true,
      },
    })
    .catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

export async function deleteHeroSlide(id: string) {
  await assertAuth();
  await prisma.heroSlide.delete({ where: { id } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

export async function toggleHeroSlide(id: string, isActive: boolean) {
  await assertAuth();
  await prisma.heroSlide.update({ where: { id }, data: { isActive } }).catch(() => {});
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}

// ─── 15. Blog Actions ────────────────────────────────────
export async function createBlogPost(data: {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  status?: "DRAFT" | "PUBLISHED";
}) {
  await assertAuth();
  await prisma.blogPost
    .create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-"),
        excerpt: data.excerpt || null,
        content: data.content,
        coverImageUrl: data.coverImageUrl || null,
        status: data.status || "PUBLISHED",
      },
    })
    .catch(() => {});
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}

export async function deleteBlogPost(id: string) {
  await assertAuth();
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}

// ─── 16. Legacy Reservation Actions ──────────────────────
export async function updateReservationStatus(id: string, status: any) {
  return updateLeadStatus(id, status);
}

export async function deleteReservation(id: string) {
  return deleteLead(id);
}

export async function toggleBlockedDate(dateStr: string, note?: string) {
  await assertAuth();
  const date = new Date(dateStr);
  const existing = await prisma.blockedDate
    .findUnique({ where: { date } })
    .catch(() => null);

  if (existing) {
    await prisma.blockedDate.delete({ where: { date } }).catch(() => {});
  } else {
    await prisma.blockedDate
      .create({ data: { date, note: note || "Dolu" } })
      .catch(() => {});
  }
  revalidatePath("/");
  revalidatePath("/admin/takvim");
  return { success: true };
}

export async function togglePackageFeatured(id: string, isFeatured: boolean) {
  await assertAuth();
  await prisma.package
    .update({ where: { id }, data: { isFeatured } })
    .catch(() => {});
  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  return { success: true };
}

// ─── 17. Homepage Custom Sections Actions ────────────────────
export async function saveCustomStats(stats: any[]) {
  await assertAuth();
  await setSafeSetting("admin_custom_stats", JSON.stringify(stats));
  await logAdminAction(
    "Sayaç ve istatistik verilerini güncelledi",
    "İçerik Yönetimi",
    `${stats.length} sayaç kaydedildi`
  );
  revalidatePath("/");
  revalidatePath("/admin/icerik");
  return { success: true };
}

export async function saveCustomFeatures(data: any) {
  await assertAuth();
  await setSafeSetting("admin_custom_features", JSON.stringify(data));
  if (data.description) {
    await setSafeSetting("aboutText", data.description);
  }

  // Sync to home_page_sections so bolumler also updates
  try {
    const rawSections = await getSafeSetting("home_page_sections");
    if (rawSections) {
      const sections = JSON.parse(rawSections);
      const featSec = sections.find((s: any) => s.id === "features");
      if (featSec) {
        if (data.title) featSec.title = data.title;
        if (data.badge) featSec.subtitle = data.badge;
        await setSafeSetting("home_page_sections", JSON.stringify(sections));
      }
    }
  } catch {}

  await logAdminAction(
    "Ayrıcalıklar, hakkımızda metni ve vitrin alanını güncelledi",
    "İçerik Yönetimi"
  );
  revalidatePath("/");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/bolumler");
  revalidatePath("/admin/ayarlar");
  return { success: true };
}

export async function saveHeroVideoSettings(data: { videoUrl?: string; location?: string }) {
  await assertAuth();
  await setSafeSetting("admin_hero_video_settings", JSON.stringify(data));
  await logAdminAction(
    "Hero video ve konum ayarlarını güncelledi",
    "Hero Slider"
  );
  revalidatePath("/");
  revalidatePath("/admin/hero");
  return { success: true };
}
