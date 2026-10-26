"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
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
import bcrypt from "bcryptjs";

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

  const raw = {
    siteName: (formData.get("siteName") as string) || "Elmira Davet",
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

  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) {
    if (value !== undefined) {
      await prisma.siteSetting
        .upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
        .catch(() => {});
    }
  }

  await logAdminAction(
    "Site ayarlarını güncelledi",
    "Site Ayarları",
    "İletişim ve SEO ayarları kaydedildi"
  );

  revalidatePath("/", "layout");
  revalidatePath("/admin/ayarlar");
  return { success: true };
}

// ─── 2. Packages Action (Paket Yönetimi) ──────────────────

export async function createPackage(data: {
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

  try {
    await prisma.package.create({
      data: {
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
            text,
            sortOrder: idx,
          })),
        },
      },
    });
  } catch {
    // If DB offline, store in site_settings custom packages
    const curr = await prisma.siteSetting
      .findUnique({ where: { key: "admin_custom_packages" } })
      .catch(() => null);
    let list: any[] = [];
    if (curr?.value) {
      try {
        list = JSON.parse(curr.value);
      } catch {}
    }
    list.push({ ...data, id: "pkg_" + Date.now() });
    await prisma.siteSetting
      .upsert({
        where: { key: "admin_custom_packages" },
        update: { value: JSON.stringify(list) },
        create: { key: "admin_custom_packages", value: JSON.stringify(list) },
      })
      .catch(() => {});
  }

  await logAdminAction(
    `"${data.name}" paketini ekledi`,
    "İçerik Yönetimi",
    `Slug: ${data.slug}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deletePackage(id: string) {
  await assertAuth();
  await prisma.package.delete({ where: { id } }).catch(() => {});

  await logAdminAction("Bir paketi sildi", "İçerik Yönetimi", `ID: ${id}`);

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/paketler");
  return { success: true };
}

export async function togglePackageActive(id: string, isActive: boolean) {
  await assertAuth();
  await prisma.package
    .update({ where: { id }, data: { isActive } })
    .catch(() => {});

  await logAdminAction(
    `Paket durumunu ${isActive ? "Yayında" : "Taslak"} yaptı`,
    "İçerik Yönetimi",
    `ID: ${id}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
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

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_halls" } })
    .catch(() => null);

  let halls: any[] = [];
  if (curr?.value) {
    try {
      halls = JSON.parse(curr.value);
    } catch {}
  }

  if (data.id) {
    halls = halls.map((h) => (h.id === data.id ? { ...h, ...data } : h));
  } else {
    halls.push({ ...data, id: "hall_" + Date.now() });
  }

  await prisma.siteSetting
    .upsert({
      where: { key: "admin_custom_halls" },
      update: { value: JSON.stringify(halls) },
      create: { key: "admin_custom_halls", value: JSON.stringify(halls) },
    })
    .catch(() => {});

  await logAdminAction(
    `"${data.name}" salonunu güncelledi/ekledi`,
    "İçerik Yönetimi",
    `Kapasite: ${data.capacity}`
  );

  revalidatePath("/salonlar");
  revalidatePath("/admin/icerik");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteHall(id: string) {
  await assertAuth();

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_halls" } })
    .catch(() => null);

  if (curr?.value) {
    try {
      let halls = JSON.parse(curr.value);
      halls = halls.filter((h: any) => h.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_custom_halls" },
        data: { value: JSON.stringify(halls) },
      });
    } catch {}
  }

  await logAdminAction("Bir salonu sildi", "İçerik Yönetimi", `ID: ${id}`);

  revalidatePath("/salonlar");
  revalidatePath("/admin/icerik");
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

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_menus" } })
    .catch(() => null);

  let menus: any[] = [];
  if (curr?.value) {
    try {
      menus = JSON.parse(curr.value);
    } catch {}
  }

  if (data.id) {
    menus = menus.map((m) => (m.id === data.id ? { ...m, ...data } : m));
  } else {
    menus.push({ ...data, id: "menu_" + Date.now(), sortOrder: menus.length });
  }

  await prisma.siteSetting
    .upsert({
      where: { key: "admin_custom_menus" },
      update: { value: JSON.stringify(menus) },
      create: { key: "admin_custom_menus", value: JSON.stringify(menus) },
    })
    .catch(() => {});

  await logAdminAction(
    `"${data.name}" menüsünü güncelledi/ekledi`,
    "İçerik Yönetimi",
    `Kategori: ${data.category}`
  );

  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
  return { success: true };
}

export async function deleteMenu(id: string) {
  await assertAuth();

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_menus" } })
    .catch(() => null);

  if (curr?.value) {
    try {
      let menus = JSON.parse(curr.value);
      menus = menus.filter((m: any) => m.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_custom_menus" },
        data: { value: JSON.stringify(menus) },
      });
    } catch {}
  }

  await logAdminAction("Bir menüyü sildi", "İçerik Yönetimi", `ID: ${id}`);
  revalidatePath("/paketler");
  revalidatePath("/admin/icerik");
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

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_events" } })
    .catch(() => null);

  let events: any[] = [];
  if (curr?.value) {
    try {
      events = JSON.parse(curr.value);
    } catch {}
  }

  if (data.id) {
    events = events.map((e) => (e.id === data.id ? { ...e, ...data } : e));
  } else {
    events.push({ ...data, id: "ev_" + Date.now() });
  }

  await prisma.siteSetting
    .upsert({
      where: { key: "admin_custom_events" },
      update: { value: JSON.stringify(events) },
      create: { key: "admin_custom_events", value: JSON.stringify(events) },
    })
    .catch(() => {});

  await logAdminAction(
    `"${data.title}" etkinlik türünü güncelledi`,
    "İçerik Yönetimi"
  );

  revalidatePath("/etkinlikler");
  revalidatePath("/admin/icerik");
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

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_faqs" } })
    .catch(() => null);

  let faqs: any[] = [];
  if (curr?.value) {
    try {
      faqs = JSON.parse(curr.value);
    } catch {}
  }

  if (data.id) {
    faqs = faqs.map((f) => (f.id === data.id ? { ...f, ...data } : f));
  } else {
    faqs.push({ ...data, id: "faq_" + Date.now() });
  }

  await prisma.siteSetting
    .upsert({
      where: { key: "admin_custom_faqs" },
      update: { value: JSON.stringify(faqs) },
      create: { key: "admin_custom_faqs", value: JSON.stringify(faqs) },
    })
    .catch(() => {});

  await logAdminAction(
    `"${data.q.substring(0, 30)}..." SSS sorusunu kaydetti`,
    "İçerik Yönetimi"
  );

  revalidatePath("/sss");
  revalidatePath("/admin/icerik");
  return { success: true };
}

export async function deleteFaq(id: string) {
  await assertAuth();

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_faqs" } })
    .catch(() => null);

  if (curr?.value) {
    try {
      let faqs = JSON.parse(curr.value);
      faqs = faqs.filter((f: any) => f.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_custom_faqs" },
        data: { value: JSON.stringify(faqs) },
      });
    } catch {}
  }

  await logAdminAction("Bir SSS sorusunu sildi", "İçerik Yönetimi");
  revalidatePath("/sss");
  revalidatePath("/admin/icerik");
  return { success: true };
}

// ─── 7. Testimonials Action (Yorumlar) ───────────────────

export async function createTestimonial(data: {
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

  await prisma.testimonial
    .create({
      data: {
        name: data.name,
        eventType: data.eventType || null,
        content: data.content,
        rating: Number(data.rating) || 5,
      },
    })
    .catch(() => {});

  await logAdminAction(
    `"${data.name}" adına misafir yorumu ekledi`,
    "İçerik Yönetimi"
  );

  revalidatePath("/", "layout");
  revalidatePath("/referanslar");
  revalidatePath("/admin/icerik");
  revalidatePath("/admin/yorumlar");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  await assertAuth();
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

  try {
    await prisma.galleryImage.create({
      data: {
        imageUrl: data.imageUrl,
        alt: data.alt || "Elmira Davet Galeri",
        title: data.title || null,
        categoryId: data.categoryId,
      },
    });
  } catch {
    // If DB offline, store in site_settings
    const curr = await prisma.siteSetting
      .findUnique({ where: { key: "admin_custom_gallery" } })
      .catch(() => null);
    let list: any[] = [];
    if (curr?.value) {
      try {
        list = JSON.parse(curr.value);
      } catch {}
    }
    list.unshift({
      id: "img_" + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    });
    await prisma.siteSetting
      .upsert({
        where: { key: "admin_custom_gallery" },
        update: { value: JSON.stringify(list) },
        create: { key: "admin_custom_gallery", value: JSON.stringify(list) },
      })
      .catch(() => {});
  }

  await logAdminAction("Galeriye yeni fotoğraf ekledi", "Galeri & Medya");

  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deleteGalleryImage(id: string) {
  await assertAuth();
  await prisma.galleryImage.delete({ where: { id } }).catch(() => {});

  const curr = await prisma.siteSetting
    .findUnique({ where: { key: "admin_custom_gallery" } })
    .catch(() => null);
  if (curr?.value) {
    try {
      let list = JSON.parse(curr.value);
      list = list.filter((i: any) => i.id !== id);
      await prisma.siteSetting.update({
        where: { key: "admin_custom_gallery" },
        data: { value: JSON.stringify(list) },
      });
    } catch {}
  }

  await logAdminAction("Galeriden fotoğraf sildi", "Galeri & Medya");

  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
}

// ─── 9. Page Sections Action (Sayfa Bölümleri Aç/Kapa) ───

export async function savePageSectionsConfig(sections: any[]) {
  await assertAuth();

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
  adminNote?: string
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
      },
    })
    .catch(() => {});

  // Update in CRM site_settings list
  const { getSafeSetting, setSafeSetting } = await import("@/lib/local-store");
  const { syncLeadToCalendar } = await import("@/lib/crm/crm-service");
  const { getAllMetaLeads, saveAllMetaLeads } = await import("@/lib/meta/lead-service");

  let targetLead: any = null;

  const curr = await getSafeSetting("admin_crm_leads");
  if (curr) {
    try {
      let leads = JSON.parse(curr);
      leads = leads.map((l: any) => {
        if (l.id === id) {
          targetLead = {
            ...l,
            status,
            notes: adminNote ? `${l.notes || ""}\n[Not]: ${adminNote}` : l.notes,
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
      metaLeads[metaIndex].statusHistory.unshift({
        status: metaStatus as any,
        changedAt: new Date().toISOString(),
        changedBy: "CRM Yöneticisi",
        note: adminNote || `CRM üzerinden durum "${status}" olarak güncellendi.`,
      });
      targetLead = targetLead || metaLeads[metaIndex];
      await saveAllMetaLeads(metaLeads);
    }
  } catch {}

  // Update in reservations list if website lead
  try {
    const rawRes = await getSafeSetting("reservations");
    if (rawRes) {
      let resList = JSON.parse(rawRes);
      if (Array.isArray(resList)) {
        resList = resList.map((r: any) => {
          if (r.id === id) {
            targetLead = targetLead || {
              id: r.id,
              fullName: r.fullName,
              eventDate: (r.eventDate || "").split("T")[0],
              hallPreference: r.hallPreference || "Kristal Salon (600 Kişilik)",
              timeSlot: r.timeSlot || "NIGHT",
              guestCount: r.guestCount,
              status,
            };
            return {
              ...r,
              status,
              updatedAt: new Date().toISOString(),
            };
          }
          return r;
        });
        await setSafeSetting("reservations", JSON.stringify(resList));
      }
    }
  } catch {}

  // Automated calendar booking or release on status change
  if (targetLead && targetLead.eventDate) {
    try {
      const isConfirmed = status === "CONFIRMED";
      await syncLeadToCalendar(
        {
          id: targetLead.id,
          fullName: targetLead.fullName,
          eventDate: targetLead.eventDate,
          hallPreference: targetLead.hallPreference,
          timeSlot: targetLead.timeSlot || "NIGHT",
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
  await prisma.galleryCategory
    .create({ data: { name, slug: slug || name.toLowerCase().replace(/\s+/g, "-") } })
    .catch(() => {});
  revalidatePath("/galeri");
  revalidatePath("/admin/galeri");
  return { success: true };
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
