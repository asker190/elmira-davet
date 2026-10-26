import { prisma } from "@/lib/prisma";
import { isDatabaseReachable, getSafeSetting, setSafeSetting } from "@/lib/local-store";
import type {
  PageData,
  PageStatus,
  RevisionType,
  BlockNode,
  PageRevisionData,
  PageLockData,
} from "./types";
import { pageFormSchema, sanitizeHtml, slugifyTurkish } from "./validation";
import { registerPageRedirect } from "./redirect-service";

const LOCK_DURATION_MS = 60 * 1000; // 60 saniye kilit süresi

import { createNewBlock } from "./registry";

// ─── Default Seed Pages for Elmira Davet ───────────────────
export function getDefaultSeedPages(): PageData[] {
  const now = new Date().toISOString();

  return [
    {
      id: "page_anasayfa",
      title: "Ana Sayfa",
      slug: "",
      status: "PUBLISHED",
      parentId: null,
      template: "home",
      menuOrder: 1,
      isSystem: true,
      systemKey: "anasayfa",
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Elmira Davet & Balo Salonları | Gaziosmanpaşa Düğün Salonu",
        description: "Gaziosmanpaşa'da 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi ile masalsı düğün, nişan ve davet organizasyonları.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
          videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41378-large.mp4",
          title: "Aşkınızın En Görkemli Sahnesi",
          subtitle: "Gaziosmanpaşa'da Lüks & Zarafet | 600 ve 300 Kişilik İki Farklı Konsept",
          primaryButtonText: "Hemen Teklif Al",
          primaryButtonUrl: "/iletisim",
          secondaryButtonText: "Salonları Keşfet",
          secondaryButtonUrl: "/salonlar",
          overlayOpacity: 55,
        }),
        createNewBlock("counters", {
          items: [
            { label: "Mutlu Düğün & Davet", value: 1200, suffix: "+", sublabel: "Gaziosmanpaşa'da unutulmaz tecrübe" },
            { label: "Kristal Salon", value: 600, suffix: " Kişi", sublabel: "Lüks kapalı davet ve balo salonu" },
            { label: "Kır Bahçesi", value: 300, suffix: " Kişi", sublabel: "Yıldızlar altında doğal açık hava" },
            { label: "Misafir Memnuniyeti", value: 99, prefix: "%", suffix: "", sublabel: "Doğrulanmış çift ve aile yorumları" },
          ],
        }),
        createNewBlock("heading", {
          badgeText: "SALONLAR",
          text: "Salonlarımız & Kapasiteler",
          subtitle: "İki Farklı Atmosfer, Tek Bir Zarafet",
          level: 2,
        }),
        createNewBlock("hall_cards", { displayMode: "all", columns: 2 }),
        createNewBlock("heading", {
          badgeText: "AVANTAJLAR",
          text: "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz",
          subtitle: "Gaziosmanpaşa Merkezde Prestijli Konum",
          level: 2,
        }),
        createNewBlock("packages", { layout: "cards", displayMode: "all" }),
        createNewBlock("gallery", { layout: "masonry", displayMode: "all" }),
        createNewBlock("testimonials", { layout: "slider", displayMode: "all" }),
        createNewBlock("reservation_form", {
          title: "Tarihinizi Hemen Ayırın",
          subtitle: "Rezervasyon & Bilgi",
        }),
      ],
    },
    {
      id: "page_hakkimizda",
      title: "Hakkımızda",
      slug: "hakkimizda",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 2,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Hakkımızda | Elmira Davet & Balo Salonları",
        description: "14 yıllık organizasyon tecrübesi, ödüllü şefleri ve seçkin mimarisiyle Elmira Davet hakkında detaylı bilgi.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          title: "Zarafetin Gaziosmanpaşa'daki Adresi",
          subtitle: "14 yıllık organizasyon tecrübemiz ve yüksek tavanlı saray mimarimizle hayallerinizi gerçeğe dönüştürüyoruz.",
          primaryButtonText: "Salonlarımızı İnceleyin",
          primaryButtonUrl: "/salonlar",
        }),
        createNewBlock("heading", {
          badgeText: "BİZ KİMİZ?",
          text: "Kusursuz Davetlerin Güvenilir İsmi",
          subtitle: "Her organizasyon bir sanat eseri titizliğiyle planlanır ve yönetilir.",
          level: 2,
        }),
        createNewBlock("text", {
          html: "<p>Elmira Davet & Balo Salonları, İstanbul Gaziosmanpaşa merkezinde yer alan, yüksek tavanlı, kolonsuz ferah mimarisi ve son teknoloji ışık-ses sistemleriyle donatılmış lüks bir organizasyon kompleksidir.</p><p>Misafirlerimizin memnuniyetini her zaman ön planda tutarak, profesyonel orkestra, usta aşçılarımızın hazırladığı gurme menüler ve deneyimli servis personeliyle gecenizi unutulmaz kılıyoruz.</p>",
        }),
        createNewBlock("counters"),
        createNewBlock("button_cta", {
          text: "Hayalinizdeki Geceyi Birlikte Planlayalım",
          buttonText: "Randevu Alın",
          buttonUrl: "/iletisim",
        }),
      ],
    },
    {
      id: "page_salonlar",
      title: "Salonlarımız & Davet Alanları",
      slug: "salonlar",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 3,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Davet Salonlarımız & Kapasiteler | Elmira Davet",
        description: "600 kişilik Kristal Balo Salonu ve 300 kişilik Kır Bahçesi alanlarımızın fotoğrafları ve özellikleri.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
          title: "İhtişam ve Zarafet Dolu Davet Alanlarımız",
          subtitle: "600 kişilik saray konseptli Kristal Salon ve 300 kişilik romantik Kır Bahçemiz",
          primaryButtonText: "Fiyat Teklifi Al",
          primaryButtonUrl: "/iletisim",
        }),
        createNewBlock("heading", {
          badgeText: "SALONLAR",
          text: "Her Zevke ve Kapasiteye Uygun Mekanlar",
          level: 2,
        }),
        createNewBlock("hall_cards", { displayMode: "all", columns: 2 }),
        createNewBlock("reservation_form"),
      ],
    },
    {
      id: "page_paketler",
      title: "Paketler & Menüler",
      slug: "paketler",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 4,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Düğün & Davet Paketlerimiz | Elmira Davet",
        description: "Yemekli, kokteylli ve kına özel paket içeriklerimizi, zengin menülerimizi inceleyin.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1920&q=80",
          title: "Kişiye Özel Davet ve Düğün Paketleri",
          subtitle: "Her bütçeye ve konsepte uygun gala menüleri, kokteyl ikramları ve zengin hizmet içerikleri",
          primaryButtonText: "Menü Detayları",
          primaryButtonUrl: "/iletisim",
        }),
        createNewBlock("heading", {
          badgeText: "ORGANİZASYON PAKETLERİ",
          text: "Zengin İçerik, Şeffaf Fiyatlandırma",
          level: 2,
        }),
        createNewBlock("packages", { layout: "cards", displayMode: "all" }),
        createNewBlock("reservation_form"),
      ],
    },
    {
      id: "page_etkinlikler",
      title: "Etkinlik Türleri",
      slug: "etkinlikler",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 5,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Etkinlik & Organizasyon Türleri | Elmira Davet",
        description: "Düğün, kına gecesi, nişan, sünnet düğünü ve kurumsal organizasyon çözümleri.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1920&q=80",
          title: "Etkinlik & Organizasyon Türleri",
          subtitle: "Düğün, Kına Gecesi, Nişan, Sünnet ve Kurumsal Toplantılar",
          primaryButtonText: "Teklif Al",
          primaryButtonUrl: "/iletisim",
        }),
        createNewBlock("heading", {
          badgeText: "HİZMETLERİMİZ",
          text: "Hayal Ettiğiniz Tüm Kutlamalar İçin",
          level: 2,
        }),
        createNewBlock("hall_cards", { displayMode: "all" }),
        createNewBlock("button_cta", {
          text: "Özel Gününüz İçin Tarih Belirleyin",
          buttonText: "Bize Ulaşın",
          buttonUrl: "/iletisim",
        }),
      ],
    },
    {
      id: "page_galeri",
      title: "Fotoğraf & Video Galerisi",
      slug: "galeri",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 6,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Fotoğraf Galerisi | Elmira Davet Salonu",
        description: "Salon süslemeleri, gelin yolu, sahne ışıklandırmaları ve mutlu çiftlerimizin kareleri.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          title: "Fotoğraf & Video Galerisi",
          subtitle: "Işıltılı anlardan ve mutlu çiftlerimizin anılarından seçilen özel kareler",
          primaryButtonText: "Salonları Gör",
          primaryButtonUrl: "/salonlar",
        }),
        createNewBlock("heading", {
          badgeText: "GÖRSEL YOLCULUK",
          text: "Büyüleyici Atmosferimizden Kareler",
          level: 2,
        }),
        createNewBlock("gallery", { layout: "masonry", columns: 3 }),
      ],
    },
    {
      id: "page_referanslar",
      title: "Mutlu Çiftlerimiz & Yorumlar",
      slug: "referanslar",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 7,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Müşteri Yorumları & Referanslar | Elmira Davet",
        description: "Elmira Davet Salonu'nda dünyaevine giren misafirlerimizin gerçek deneyimleri ve değerlendirmeleri.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1920&q=80",
          title: "Mutlu Çiftlerimiz & Yorumlar",
          subtitle: "Elmira Davet Salonu'nda dünyaevine giren misafirlerimizin gerçek deneyimleri",
          primaryButtonText: "Teklif Al",
          primaryButtonUrl: "/iletisim",
        }),
        createNewBlock("heading", {
          badgeText: "%99.8 MEMNUNİYET ORANI",
          text: "Gerçek Çift Deneyimleri",
          level: 2,
        }),
        createNewBlock("testimonials", { layout: "slider", displayMode: "all" }),
      ],
    },
    {
      id: "page_sss",
      title: "Sıkça Sorulan Sorular",
      slug: "sss",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 8,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "Sıkça Sorulan Sorular | Elmira Davet Salonu",
        description: "Rezervasyon süreleri, menü tadımı, otopark ve organizasyon detayları hakkında sorular ve yanıtları.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
          title: "Sıkça Sorulan Sorular",
          subtitle: "Rezervasyon ve organizasyon sürecinizle ilgili aklınıza takılan tüm soruların yanıtları",
          primaryButtonText: "Bize Ulaşın",
          primaryButtonUrl: "/iletisim",
        }),
        createNewBlock("heading", {
          badgeText: "MERAK EDİLENLER",
          text: "Soru & Cevap Rehberi",
          level: 2,
        }),
        createNewBlock("faq", { displayMode: "all" }),
        createNewBlock("reservation_form"),
      ],
    },
    {
      id: "page_iletisim",
      title: "İletişim & Randevu",
      slug: "iletisim",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 9,
      isSystem: true,
      systemKey: "iletisim",
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "İletişim & Rezervasyon | Elmira Davet Gaziosmanpaşa",
        description: "Elmira Davet Salonu telefon, adres, konum ve online randevu / teklif formu.",
      },
      content: [
        createNewBlock("hero", {
          imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80",
          title: "Hayalinizdeki Gece İçin Bizimle İletişime Geçin",
          subtitle: "Gaziosmanpaşa merkezde yer alan salonumuzda sizleri ağırlamaktan mutluluk duyacağız.",
          primaryButtonText: "Hemen Ara",
          primaryButtonUrl: "tel:02120000000",
        }),
        createNewBlock("reservation_form"),
        createNewBlock("map", {
          title: "Merkezi Konum & Kolay Ulaşım",
          address: "Gaziosmanpaşa Merkez Mah. Davet Sok. No:12 Gaziosmanpaşa / İstanbul",
        }),
      ],
    },
    {
      id: "page_kvkk",
      title: "KVKK & Gizlilik Politikası",
      slug: "kvkk",
      status: "PUBLISHED",
      parentId: null,
      template: "default",
      menuOrder: 10,
      isSystem: false,
      schemaVersion: 1,
      version: 1,
      publishedAt: now,
      scheduledAt: null,
      trashedAt: null,
      createdAt: now,
      updatedAt: now,
      seo: {
        title: "KVKK Aydınlatma Metni | Elmira Davet",
        description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni ve gizlilik politikası.",
      },
      content: [
        createNewBlock("heading", {
          badgeText: "YASAL BİLGİLENDİRME",
          text: "KVKK ve Gizlilik Politikası",
          subtitle: "6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Bilgilendirme",
          level: 1,
        }),
        createNewBlock("text", {
          html: "<p>Elmira Davet Salonu olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Web sitemiz veya formlarımız üzerinden paylaştığınız ad, soyad, telefon ve e-posta bilgileriniz yalnızca teklif sunulması ve organizasyon süreçlerinin yürütülmesi amacıyla işlenmektedir.</p><p>Verileriniz üçüncü şahıslara veya kurumlara ticari amaçlarla asla aktarılmaz ve yasal saklama süreleri hitamında güvenli şekilde imha edilir.</p>",
        }),
      ],
    },
  ];
}

// ─── Local Store Helpers ──────────────────────────────────
async function getLocalPages(): Promise<PageData[]> {
  try {
    const raw = await getSafeSetting("cms_pages_v2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { }

  // If local store is empty or missing, populate with default seed pages!
  const seedPages = getDefaultSeedPages();
  await saveLocalPages(seedPages);
  return seedPages;
}

async function saveLocalPages(pages: PageData[]): Promise<void> {
  await setSafeSetting("cms_pages_v2", JSON.stringify(pages));
}


// ─── Lock Management (PG-K) ───────────────────────────────

export async function getPageLock(pageId: string): Promise<PageLockData | null> {
  const now = new Date();
  if (await isDatabaseReachable()) {
    try {
      const lock = await prisma.pageLock.findUnique({
        where: { pageId },
      });
      if (lock && lock.expiresAt > now) {
        return {
          pageId: lock.pageId,
          userId: lock.userId,
          userName: lock.userName,
          expiresAt: lock.expiresAt.toISOString(),
        };
      } else if (lock) {
        // Expired lock: remove automatically
        await prisma.pageLock.delete({ where: { pageId } }).catch(() => { });
      }
    } catch { }
  }

  // Fallback to local store locks
  try {
    const raw = await getSafeSetting(`lock_${pageId}`);
    if (raw) {
      const parsed = JSON.parse(raw) as PageLockData;
      if (new Date(parsed.expiresAt) > now) {
        return parsed;
      }
    }
  } catch { }

  return null;
}

export async function acquirePageLock(
  pageId: string,
  userId: string,
  userName: string
): Promise<{ success: boolean; currentLock?: PageLockData }> {
  const currentLock = await getPageLock(pageId);
  if (currentLock && currentLock.userId !== userId) {
    return { success: false, currentLock };
  }

  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  const lockData: PageLockData = {
    pageId,
    userId,
    userName,
    expiresAt: expiresAt.toISOString(),
  };

  if (await isDatabaseReachable()) {
    try {
      await prisma.pageLock.upsert({
        where: { pageId },
        update: { userId, userName, expiresAt },
        create: { pageId, userId, userName, expiresAt },
      });
    } catch { }
  }

  await setSafeSetting(`lock_${pageId}`, JSON.stringify(lockData));
  return { success: true, currentLock: lockData };
}

export async function renewPageLock(
  pageId: string,
  userId: string
): Promise<boolean> {
  const currentLock = await getPageLock(pageId);
  if (!currentLock || currentLock.userId !== userId) {
    return false;
  }

  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  currentLock.expiresAt = expiresAt.toISOString();

  if (await isDatabaseReachable()) {
    try {
      await prisma.pageLock.update({
        where: { pageId },
        data: { expiresAt },
      });
    } catch { }
  }

  await setSafeSetting(`lock_${pageId}`, JSON.stringify(currentLock));
  return true;
}

export async function releasePageLock(
  pageId: string,
  userId: string
): Promise<void> {
  const currentLock = await getPageLock(pageId);
  if (currentLock && currentLock.userId === userId) {
    if (await isDatabaseReachable()) {
      try {
        await prisma.pageLock.delete({ where: { pageId } }).catch(() => { });
      } catch { }
    }
    await setSafeSetting(`lock_${pageId}`, "");
  }
}

export async function forceTakeoverLock(
  pageId: string,
  newUserId: string,
  newUserName: string
): Promise<PageLockData> {
  const expiresAt = new Date(Date.now() + LOCK_DURATION_MS);
  const lockData: PageLockData = {
    pageId,
    userId: newUserId,
    userName: newUserName,
    expiresAt: expiresAt.toISOString(),
  };

  if (await isDatabaseReachable()) {
    try {
      await prisma.pageLock.upsert({
        where: { pageId },
        update: { userId: newUserId, userName: newUserName, expiresAt },
        create: { pageId, userId: newUserId, userName: newUserName, expiresAt },
      });
    } catch { }
  }

  await setSafeSetting(`lock_${pageId}`, JSON.stringify(lockData));
  return lockData;
}

// ─── Revision Management (PG-R) ───────────────────────────

export async function createPageRevision(
  pageId: string,
  title: string,
  content: BlockNode[],
  authorId?: string | null,
  type: RevisionType = "MANUAL"
): Promise<PageRevisionData> {
  const now = new Date();
  let revisionId = `rev_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  if (await isDatabaseReachable()) {
    try {
      // If AUTOSAVE, check if last revision is also AUTOSAVE by same author within 5 minutes
      if (type === "AUTOSAVE") {
        const lastRev = await prisma.pageRevision.findFirst({
          where: { pageId, type: "AUTOSAVE" },
          orderBy: { createdAt: "desc" },
        });

        if (
          lastRev &&
          now.getTime() - new Date(lastRev.createdAt).getTime() < 5 * 60 * 1000
        ) {
          // Update in-place to avoid revision flooding
          const updated = await prisma.pageRevision.update({
            where: { id: lastRev.id },
            data: { title, content: content as any },
          });
          return {
            id: updated.id,
            pageId,
            title: updated.title,
            content: updated.content as unknown as BlockNode[],
            type: "AUTOSAVE",
            authorId,
            createdAt: updated.createdAt.toISOString(),
          };
        }
      }

      const rev = await prisma.pageRevision.create({
        data: {
          pageId,
          title,
          content: content as any,
          authorId: authorId || undefined,
          type,
          createdAt: now,
        },
      });
      revisionId = rev.id;

      // Maintain max 50 revisions per page, keep all PUBLISH revisions
      const revisions = await prisma.pageRevision.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
      });

      if (revisions.length > 50) {
        const excess = revisions
          .slice(50)
          .filter((r) => r.type !== "PUBLISH");
        if (excess.length > 0) {
          await prisma.pageRevision.deleteMany({
            where: { id: { in: excess.map((r) => r.id) } },
          });
        }
      }
    } catch (err) {
      console.warn("Prisma revision create error, fallback to local:", err);
    }
  }

  // Backup to local store
  const localKey = `revisions_${pageId}`;
  const raw = await getSafeSetting(localKey);
  let localRevs: PageRevisionData[] = [];
  if (raw) {
    try {
      localRevs = JSON.parse(raw);
    } catch { }
  }

  const newRev: PageRevisionData = {
    id: revisionId,
    pageId,
    title,
    content,
    authorId,
    type,
    createdAt: now.toISOString(),
  };

  localRevs.unshift(newRev);
  if (localRevs.length > 50) localRevs = localRevs.slice(0, 50);
  await setSafeSetting(localKey, JSON.stringify(localRevs));

  return newRev;
}

export async function getPageRevisions(
  pageId: string
): Promise<PageRevisionData[]> {
  if (await isDatabaseReachable()) {
    try {
      const revs = await prisma.pageRevision.findMany({
        where: { pageId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { author: { select: { name: true } } },
      });

      if (revs.length > 0) {
        return revs.map((r) => ({
          id: r.id,
          pageId: r.pageId,
          title: r.title,
          content: r.content as unknown as BlockNode[],
          authorId: r.authorId,
          authorName: r.author?.name || null,
          type: r.type as RevisionType,
          createdAt: r.createdAt.toISOString(),
        }));
      }
    } catch { }
  }

  const raw = await getSafeSetting(`revisions_${pageId}`);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch { }
  }
  return [];
}

export const getRevisionsByPageId = getPageRevisions;

export async function restoreRevision(
  pageId: string,
  revisionId: string,
  userId?: string
): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const revs = await getPageRevisions(pageId);
  const rev = revs.find((r) => r.id === revisionId);
  if (!rev) return { success: false, error: "Revizyon bulunamadı." };

  await createPageRevision(pageId, rev.title, rev.content, userId, "RESTORE");

  return updatePage(
    pageId,
    {
      title: rev.title,
      content: rev.content,
    },
    userId,
    "RESTORE"
  );
}

// ─── Page CRUD Operations (PG-L, PG-N, PG-E) ──────────────


export async function getAllPages(options?: {
  status?: PageStatus | "ALL";
  search?: string;
}): Promise<PageData[]> {
  const statusFilter = options?.status && options.status !== "ALL" ? options.status : undefined;
  const searchFilter = options?.search?.trim().toLocaleLowerCase("tr-TR");

  if (await isDatabaseReachable()) {
    try {
      const dbPages = await prisma.page.findMany({
        where: {
          ...(statusFilter
            ? { status: statusFilter }
            : { status: { not: "TRASH" } }), // Tümü sekmesinde Çöp hariç tutulur (L-02)
        },
        orderBy: [{ menuOrder: "asc" }, { updatedAt: "desc" }],
        include: {
          author: { select: { name: true } },
          parent: { select: { id: true, title: true, slug: true } },
          locks: true,
        },
      });

      let mapped: PageData[] = dbPages.map((p) => {
        const lock = p.locks[0];
        const isLockActive = lock && lock.expiresAt > new Date();

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status as PageStatus,
          parentId: p.parentId,
          parent: p.parent,
          template: p.template,
          menuOrder: p.menuOrder,
          isSystem: p.isSystem,
          systemKey: p.systemKey,
          content: (p.content as unknown as BlockNode[]) || [],
          schemaVersion: p.schemaVersion,
          version: p.version,
          featuredImageId: p.featuredImageId,
          seo: p.seo as any,
          authorId: p.authorId,
          authorName: p.author?.name || "Yönetici",
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
          trashedAt: p.trashedAt ? p.trashedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          lock: isLockActive
            ? {
              pageId: lock.pageId,
              userId: lock.userId,
              userName: lock.userName,
              expiresAt: lock.expiresAt.toISOString(),
            }
            : null,
        };
      });

      if (searchFilter) {
        mapped = mapped.filter(
          (p) =>
            p.title.toLocaleLowerCase("tr-TR").includes(searchFilter) ||
            p.slug.toLocaleLowerCase("tr-TR").includes(searchFilter)
        );
      }

      return mapped;
    } catch (err) {
      console.warn("DB read error in getAllPages, falling back to local:", err);
    }
  }

  // Local fallback
  let local = await getLocalPages();
  if (statusFilter) {
    local = local.filter((p) => p.status === statusFilter);
  } else {
    local = local.filter((p) => p.status !== "TRASH");
  }

  if (searchFilter) {
    local = local.filter(
      (p) =>
        p.title.toLocaleLowerCase("tr-TR").includes(searchFilter) ||
        p.slug.toLocaleLowerCase("tr-TR").includes(searchFilter)
    );
  }
  return local;
}

export async function getPageById(id: string): Promise<PageData | null> {
  if (await isDatabaseReachable()) {
    try {
      const p = await prisma.page.findUnique({
        where: { id },
        include: {
          author: { select: { name: true } },
          parent: { select: { id: true, title: true, slug: true } },
          locks: true,
        },
      });
      if (p) {
        const lock = p.locks[0];
        const isLockActive = lock && lock.expiresAt > new Date();
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status as PageStatus,
          parentId: p.parentId,
          parent: p.parent,
          template: p.template,
          menuOrder: p.menuOrder,
          isSystem: p.isSystem,
          systemKey: p.systemKey,
          content: (p.content as unknown as BlockNode[]) || [],
          schemaVersion: p.schemaVersion,
          version: p.version,
          featuredImageId: p.featuredImageId,
          seo: p.seo as any,
          authorId: p.authorId,
          authorName: p.author?.name || null,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
          trashedAt: p.trashedAt ? p.trashedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          lock: isLockActive
            ? {
              pageId: lock.pageId,
              userId: lock.userId,
              userName: lock.userName,
              expiresAt: lock.expiresAt.toISOString(),
            }
            : null,
        };
      }
    } catch { }
  }

  const local = await getLocalPages();
  return local.find((p) => p.id === id) || null;
}

export async function getPageBySlug(slug: string): Promise<PageData | null> {
  const cleanSlug = (slug || "").trim();

  if (await isDatabaseReachable()) {
    try {
      let p = await prisma.page.findUnique({
        where: { slug: cleanSlug },
        include: {
          author: { select: { name: true } },
          parent: { select: { id: true, title: true, slug: true } },
        },
      });

      // Fallback for root / or anasayfa
      if (!p && (cleanSlug === "" || cleanSlug === "anasayfa")) {
        p = await prisma.page.findFirst({
          where: {
            OR: [
              { slug: "" },
              { slug: "anasayfa" },
              { systemKey: "anasayfa" },
            ],
          },
          include: {
            author: { select: { name: true } },
            parent: { select: { id: true, title: true, slug: true } },
          },
        });
      }

      if (p) {
        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status as PageStatus,
          parentId: p.parentId,
          parent: p.parent,
          template: p.template,
          menuOrder: p.menuOrder,
          isSystem: p.isSystem,
          systemKey: p.systemKey,
          content: (p.content as unknown as BlockNode[]) || [],
          schemaVersion: p.schemaVersion,
          version: p.version,
          featuredImageId: p.featuredImageId,
          seo: p.seo as any,
          authorId: p.authorId,
          authorName: p.author?.name || null,
          publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
          scheduledAt: p.scheduledAt ? p.scheduledAt.toISOString() : null,
          trashedAt: p.trashedAt ? p.trashedAt.toISOString() : null,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }
    } catch { }
  }

  const local = await getLocalPages();
  let found = local.find((p) => p.slug === cleanSlug);
  if (!found && (cleanSlug === "" || cleanSlug === "anasayfa")) {
    found = local.find((p) => p.slug === "" || p.slug === "anasayfa" || p.systemKey === "anasayfa");
  }
  return found || null;
}

export async function createPage(
  input: {
    title: string;
    slug?: string;
    template?: string;
    parentId?: string | null;
    content?: BlockNode[];
    status?: PageStatus;
    seo?: any;
    isSystem?: boolean;
    systemKey?: string;
  },
  authorId?: string
): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const cleanTitle = (input.title || "").trim();
  const generatedSlug =
    input.slug !== undefined
      ? (input.slug.trim() === "" ? "" : slugifyTurkish(input.slug))
      : slugifyTurkish(cleanTitle) || `sayfa-${Date.now().toString(36)}`;

  // Slug uniqueness validation
  const existing = await getPageBySlug(generatedSlug);
  if (existing) {
    return {
      success: false,
      error:
        generatedSlug === ""
          ? "Kök ('/') kalıcı bağlantısı başka bir sayfa tarafından kullanılıyor."
          : `Bu kalıcı bağlantı (${generatedSlug}) başka bir sayfa tarafından kullanılıyor. Lütfen farklı bir bağlantı belirleyin.`,
    };
  }

  const now = new Date();
  const pageId = `page_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  const newPage: PageData = {
    id: pageId,
    title: input.title || "Başlıksız",
    slug: generatedSlug,
    status: input.status || "DRAFT",
    parentId: input.parentId || null,
    template: input.template || "default",
    menuOrder: 0,
    isSystem: Boolean(input.isSystem),
    systemKey: input.systemKey || null,
    content: input.content || [],
    schemaVersion: 1,
    version: 1,
    seo: input.seo || null,
    authorId: authorId || null,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (await isDatabaseReachable()) {
    try {
      const created = await prisma.page.create({
        data: {
          id: pageId,
          title: newPage.title,
          slug: newPage.slug,
          status: newPage.status,
          parentId: newPage.parentId,
          template: newPage.template,
          isSystem: newPage.isSystem,
          systemKey: newPage.systemKey,
          content: newPage.content as any,
          schemaVersion: 1,
          version: 1,
          authorId: authorId || undefined,
          seo: newPage.seo as any,
          createdAt: now,
          updatedAt: now,
        },
      });

      // Initial revision
      await createPageRevision(
        created.id,
        created.title,
        newPage.content,
        authorId,
        "MANUAL"
      );
    } catch (err: any) {
      return { success: false, error: err.message || "Sayfa oluşturulamadı" };
    }
  }

  const local = await getLocalPages();
  local.unshift(newPage);
  await saveLocalPages(local);

  return { success: true, page: newPage };
}

// ─── Update Page with Optimistic Locking (K-03) ────────────

export async function updatePage(
  id: string,
  input: {
    title?: string;
    slug?: string;
    status?: PageStatus;
    parentId?: string | null;
    template?: string;
    menuOrder?: number;
    content?: BlockNode[];
    seo?: any;
    scheduledAt?: string | null;
    publishedAt?: string | null;
    featuredImageId?: string | null;
    expectedVersion?: number; // Optimistic locking
  },
  userId?: string,
  revisionType: RevisionType = "MANUAL"
): Promise<{ success: boolean; page?: PageData; error?: string; conflict?: boolean }> {
  const current = await getPageById(id);
  if (!current) {
    return { success: false, error: "Sayfa bulunamadı." };
  }

  // Optimistic concurrency check (K-03: No silent overwrites)
  if (
    input.expectedVersion !== undefined &&
    input.expectedVersion !== current.version
  ) {
    return {
      success: false,
      conflict: true,
      error: `Bu sayfa başka bir yönetici tarafından güncellendi (Mevcut sürüm: v${current.version}, Sizin sürümünüz: v${input.expectedVersion}). Veri kaybını önlemek için sayfayı yenileyiniz.`,
      page: current,
    };
  }

  // System page trash & draft protection (L-10)
  if (current.isSystem) {
    if (input.status === "TRASH" || input.status === "DRAFT") {
      return { success: false, error: "Sistem sayfaları taslağa alınamaz veya çöpe atılamaz." };
    }
  }

  const targetSlug =
    input.slug !== undefined
      ? (input.slug.trim() === "" ? "" : slugifyTurkish(input.slug))
      : current.slug;

  // Slug check if changed
  if (targetSlug !== current.slug) {
    const slugCheck = await getPageBySlug(targetSlug);
    if (slugCheck && slugCheck.id !== id) {
      return {
        success: false,
        error:
          targetSlug === ""
            ? "Kök ('/') kalıcı bağlantısı başka bir sayfada kullanımda."
            : `"${targetSlug}" kalıcı bağlantısı başka bir sayfada kullanımda.`,
      };
    }

    // Register 301 redirect on slug change (PG-S-02)
    const oldPath = current.slug ? `/${current.slug}` : "/";
    const newPath = targetSlug ? `/${targetSlug}` : "/";
    if (oldPath !== newPath) {
      try {
        await registerPageRedirect(id, oldPath, newPath);
      } catch { }
    }
  }

  const now = new Date();
  const nextVersion = current.version + 1;

  const updatedPage: PageData = {
    ...current,
    title: input.title !== undefined ? input.title : current.title,
    slug: targetSlug,
    status: input.status !== undefined ? input.status : current.status,
    parentId: input.parentId !== undefined ? input.parentId : current.parentId,
    template: input.template !== undefined ? input.template : current.template,
    menuOrder: input.menuOrder !== undefined ? input.menuOrder : current.menuOrder,
    content: input.content !== undefined ? input.content : current.content,
    seo: input.seo !== undefined ? input.seo : current.seo,
    featuredImageId:
      input.featuredImageId !== undefined
        ? input.featuredImageId
        : current.featuredImageId,
    scheduledAt: input.scheduledAt !== undefined ? input.scheduledAt : current.scheduledAt,
    publishedAt:
      input.publishedAt !== undefined
        ? input.publishedAt
        : input.status === "PUBLISHED" && current.status !== "PUBLISHED"
          ? now.toISOString()
          : current.publishedAt,
    version: nextVersion,
    updatedAt: now.toISOString(),
  };

  if (await isDatabaseReachable()) {
    try {
      await prisma.page.update({
        where: { id },
        data: {
          title: updatedPage.title,
          slug: updatedPage.slug,
          status: updatedPage.status,
          parentId: updatedPage.parentId,
          template: updatedPage.template,
          menuOrder: updatedPage.menuOrder,
          content: updatedPage.content as any,
          seo: updatedPage.seo as any,
          featuredImageId: updatedPage.featuredImageId,
          scheduledAt: updatedPage.scheduledAt ? new Date(updatedPage.scheduledAt) : null,
          publishedAt: updatedPage.publishedAt ? new Date(updatedPage.publishedAt) : null,
          version: nextVersion,
          updatedAt: now,
        },
      });

      // Save revision if content or title changed
      if (input.content || input.title) {
        await createPageRevision(
          id,
          updatedPage.title,
          updatedPage.content,
          userId,
          revisionType
        );
      }
    } catch (err: any) {
      return { success: false, error: err.message || "Sayfa güncellenemedi" };
    }
  }

  const local = await getLocalPages();
  const idx = local.findIndex((p) => p.id === id);
  if (idx !== -1) {
    local[idx] = updatedPage;
  } else {
    local.push(updatedPage);
  }
  await saveLocalPages(local);

  return { success: true, page: updatedPage };
}

// ─── Trash & Delete Operations (PG-T) ─────────────────────

export async function trashPage(
  id: string,
  userId?: string
): Promise<{ success: boolean; error?: string }> {
  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };
  if (page.isSystem) return { success: false, error: "Sistem sayfaları çöpe atılamaz." };

  const now = new Date();
  if (await isDatabaseReachable()) {
    try {
      await prisma.page.update({
        where: { id },
        data: { status: "TRASH", trashedAt: now },
      });
      await releasePageLock(id, userId || "");
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const local = await getLocalPages();
  const p = local.find((item) => item.id === id);
  if (p) {
    p.status = "TRASH";
    p.trashedAt = now.toISOString();
    await saveLocalPages(local);
  }

  return { success: true };
}

export async function restorePageFromTrash(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };

  // Check if original slug is already taken by another active page
  const activeSlugOwner = await getPageBySlug(page.slug);
  let finalSlug = page.slug;
  if (activeSlugOwner && activeSlugOwner.id !== id && activeSlugOwner.status !== "TRASH") {
    finalSlug = `${page.slug}-geri-yuklenen-${Date.now().toString(36)}`;
  }

  if (await isDatabaseReachable()) {
    try {
      await prisma.page.update({
        where: { id },
        data: { status: "DRAFT", slug: finalSlug, trashedAt: null },
      });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const local = await getLocalPages();
  const p = local.find((item) => item.id === id);
  if (p) {
    p.status = "DRAFT";
    p.slug = finalSlug;
    p.trashedAt = null;
    await saveLocalPages(local);
  }

  return { success: true };
}

export async function permanentlyDeletePage(
  id: string,
  options?: { force?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const page = await getPageById(id);
  if (!page) return { success: false, error: "Sayfa bulunamadı." };
  if (page.isSystem && !options?.force) return { success: false, error: "Sistem sayfaları kalıcı olarak silinemez." };

  if (await isDatabaseReachable()) {
    try {
      await prisma.page.delete({ where: { id } });
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  const local = await getLocalPages();
  const filtered = local.filter((item) => item.id !== id);
  await saveLocalPages(filtered);

  return { success: true };
}

// ─── Clone Page (PG-L-08) ─────────────────────────────────

export async function clonePage(
  id: string,
  userId?: string
): Promise<{ success: boolean; page?: PageData; error?: string }> {
  const source = await getPageById(id);
  if (!source) return { success: false, error: "Kopyalanacak sayfa bulunamadı." };

  // Regenerate all block IDs in content tree
  const renewBlockIds = (nodes: BlockNode[]): BlockNode[] => {
    return nodes.map((node) => ({
      ...node,
      id: `blk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      children: node.children ? renewBlockIds(node.children) : undefined,
    }));
  };

  const clonedContent = renewBlockIds(source.content);
  const newTitle = `${source.title} (Kopya)`;
  let newSlug = `${source.slug}-kopya`;

  let counter = 2;
  while (await getPageBySlug(newSlug)) {
    newSlug = `${source.slug}-kopya-${counter++}`;
  }

  return createPage(
    {
      title: newTitle,
      slug: newSlug,
      template: source.template,
      parentId: source.parentId,
      content: clonedContent,
      status: "DRAFT",
      seo: source.seo ? { ...source.seo } : null,
    },
    userId
  );
}

// ─── Legacy Pages to Blocks Migration (PG-X-03, PG-O-01) ───

export async function migrateLegacyPagesToBlocks(): Promise<{ migratedCount: number; pages: string[] }> {
  const { DEFAULT_PAGES } = await import("@/lib/cms/pages");
  const { createNewBlock } = await import("@/lib/cms/registry");

  const migratedPages: string[] = [];

  for (const [key, legacy] of Object.entries(DEFAULT_PAGES)) {
    const existing = await getPageBySlug(legacy.slug);
    if (existing) continue;

    const blocks: BlockNode[] = [];

    // 1. Hero Block
    if (legacy.heroImageUrl || legacy.title) {
      const hero = createNewBlock("hero", {
        imageUrl: legacy.heroImageUrl,
        posterUrl: legacy.heroImageUrl,
        title: legacy.title,
        subtitle: legacy.subtitle,
        primaryButtonText: "Hemen Teklif Al",
        primaryButtonUrl: "/iletisim",
      });
      blocks.push(hero);
    }

    // 2. Heading Block
    if (legacy.badgeText || legacy.title) {
      const heading = createNewBlock("heading", {
        badgeText: legacy.badgeText,
        text: legacy.title,
        subtitle: legacy.subtitle,
        level: 2,
      });
      blocks.push(heading);
    }

    // 3. Text Block
    if (legacy.bodyHtml) {
      const text = createNewBlock("text", {
        html: `<p>${legacy.bodyHtml.replace(/\n\n/g, "</p><p>")}</p>`,
      });
      blocks.push(text);
    }

    // 4. Page Specific Blocks
    if (legacy.slug === "anasayfa") {
      blocks.push(createNewBlock("hall_cards", { displayMode: "all" }));
      blocks.push(createNewBlock("packages", { layout: "cards" }));
      blocks.push(createNewBlock("counters"));
      blocks.push(createNewBlock("reservation_form"));
      blocks.push(createNewBlock("faq"));
    } else if (legacy.slug === "salonlar") {
      blocks.push(createNewBlock("hall_cards", { displayMode: "all" }));
      blocks.push(createNewBlock("reservation_form"));
    } else if (legacy.slug === "paketler") {
      blocks.push(createNewBlock("packages", { layout: "cards" }));
      blocks.push(createNewBlock("reservation_form"));
    } else if (legacy.slug === "sss") {
      blocks.push(createNewBlock("faq"));
    } else if (legacy.slug === "iletisim") {
      blocks.push(createNewBlock("reservation_form"));
      blocks.push(createNewBlock("map"));
    }

    const isSystem = legacy.slug === "anasayfa" || legacy.slug === "iletisim";

    await createPage({
      title: legacy.title,
      slug: legacy.slug,
      status: "PUBLISHED",
      content: blocks,
      template: isSystem ? "home" : "default",
      seo: {
        title: legacy.seoTitle,
        description: legacy.seoDescription,
        ogImage: legacy.heroImageUrl,
      },
      isSystem,
      systemKey: isSystem ? legacy.slug : undefined,
    });

    migratedPages.push(legacy.slug);
  }

  return { migratedCount: migratedPages.length, pages: migratedPages };
}

// ─── Legacy Compat: PageData → DynamicPageContent field extraction ───────────
// Mevcut statik sayfa tasarımlarını bozmadan yeni CMS'den veri çekmek için.
// Her statik page.tsx bunu kullanarak title, subtitle, badgeText vb. alır.

export interface PageStaticFields {
  title: string;
  subtitle: string;
  badgeText: string;
  heroImageUrl: string;
  bodyHtml: string;
  seoTitle: string;
  seoDescription: string;
}

export function extractStaticFields(page: PageData): PageStaticFields {
  const blocks = page.content || [];

  // Hero bloğundan: title, subtitle, heroImageUrl
  const heroBlock = blocks.find((b) => b.type === "hero");
  // İlk heading bloğundan: badgeText, subtitle (eğer hero yoksa)
  const headingBlock = blocks.find((b) => b.type === "heading");
  // Text bloğundan: bodyHtml
  const textBlock = blocks.find((b) => b.type === "text");

  const title = page.title || "";
  const subtitle =
    heroBlock?.attrs?.subtitle ||
    headingBlock?.attrs?.subtitle ||
    "";
  const badgeText =
    headingBlock?.attrs?.badgeText ||
    heroBlock?.attrs?.badgeText ||
    "";
  const heroImageUrl =
    heroBlock?.attrs?.imageUrl ||
    heroBlock?.attrs?.posterUrl ||
    "";
  const bodyHtml = textBlock?.attrs?.html || "";
  const seoTitle = page.seo?.title || `${title} | Elmira Davet`;
  const seoDescription =
    page.seo?.description ||
    "Elmira Davet & Balo Salonları, lüks mimarisi ve zengin organizasyon menüleriyle en özel anlarınızı taçlandırıyor.";

  return { title, subtitle, badgeText, heroImageUrl, bodyHtml, seoTitle, seoDescription };
}

