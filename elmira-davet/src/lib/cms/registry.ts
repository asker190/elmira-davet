import type {
  BlockNode,
  BlockType,
  BlockMotionConfig,
  BlockLayoutConfig,
  BlockVisibilityConfig,
} from "./types";

export interface BlockDefinition {
  type: BlockType;
  name: string;
  category: "text" | "media" | "layout" | "dynamic" | "advanced";
  description: string;
  icon: string;
  defaultAttrs: Record<string, any>;
  defaultMotion: BlockMotionConfig;
  defaultLayout: BlockLayoutConfig;
  defaultVisibility: BlockVisibilityConfig;
  supportsChildren?: boolean;
  maxNestingLevel?: number;
  adminOnly?: boolean;
}

export const BLOCK_CATEGORIES = [
  { id: "all", name: "Tümü" },
  { id: "text", name: "Metin & Başlık" },
  { id: "media", name: "Medya & Görsel" },
  { id: "layout", name: "Düzen & Tasarım" },
  { id: "dynamic", name: "Dinamik İçerik" },
  { id: "advanced", name: "Gelişmiş" },
] as const;

export const BLOCK_REGISTRY: Record<BlockType, BlockDefinition> = {
  hero: {
    type: "hero",
    name: "Hero (Ana Karşılama)",
    category: "layout",
    description: "Büyük arka plan görseli/videosu, başlık, alt başlık ve 2 çağrı butonu.",
    icon: "LayoutTemplate",
    defaultAttrs: {
      mediaType: "image",
      imageUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
      posterUrl: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80",
      videoUrl: "",
      title: "Hayallerinizdeki Düğün İçin Kusursuz Başlangıç",
      subtitle: "Görkemli salonlarımız, zengin menülerimiz ve profesyonel ekibimizle en özel gününüzü unutulmaz kılıyoruz.",
      primaryButtonText: "Hemen Teklif Al",
      primaryButtonUrl: "/iletisim",
      secondaryButtonText: "Salonları Keşfet",
      secondaryButtonUrl: "/salonlar",
      overlayOpacity: 55,
      parallax: true,
      minHeight: "85vh",
    },
    defaultMotion: {
      animation: "fade",
      duration: 1.0,
      delay: 0.1,
      trigger: "load",
      once: true,
      parallaxSpeed: 0.3,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "none",
    },
    defaultVisibility: {},
  },

  heading: {
    type: "heading",
    name: "Başlık",
    category: "text",
    description: "H1'den H4'e kadar semantik ve estetik başlık bloğu.",
    icon: "Heading",
    defaultAttrs: {
      level: 2,
      text: "Bölüm Başlığı",
      subtitle: "Bölüm hakkında kısa açıklayıcı alt metin.",
      align: "center",
      badgeText: "ELMİRA DAVET",
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "small",
    },
    defaultVisibility: {},
  },

  text: {
    type: "text",
    name: "Zengin Metin (Paragraf)",
    category: "text",
    description: "Biçimlendirilmiş paragraflar, listeler ve bağlantılar içeren zengin metin.",
    icon: "FileText",
    defaultAttrs: {
      html: "<p>Elmira Davet & Balo Salonları, yüksek tavanlı modern mimarisi, son teknoloji ses-ışık sistemleri ve ödüllü şefleriyle unutulmaz organizasyonlara ev sahipliği yapar.</p>",
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.6,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "left",
      contentWidth: "normal",
      paddingY: "small",
    },
    defaultVisibility: {},
  },

  image: {
    type: "image",
    name: "Görsel",
    category: "media",
    description: "En-boy oranı, yakınlaşma efekti ve alt metin uyarıları içeren görsel bloğu.",
    icon: "Image",
    defaultAttrs: {
      url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      alt: "Elmira Davet Salonu Görünümü",
      caption: "",
      aspectRatio: "16:9",
      zoomOnHover: true,
      focalPoint: "center",
    },
    defaultMotion: {
      animation: "zoom",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
      parallaxSpeed: 0.1,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "medium",
    },
    defaultVisibility: {},
  },

  gallery: {
    type: "gallery",
    name: "Galeri",
    category: "dynamic",
    description: "Dinamik galeri kategorilerinden çekilen filtreli masonry veya grid fotoğraf galerisi.",
    icon: "Images",
    defaultAttrs: {
      categoryId: "all",
      layout: "masonry",
      columns: 3,
      enableLightbox: true,
      maxItems: 12,
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
      stagger: 0.1,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
    },
    defaultVisibility: {},
  },

  hall_cards: {
    type: "hall_cards",
    name: "Salon Kartları",
    category: "dynamic",
    description: "Sistemde tanımlı davet salonlarını otomatik çeken ve listeleyen kartlar.",
    icon: "Building2",
    defaultAttrs: {
      displayMode: "all",
      selectedHallIds: [],
      layout: "grid",
      columns: 2,
      showCapacity: true,
      showFeatures: true,
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
      stagger: 0.15,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
    },
    defaultVisibility: {},
  },

  packages: {
    type: "packages",
    name: "Paketler & Menüler",
    category: "dynamic",
    description: "Düğün, nişan ve kına organizasyon paketleri ile zengin menü içeriklerini gösterir.",
    icon: "PackageCheck",
    defaultAttrs: {
      displayMode: "all",
      selectedPackageIds: [],
      layout: "cards",
      showPrice: false,
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
      stagger: 0.15,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
    },
    defaultVisibility: {},
  },

  counters: {
    type: "counters",
    name: "Sayaçlar (İstatistikler)",
    category: "layout",
    description: "Mutlu çift sayısı, salon kapasitesi, organizasyon tecrübesi gibi canlı artan sayaçlar.",
    icon: "Clock",
    defaultAttrs: {
      items: [
        { label: "Mutlu Çift", value: 1250, suffix: "+" },
        { label: "Kişilik Kapasite", value: 1500, suffix: "" },
        { label: "Yıllık Tecrübe", value: 14, suffix: " Yıl" },
        { label: "Profesyonel Ekip", value: 45, suffix: "+" },
      ],
      columns: 4,
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
      background: {
        type: "color",
        value: "rgba(255,255,255,0.02)",
      },
    },
    defaultVisibility: {},
  },

  testimonials: {
    type: "testimonials",
    name: "Müşteri Yorumları",
    category: "dynamic",
    description: "Yönetim panelindeki onaylanmış müşteri değerlendirmelerini slider veya grid olarak sunar.",
    icon: "Quote",
    defaultAttrs: {
      displayMode: "all",
      selectedIds: [],
      layout: "slider",
      showRating: true,
      autoPlay: true,
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
    },
    defaultVisibility: {},
  },

  faq: {
    type: "faq",
    name: "Sıkça Sorulan Sorular (SSS)",
    category: "dynamic",
    description: "Açılır-kapanır akordeon SSS bloğu. Sayfada otomatik FAQPage Schema.org verisi üretir.",
    icon: "HelpCircle",
    defaultAttrs: {
      displayMode: "all",
      selectedFaqIds: [],
      items: [
        {
          question: "Rezervasyonumu ne kadar önceden yapmalıyım?",
          answer: "Özellikle bahar ve yaz aylarındaki yoğunluk sebebiyle düğün tarihinizden en az 6-9 ay öncesinde rezervasyon yaptırmanızı öneririz.",
        },
        {
          question: "Menü tadımı imkânı sunuyor musunuz?",
          answer: "Evet, sözleşme sonrası düğün gününden önce şeflerimiz eşliğinde menü tadım oturumu gerçekleştirmekteyiz.",
        },
        {
          question: "Otopark ve vale hizmetiniz var mı?",
          answer: "Tesisimizde 250 araçlık özel otoparkımız ve profesyonel vale hizmetimiz misafirlerimize ücretsiz olarak sunulmaktadır.",
        },
      ],
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "narrow",
      paddingY: "large",
    },
    defaultVisibility: {},
  },

  reservation_form: {
    type: "reservation_form",
    name: "Rezervasyon / Teklif Formu",
    category: "dynamic",
    description: "KVKK onaylı, talepler (CRM) modülü ile tam senkron teklif alma formu.",
    icon: "CalendarCheck",
    defaultAttrs: {
      title: "Hemen Fiyat Teklifi Alın",
      subtitle: "Tarihinizi seçin, uzman danışmanlarımız 1 saat içinde size özel teklifinizi hazırlasın.",
      showHallSelect: true,
      showGuestCount: true,
      showEventType: true,
      showTimeSlot: true,
      successMessage: "Talebiniz başarıyla alındı. Organizasyon danışmanımız en kısa sürede sizinle iletişime geçecektir.",
      kvkkText: "Kişisel verilerimin KVKK aydınlatma metni kapsamında işlenmesini ve teklif amacıyla benimle iletişime geçilmesini onaylıyorum.",
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "narrow",
      paddingY: "large",
      background: {
        type: "color",
        value: "rgba(255,255,255,0.03)",
      },
    },
    defaultVisibility: {},
  },

  map: {
    type: "map",
    name: "Harita & Konum",
    category: "media",
    description: "Google Maps entegrasyonu ve tesis ulaşım bilgileri.",
    icon: "MapPin",
    defaultAttrs: {
      title: "Kolay Ulaşım, Merkezi Konum",
      address: "Atatürk Mah. Davet Cad. No:123 Kadıköy / İstanbul",
      googleMapsEmbedUrl: "https://maps.google.com/maps?q=Istanbul&t=&z=14&ie=UTF8&iwloc=&output=embed",
      height: 420,
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "medium",
    },
    defaultVisibility: {},
  },

  columns: {
    type: "columns",
    name: "Sütunlar (2-4)",
    category: "layout",
    description: "Masaüstünde yan yana, mobilde alt alta dizilen çoklu sütun konteyneri (en fazla 2 seviye iç içe).",
    icon: "Columns",
    supportsChildren: true,
    maxNestingLevel: 2,
    defaultAttrs: {
      columnsCount: 2,
      gap: "medium",
      stackOnMobile: true,
      verticalAlign: "stretch",
    },
    defaultMotion: {
      animation: "none",
      duration: 0.6,
      delay: 0,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "medium",
    },
    defaultVisibility: {},
  },

  button_cta: {
    type: "button_cta",
    name: "Buton / CTA Bandı",
    category: "layout",
    description: "Öne çıkan çağrı bandı, iç sayfa bağlantısı, telefon veya WhatsApp yönlendirmesi.",
    icon: "MousePointerClick",
    defaultAttrs: {
      text: "Özel Fiyat Teklifinizi Hemen Alın",
      buttonText: "Bize Ulaşın",
      buttonUrl: "/iletisim",
      targetPageId: "",
      openInNewTab: false,
      style: "primary",
      size: "large",
      iconName: "Calendar",
    },
    defaultMotion: {
      animation: "slide-up",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "large",
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, rgba(201,160,80,0.15) 0%, rgba(20,20,25,0.95) 100%)",
      },
    },
    defaultVisibility: {},
  },

  video: {
    type: "video",
    name: "Video",
    category: "media",
    description: "YouTube, Vimeo veya doğrudan MP4 video oynatıcı (otomatik oynatma sessiz arka planla sınırlıdır).",
    icon: "Video",
    defaultAttrs: {
      source: "youtube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      posterUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
      aspectRatio: "16:9",
      autoplay: false,
      muted: true,
      loop: false,
      controls: true,
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.8,
      delay: 0.1,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "medium",
    },
    defaultVisibility: {},
  },

  spacer_divider: {
    type: "spacer_divider",
    name: "Boşluk & Çizgi",
    category: "layout",
    description: "Bölümler arası nefes alma alanı, altın sarısı şık ayırıcı çizgi.",
    icon: "Minus",
    defaultAttrs: {
      height: 48,
      showDivider: true,
      dividerStyle: "gold_accent",
    },
    defaultMotion: {
      animation: "none",
      duration: 0.5,
      delay: 0,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "none",
    },
    defaultVisibility: {},
  },

  saved_block: {
    type: "saved_block",
    name: "Kayıtlı Bölüm (Şablon)",
    category: "advanced",
    description: "Daha önce kaydedilmiş ortak bir blok veya şablonu çağırır (bağlı veya bağımsız kopya).",
    icon: "BookmarkCheck",
    defaultAttrs: {
      savedBlockId: "",
      name: "Kayıtlı Bölüm",
      isLinked: true,
    },
    defaultMotion: {
      animation: "none",
      duration: 0.5,
      delay: 0,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "small",
    },
    defaultVisibility: {},
  },

  custom_html: {
    type: "custom_html",
    name: "Özel HTML (Sadece Admin)",
    category: "advanced",
    description: "Yalnızca ADMIN kullanıcıların ekleyebildiği, sunucuda XSS korumalı özel HTML kodu.",
    icon: "Code",
    adminOnly: true,
    defaultAttrs: {
      html: "<div class=\"p-6 border border-gold/30 rounded-xl text-center\">\n  <h4 class=\"text-gold font-bold\">Özel İçerik Kutusu</h4>\n  <p class=\"text-sm text-gray-300\">Buraya özel HTML kodunuzu ekleyebilirsiniz.</p>\n</div>",
    },
    defaultMotion: {
      animation: "fade",
      duration: 0.6,
      delay: 0,
      trigger: "viewport",
      once: true,
    },
    defaultLayout: {
      align: "center",
      contentWidth: "normal",
      paddingY: "small",
    },
    defaultVisibility: {},
  },
};

/**
 * Creates a new block instance with a UUID and default configuration.
 */
export function createNewBlock(type: BlockType, partialAttrs: Record<string, any> = {}): BlockNode {
  const def = BLOCK_REGISTRY[type];
  if (!def) {
    throw new Error(`Bilinmeyen blok türü: ${type}`);
  }

  const id = `blk_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    type,
    schemaVersion: 1,
    attrs: {
      ...JSON.parse(JSON.stringify(def.defaultAttrs)),
      ...partialAttrs,
    },
    motion: { ...def.defaultMotion },
    layout: { ...def.defaultLayout },
    visibility: { ...def.defaultVisibility },
    children: def.supportsChildren ? [] : undefined,
  };
}

/**
 * Searches blocks in the registry by query (case & Turkish character insensitive).
 */
export function searchBlockRegistry(query: string, category: string = "all", isAdmin: boolean = true): BlockDefinition[] {
  const normalize = (s: string) =>
    s
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const q = normalize(query);

  return Object.values(BLOCK_REGISTRY).filter((def) => {
    // Admin check
    if (def.adminOnly && !isAdmin) return false;

    // Category filter
    if (category !== "all" && def.category !== category) return false;

    if (!q) return true;

    const nameMatch = normalize(def.name).includes(q);
    const descMatch = normalize(def.description).includes(q);
    const typeMatch = normalize(def.type).includes(q);

    return nameMatch || descMatch || typeMatch;
  });
}
