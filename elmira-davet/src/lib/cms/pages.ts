import { getSafeSetting, setSafeSetting, isDatabaseReachable } from "@/lib/local-store";
import { prisma } from "@/lib/prisma";

export interface PageFeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface DynamicPageContent {
  slug: string; // e.g. "hakkimizda", "salonlar", "paketler", "sss", "iletisim", "kvkk"
  title: string;
  subtitle: string;
  badgeText: string;
  heroImageUrl: string;
  bodyHtml: string;
  features: PageFeatureItem[];
  seoTitle: string;
  seoDescription: string;
  isPublished: boolean;
  updatedAt: string;
}

export const DEFAULT_PAGES: Record<string, DynamicPageContent> = {
  anasayfa: {
    slug: "anasayfa",
    title: "Aşkınızın En Görkemli Sahnesi",
    subtitle: "Gaziosmanpaşa'da Lüks & Zarafet | 600 ve 300 Kişilik İki Farklı Konsept",
    badgeText: "ELMİRA DAVET & BALO",
    heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
    bodyHtml:
      "Hayatınızın en mutlu gününde Gaziosmanpaşa'nın en gözde davet salonunda masalsı bir atmosfer sizi bekliyor. Saray mimarisini andıran 600 kişilik Kristal Salonumuz ve doğayla iç içe 300 kişilik Kır Bahçemiz ile hayallerinizdeki düğünü gerçeğe dönüştürüyoruz.\n\nKişiye özel organizasyon planlaması, ses ve dijital ışık gösterileri, usta aşçılarımızın gurme ikramları ve profesyonel servis ekibimizle kusursuz bir gece vadediyoruz.",
    features: [
      {
        title: "600 Kişilik Kristal Salon",
        description: "Yüksek tavan, kolonsuz ferah mimari ve görkemli kristal avizeler.",
        icon: "Users",
      },
      {
        title: "300 Kişilik Kır Bahçesi",
        description: "Açık hava dans pisti ve peri masalı bahçe aydınlatmaları.",
        icon: "Trees",
      },
      {
        title: "Akustik Ses & Robot Işık",
        description: "Yankısız akustik düzen ve canlı orkestra sahnesi.",
        icon: "Music",
      },
      {
        title: "Ücretsiz Otopark & Vale",
        description: "Gaziosmanpaşa merkezde geniş otopark ve profesyonel vale hizmeti.",
        icon: "Car",
      },
    ],
    seoTitle: "Elmira Davet | Gaziosmanpaşa Düğün Salonu & Kır Bahçesi",
    seoDescription:
      "Gaziosmanpaşa'da 600 kişilik lüks Kristal Salon ve 300 kişilik Kır Bahçesi ile masalsı düğün, nişan ve kına organizasyonları.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  hakkimizda: {
    slug: "hakkimizda",
    title: "Zarafetin Gaziosmanpaşa'daki Adresi",
    subtitle: "Elmira Davet Salonu olarak, hayatınızın en mutlu gününü zarafet, konfor ve profesyonellikle buluşturuyoruz.",
    badgeText: "İstanbul - Gaziosmanpaşa",
    heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    bodyHtml:
      "Elmira Davet Salonu, Gaziosmanpaşa merkezde yer alan eşsiz konumu, 600 kişilik kapalı Kristal Salon'u ve 300 kişilik Kır Bahçesi ile yeni evlenen çiftlerimize unutulmaz bir davet deneyimi yaşatıyor.\n\nRakiplerimizden bizi ayıran en önemli fark; hazır şablonların ötesine geçerek her çiftimize özel konsept tasarımı, kişiye özel menü tadımları ve düğün gününde birebir eşlik eden profesyonel organizasyon ekibimizdir.",
    features: [
      {
        title: "Kristal Salon (600 Kişi)",
        description: "Geniş dans pisti, yüksek tavan mimarisi ve görkemli kristal avizeler ile lüks kapalı salon.",
        icon: "Users",
      },
      {
        title: "Kır Bahçesi (300 Kişi)",
        description: "Yemyeşil doğa manzarası, açık hava dans pisti ve peri masalı aydınlatmalarıyla romantik bahçe.",
        icon: "Trees",
      },
      {
        title: "Akustik Ses & Robotik Işık",
        description: "Yankısız ses mimarisi, dijital ışık şovları ve canlı orkestra sahnesi ile üst düzey eğlence.",
        icon: "Music",
      },
      {
        title: "Ücretsiz Otopark & Vale",
        description: "Gaziosmanpaşa merkezde geniş özel otopark alanı ve profesyonel vale hizmeti.",
        icon: "Car",
      },
      {
        title: "Özel Gelin & Damat Süiti",
        description: "Düğün öncesi dinlenebileceğiniz, konforlu ve geniş hazırlık odası.",
        icon: "HeartHandshake",
      },
      {
        title: "Gurme Menüler & İkramlar",
        description: "Usta aşçılarımızın hazırladığı sıcak yemekli, kokteyl veya açık büfe zengin lezzetler.",
        icon: "Sparkles",
      },
    ],
    seoTitle: "Hakkımızda | Elmira Davet Gaziosmanpaşa",
    seoDescription:
      "Elmira Davet Salonu - İstanbul Gaziosmanpaşa'da 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi ile unutulmaz düğünler.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  salonlar: {
    slug: "salonlar",
    title: "Davet Alanlarımız & Konseptlerimiz",
    subtitle: "Büyüleyici Kristal Salon ve Doğayla İç İçe Kır Bahçesi",
    badgeText: "Özel Mimari & Yüksek Tavan",
    heroImageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80",
    bodyHtml:
      "İki farklı konsept, aynı üstün kalite. İhtişamı ve saray zarafetini tercih edenler için 600 kişilik yüksek tavanlı Kristal Salonumuz; doğanın içinde açık hava ferahlığı arayanlar için 300 kişilik Kır Bahçemiz hizmetinizde.\n\nTüm alanlarımızda son teknoloji iklimlendirme sistemleri, jeneratör desteği ve engelli misafirlerimiz için tam erişilebilirlik sağlanmıştır.",
    features: [
      {
        title: "Görkemli Kristal Avizeler",
        description: "Salon boyunca ışıltı saçan özel tasarım avizeler ve ambiyans aydınlatması.",
      },
      {
        title: "Kolonsuz Geniş Dans Pisti",
        description: "Görüş açısını kapatmayan kolonsuz ferah salon planı.",
      },
      {
        title: "Romantik Kır Bahçesi",
        description: "Doğal çim zemin, yemyeşil peyzaj ve ağaç altı kokteyl alanı.",
      },
      {
        title: "VIP Sanatçı & Gelin Odaları",
        description: "Özel lavabo ve makyaj aynalı klimalı hazırlık süitleri.",
      },
    ],
    seoTitle: "Salonlarımız | Kristal Salon & Kır Bahçesi | Elmira Davet",
    seoDescription:
      "Gaziosmanpaşa'da 600 kişilik lüks kapalı düğün salonu ve 300 kişilik romantik kır bahçesi alanlarımız.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  paketler: {
    slug: "paketler",
    title: "Düğün & Davet Paketlerimiz",
    subtitle: "Her bütçeye ve zevke uygun, şeffaf içerikli düğün ve davet paketleri",
    badgeText: "Gurme Menüler & Şeffaf Fiyatlandırma",
    heroImageUrl: "https://images.unsplash.com/photo-1544077960-604201fe74bc?w=1200&q=80",
    bodyHtml:
      "Hayalinizdeki organizasyon için sürpriz ek masraflar olmadan eksiksiz çözümler sunuyoruz. Yemekli menülerimizden kokteyl konseptine, kına paketlerinden özel kutlamalara kadar her şey dahil hizmet anlayışıyla çalışıyoruz.\n\nÖn tadım imkanı ile menünüzü düğün öncesi deneyimleyebilir ve dilediğiniz değişiklikleri yapabilirsiniz.",
    features: [
      {
        title: "Zengin Yemekli Menüler",
        description: "Kırmızı veya beyaz et seçenekleri, sıcak mezeler ve özel pasta sunumu.",
      },
      {
        title: "Kına & Bekarlığa Veda",
        description: "Bindallı, taht, dans ekibi ve geleneksel kına seremonisi dahil.",
      },
      {
        title: "Fotoğraf & Video Çekimi",
        description: "Tüm gece kesintisiz HD video çekimi, albüm ve drone görüntüleri.",
      },
      {
        title: "Canlı Müzik & DJ Performansı",
        description: "Geniş repertuarlı profesyonel orkestra veya konsept DJ performansı.",
      },
    ],
    seoTitle: "Düğün Paketleri ve Menüler | Elmira Davet Fiyatları",
    seoDescription:
      "Gaziosmanpaşa düğün paketi fiyatları, yemekli ve kokteyl menü seçenekleri, kına gecesi paketleri.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  etkinlikler: {
    slug: "etkinlikler",
    title: "Etkinlik & Organizasyon Türleri",
    subtitle: "Düğün, nişan, kına gecesi, sünnet ve kurumsal galalar için eksiksiz hizmet",
    badgeText: "Tüm Özel Günleriniz İçin",
    heroImageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80",
    bodyHtml:
      "Yalnızca düğün değil; hayatınızın dönüm noktası olan nişan, kına, sünnet ve kurumsal etkinliklerinizde de profesyonel kadromuzla yanınızdayız.\n\nHer organizasyon türü için alanında uzman etkinlik sorumlumuz gece boyunca yanınızda olarak program akışını yönetir.",
    features: [
      {
        title: "Düğün & Balo Organizasyonu",
        description: "600 kişiye kadar görkemli düğün ve yemekli balo davetleri.",
      },
      {
        title: "Geleneksel Kına Gecesi",
        description: "Kına tahtı, kaftanlar, nedime dans gösterisi ve özel seremoniler.",
      },
      {
        title: "Nişan & Söz Törenleri",
        description: "Şık arka plan tag süslemesi, pasta kesimi ve aile içi samimi davetler.",
      },
      {
        title: "Kurumsal Davet & Lansman",
        description: "Şirket yemekleri, ödül törenleri, bayi toplantıları ve lansmanlar.",
      },
    ],
    seoTitle: "Etkinlikler & Organizasyonlar | Elmira Davet Gaziosmanpaşa",
    seoDescription:
      "Düğün, kına, nişan, sünnet düğünü ve kurumsal etkinlik organizasyonları.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  galeri: {
    slug: "galeri",
    title: "Fotoğraf & Video Galerisi",
    subtitle: "Işıltılı anlardan ve mutlu çiftlerimizin anılarından seçilen özel kareler",
    badgeText: "Görsel Yolculuk",
    heroImageUrl: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&q=80",
    bodyHtml:
      "Salonlarımızın mimari detaylarını, ışıklandırmasını, masa düzenlerini ve çiftlerimizin en mutlu anlarını galerimizden inceleyebilirsiniz.",
    features: [
      {
        title: "Kristal Salon Çekimleri",
        description: "Saray konseptli kapalı salonumuzun gece ve gündüz çekimleri.",
      },
      {
        title: "Kır Bahçesi Çekimleri",
        description: "Yeşillikler içindeki bahçemizin romantik ışıklandırma detayları.",
      },
      {
        title: "Masa & Süsleme Konseptleri",
        description: "Şamdanlar, supla takımları, canlı çiçek aranjmanları.",
      },
    ],
    seoTitle: "Galeri | Düğün ve Salon Fotoğrafları | Elmira Davet",
    seoDescription:
      "Elmira Davet Salonu'nun güncel fotoğraf ve videoları, salon dekorasyonları.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  referanslar: {
    slug: "referanslar",
    title: "Mutlu Çiftlerimiz & Yorumlar",
    subtitle: "Elmira Davet Salonu'nda dünyaevine giren misafirlerimizin gerçek deneyimleri",
    badgeText: "%99.8 Memnuniyet Oranı",
    heroImageUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80",
    bodyHtml:
      "Binlerce çiftimizin ve ailemizin güveni bizim en büyük referansımızdır. Organizasyon sonunda yüzlerdeki tebessüm ve aldığımız teşekkür mesajları, kalitemizin en somut kanıtıdır.",
    features: [
      {
        title: "Gerçek Çift Değerlendirmeleri",
        description: "Google ve sosyal medya üzerinden paylaşılan onaylı yorumlar.",
      },
      {
        title: "Yüksek Tavsiye Oranı",
        description: "Misafirlerimizin %98'i salonumuzu yakınlarına tavsiye etmektedir.",
      },
    ],
    seoTitle: "Misafir Yorumları & Referanslar | Elmira Davet",
    seoDescription:
      "Elmira Davet Salonu Gaziosmanpaşa'da düğün yapan çiftlerin samimi yorum ve değerlendirmeleri.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  sss: {
    slug: "sss",
    title: "Sıkça Sorulan Sorular",
    subtitle: "Düğün ve rezervasyon sürecinizle ilgili aklınıza takılan tüm soruların yanıtları",
    badgeText: "Merak Edilenler",
    heroImageUrl: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
    bodyHtml:
      "Rezervasyon süreci, ödeme planı, menü tadımı, otopark ve müzik gibi en çok merak edilen soruları sizler için derledik. Özel sorularınız için iletişim formundan veya WhatsApp hattımızdan bize her zaman ulaşabilirsiniz.",
    features: [
      {
        title: "Kapora ve Rezervasyon",
        description: "Rezervasyon esnasında makul bir kapora alınır, kalan tutar düğün haftasına kadar taksitlendirilebilir.",
      },
      {
        title: "Menü Değişikliği & Tadım",
        description: "Düğünden 1 ay önce davet sahibi olarak menü tadımına katılabilir ve ikramları belirleyebilirsiniz.",
      },
      {
        title: "Otopark & Ulaşım İmkanı",
        description: "Merkezi konumumuzda özel otoparkımız ve vale hizmetimiz tüm davetlilerimize ücretsizdir.",
      },
      {
        title: "Dışarıdan Fotoğrafçı & Müzik",
        description: "Kendi profesyonel kadromuz haricinde özel anlaştığınız ekiplerle de uyum içinde çalışabiliyoruz.",
      },
    ],
    seoTitle: "Sıkça Sorulan Sorular | Elmira Davet",
    seoDescription:
      "Düğün salonu kiralama, kapora, ikramlar ve rezervasyon hakkında sıkça sorulan sorular.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  iletisim: {
    slug: "iletisim",
    title: "İletişim & Randevu",
    subtitle: "600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi alanlarımızı yerinde görmek ve kahvemizi içmek için hemen randevu alın",
    badgeText: "İstanbul - Gaziosmanpaşa",
    heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    bodyHtml:
      "Gaziosmanpaşa merkezde yer alan salonumuza metro, tramvay ve toplu taşıma araçlarıyla çok kolay ulaşabilirsiniz. Özel aracınız için vale ve geniş otopark hizmetimiz bulunmaktadır.\n\nSizleri ağırlamaktan ve hayalinizdeki daveti birlikte planlamaktan mutluluk duyacağız.",
    features: [
      {
        title: "Merkezi Konum",
        description: "Gaziosmanpaşa Meydanı'na ve ana ulaşım akslarına birkaç dakika mesafede.",
      },
      {
        title: "Ücretsiz Vale & Otopark",
        description: "Davetlileriniz için park yeri arama derdine son.",
      },
      {
        title: "7/24 WhatsApp Desteği",
        description: "Dilediğiniz an canlı destek hattımızdan müsaitlik ve fiyat sorabilirsiniz.",
      },
    ],
    seoTitle: "İletişim & Rezervasyon | Elmira Davet Gaziosmanpaşa",
    seoDescription:
      "Elmira Davet Salonu iletişim, telefon numarası, adres, kroki ve online randevu formu.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },

  kvkk: {
    slug: "kvkk",
    title: "KVKK & Gizlilik Politikası",
    subtitle: "6698 Sayılı Kişisel Verilerin Korunması Kanunu Kapsamında Aydınlatma Metni",
    badgeText: "Yasal Bilgilendirme",
    heroImageUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&q=80",
    bodyHtml:
      "Elmira Davet Salonu olarak kişisel verilerinizin güvenliğine büyük önem veriyoruz. Web sitemiz veya Meta reklamlarımız üzerinden paylaştığınız ad, soyad, telefon ve e-posta bilgileriniz yalnızca randevu talebinizin karşılanması, teklif sunulması ve onayınız halinde kampanya bildirimleri amacıyla işlenmektedir.\n\nVerileriniz üçüncü şahıslara veya kurumlara ticari amaçlarla asla devredilmez ve yasal saklama süreleri hitamında güvenli şekilde imha edilir.",
    features: [
      {
        title: "Veri Sorumlusu",
        description: "Elmira Davet Salonu İşletmeciliği (Gaziosmanpaşa / İstanbul)",
      },
      {
        title: "İşleme Amaçları",
        description: "Randevu teyidi, teklif oluşturma ve sözleşme süreçleri.",
      },
      {
        title: "İmha Politikası",
        description: "Yasal saklama süresi sonunda veya talebiniz üzerine anında silme/anonimleştirme.",
      },
    ],
    seoTitle: "KVKK Aydınlatma Metni | Elmira Davet",
    seoDescription:
      "6698 sayılı KVKK kapsamında kişisel verilerin korunması ve gizlilik aydınlatma metni.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  },
};

/**
 * Returns all dynamic pages from local storage/Prisma merged with defaults
 */
export async function getAllPages(): Promise<DynamicPageContent[]> {
  const pagesMap: Record<string, DynamicPageContent> = { ...DEFAULT_PAGES };

  try {
    const raw = await getSafeSetting("cms_dynamic_pages");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([slug, content]) => {
          if (content && typeof content === "object") {
            pagesMap[slug] = {
              ...pagesMap[slug],
              ...(content as DynamicPageContent),
            };
          }
        });
      }
    }
  } catch (err) {
    console.error("Error reading cms_dynamic_pages:", err);
  }

  // Also check database siteSetting if online
  if (await isDatabaseReachable()) {
    try {
      const dbSetting = await prisma.siteSetting.findUnique({
        where: { key: "cms_dynamic_pages" },
      });
      if (dbSetting?.value) {
        const parsed = JSON.parse(dbSetting.value);
        if (typeof parsed === "object" && parsed !== null) {
          Object.entries(parsed).forEach(([slug, content]) => {
            if (content && typeof content === "object") {
              pagesMap[slug] = {
                ...pagesMap[slug],
                ...(content as DynamicPageContent),
              };
            }
          });
        }
      }
    } catch {}
  }

  return Object.values(pagesMap);
}

/**
 * Gets content for a single page by its slug
 */
export async function getPageContent(slug: string): Promise<DynamicPageContent> {
  const fallback = DEFAULT_PAGES[slug] || {
    slug,
    title: slug.charAt(0).toUpperCase() + slug.slice(1),
    subtitle: "Elmira Davet Gaziosmanpaşa",
    badgeText: "Elmira Davet",
    heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
    bodyHtml: "Bu sayfanın içeriği henüz eklenmedi.",
    features: [],
    seoTitle: `${slug} | Elmira Davet`,
    seoDescription: "Elmira Davet Gaziosmanpaşa davet ve balo salonu.",
    isPublished: true,
    updatedAt: new Date().toISOString(),
  };

  try {
    const all = await getAllPages();
    const found = all.find((p) => p.slug === slug);
    return found || fallback;
  } catch {
    return fallback;
  }
}

/**
 * Saves or updates a page's content
 */
export async function savePageContent(page: DynamicPageContent): Promise<void> {
  const allPages = await getAllPages();
  const pagesMap: Record<string, DynamicPageContent> = {};

  allPages.forEach((p) => {
    pagesMap[p.slug] = p;
  });

  pagesMap[page.slug] = {
    ...page,
    updatedAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(pagesMap);
  await setSafeSetting("cms_dynamic_pages", serialized);

  if (await isDatabaseReachable()) {
    try {
      await prisma.siteSetting.upsert({
        where: { key: "cms_dynamic_pages" },
        update: { value: serialized },
        create: { key: "cms_dynamic_pages", value: serialized },
      });
    } catch {}
  }
}

/**
 * Resets a page's content back to original default settings
 */
export async function resetPageContent(slug: string): Promise<void> {
  const allPages = await getAllPages();
  const pagesMap: Record<string, DynamicPageContent> = {};

  allPages.forEach((p) => {
    pagesMap[p.slug] = p;
  });

  if (DEFAULT_PAGES[slug]) {
    pagesMap[slug] = {
      ...DEFAULT_PAGES[slug],
      updatedAt: new Date().toISOString(),
    };
  } else {
    delete pagesMap[slug];
  }

  const serialized = JSON.stringify(pagesMap);
  await setSafeSetting("cms_dynamic_pages", serialized);

  if (await isDatabaseReachable()) {
    try {
      await prisma.siteSetting.upsert({
        where: { key: "cms_dynamic_pages" },
        update: { value: serialized },
        create: { key: "cms_dynamic_pages", value: serialized },
      });
    } catch {}
  }
}

