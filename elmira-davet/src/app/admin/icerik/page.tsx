import { getSafeSetting } from "@/lib/local-store";
import {
  mockHalls,
  mockPackages,
  mockEvents,
  mockFaqs,
  mockTestimonials,
} from "@/lib/mock-data";
import { ContentManager } from "./content-manager";

export const metadata = {
  title: "İçerik Yönetimi | Elmira Davet Yönetim Paneli",
};

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

export default async function AdminIcerikPage() {
  // 1. Salonlar
  let halls = mockHalls;
  try {
    const raw = await getSafeSetting("admin_custom_halls");
    if (raw) halls = JSON.parse(raw);
  } catch {}

  // 2. Paketler
  let packages = mockPackages;
  try {
    const raw = await getSafeSetting("admin_custom_packages");
    if (raw) packages = JSON.parse(raw);
  } catch {}

  // 3. Menüler
  let menus = DEFAULT_MENUS;
  try {
    const raw = await getSafeSetting("admin_custom_menus");
    if (raw) menus = JSON.parse(raw);
  } catch {}

  // 4. Etkinlik Türleri
  let events = mockEvents;
  try {
    const raw = await getSafeSetting("admin_custom_events");
    if (raw) events = JSON.parse(raw);
  } catch {}

  // 5. Yorumlar
  let testimonials = mockTestimonials;
  try {
    const raw = await getSafeSetting("admin_custom_testimonials");
    if (raw) testimonials = JSON.parse(raw);
  } catch {}

  // 6. SSS
  let faqs = mockFaqs;
  try {
    const raw = await getSafeSetting("admin_custom_faqs");
    if (raw) faqs = JSON.parse(raw);
  } catch {}

  // 7. Sayaçlar (Rakamlarla Elmira)
  const DEFAULT_STATS = [
    { id: "stat-1", value: 1200, prefix: "", suffix: "+", label: "Mutlu Düğün & Davet", sublabel: "Gaziosmanpaşa'da unutulmaz tecrübe" },
    { id: "stat-2", value: 600, prefix: "", suffix: " Kişi", label: "Kristal Salon", sublabel: "Lüks kapalı davet ve balo salonu" },
    { id: "stat-3", value: 300, prefix: "", suffix: " Kişi", label: "Kır Bahçesi", sublabel: "Yıldızlar altında doğal açık hava" },
    { id: "stat-4", value: 99, prefix: "%", suffix: "", label: "Misafir Memnuniyeti", sublabel: "Doğrulanmış çift ve aile yorumları" },
  ];
  let stats = DEFAULT_STATS;
  try {
    const raw = await getSafeSetting("admin_custom_stats");
    if (raw) stats = JSON.parse(raw);
  } catch {}

  // 8. Ayrıcalıklar & Avantajlar (about-heading / Neden Elmira Davet?)
  let rawAbout: string | null = null;
  try {
    rawAbout = await getSafeSetting("aboutText");
  } catch {}

  const DEFAULT_FEATURES = {
    badge: "Gaziosmanpaşa Merkezde Prestijli Konum",
    title: "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz",
    description:
      rawAbout ||
      "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz. 600 kişilik lüks Kristal Salonumuz ve 300 kişilik büyüleyici Kır Bahçemiz ile aşkınızın en güzel hikayesine ev sahipliği yapıyoruz.",
    buttonText: "Hakkımızda Daha Fazla Bilgi",
    buttonLink: "/hakkimizda",
    items: [
      { id: "feat-1", title: "Kristal Avizeler", description: "6 metre tavan yüksekliği ve görkemli ışık düzeni", icon: "gem" },
      { id: "feat-2", title: "Ücretsiz Otopark & Vale", description: "Misafirleriniz için stressiz ve konforlu karşılama", icon: "car" },
      { id: "feat-3", title: "Akustik Mimari & Sahne", description: "Yankısız kristal berraklığında müzik ve canlı orkestra", icon: "music" },
      { id: "feat-4", title: "Gelin & Damat Süiti", description: "Geniş dinlenme, makyaj ve özel ikram odası", icon: "heart" },
    ],
    showcase: {
      imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
      locationBadge: "İstanbul - Gaziosmanpaşa",
      title: "Unutulmaz Düğünler, Kusursuz Masallar",
      buttonText: "Galeri",
      buttonLink: "/galeri",
    },
  };
  let features = DEFAULT_FEATURES;
  try {
    const raw = await getSafeSetting("admin_custom_features");
    if (raw) {
      const parsed = JSON.parse(raw);
      features = { ...DEFAULT_FEATURES, ...parsed };
      if (!features.description && rawAbout) {
        features.description = rawAbout;
      }
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">İçerik Yönetimi</h1>
        <p className="text-text-secondary text-sm">
          Salonlar, sayaçlar, ayrıcalıklar, paketler, menüler, etkinlik türleri, yorumlar ve SSS alanlarını tek panelden yönetin.
        </p>
      </div>

      <ContentManager
        initialHalls={halls}
        initialPackages={packages}
        initialMenus={menus}
        initialEvents={events}
        initialFaqs={faqs}
        initialTestimonials={testimonials}
        initialStats={stats}
        initialFeatures={features}
      />
    </div>
  );
}
