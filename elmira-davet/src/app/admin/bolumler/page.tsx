import { prisma } from "@/lib/prisma";
import { SectionsClient, PageSectionItem } from "./sections-client";

export const metadata = {
  title: "Sayfa Bölümleri | Elmira Davet Yönetim Paneli",
};

const DEFAULT_SECTIONS: PageSectionItem[] = [
  {
    id: "hero",
    name: "Hero Video & Giriş Sahnesi",
    badge: "HERO",
    title: "Aşkınızın En Görkemli Sahnesi",
    subtitle: "Gaziosmanpaşa'da Lüks & Zarafet | 600 ve 300 Kişilik İki Farklı Konsept",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
    isEnabled: true,
    order: 0,
  },
  {
    id: "halls",
    name: "Salonlarımız (Kristal Salon & Kır Bahçesi)",
    badge: "SALONLAR",
    title: "Hayallerinizi Yaşatacak İki Ayrı Konsept",
    subtitle: "Yüksek tavanlı saray görkemi veya peri masalı kır bahçesi",
    isEnabled: true,
    order: 1,
  },
  {
    id: "stats",
    name: "Rakamlarla Elmira (Sayaçlar)",
    badge: "İSTATİSTİK",
    title: "Rakamlarla Başarımız ve Güven",
    subtitle: "Gaziosmanpaşa'da binlerce çiftin en mutlu gününe tanıklık ettik",
    isEnabled: true,
    order: 2,
  },
  {
    id: "packages",
    name: "Düğün & Davet Paketleri",
    badge: "PAKETLER",
    title: "Kusursuz Bir Gece İçin Hazırlandı",
    subtitle: "Her bütçeye ve zevke uygun, şeffaf içerikli düğün paketlerimiz",
    isEnabled: true,
    order: 3,
  },
  {
    id: "features",
    name: "Neden Elmira Davet? (Avantajlar)",
    badge: "AVANTAJLAR",
    title: "Gaziosmanpaşa'nın En Seçkin Davet Deneyimi",
    subtitle: "Mimari zarafet, gurme lezzetler ve kusursuz organizasyon bir arada",
    isEnabled: true,
    order: 4,
  },
  {
    id: "gallery",
    name: "Atmosfer & Galeri",
    badge: "GALERİ",
    title: "Işıltılı Anlardan Seçilenler",
    subtitle: "Salonlarımızdan ve unutulmaz etkinliklerimizden özel kareler",
    isEnabled: true,
    order: 5,
  },
  {
    id: "testimonials",
    name: "Misafir Yorumları & Referanslar",
    badge: "YORUMLAR",
    title: "Çiftlerimizin Mutluluğu Bizim Gururumuz",
    subtitle: "Elmira Davet Salonu'nda dünyaevine giren misafirlerimizin deneyimleri",
    isEnabled: true,
    order: 6,
  },
  {
    id: "reservation",
    name: "Fiyat Teklifi & Randevu Formu",
    badge: "REZERVASYON",
    title: "Hayalinizdeki Tarihi Hemen Ayırtın",
    subtitle: "Özel indirimlerden faydalanmak için salon müsaitlik tarihinizi sorgulayın",
    isEnabled: true,
    order: 7,
  },
];

export default async function AdminBolumlerPage() {
  let sections: PageSectionItem[] = DEFAULT_SECTIONS;

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "home_page_sections" },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        sections = parsed;
      }
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">Sayfa Bölümleri</h1>
        <p className="text-text-secondary text-sm">
          Ana sayfadaki blokların sıralamasını yukarı/aşağı değiştirin, dilediğiniz bölümü anında yayından kaldırın veya metinlerini güncelleyin.
        </p>
      </div>

      <SectionsClient initialSections={sections} />
    </div>
  );
}
