import { prisma } from "@/lib/prisma";
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

export default async function AdminIcerikPage() {
  // 1. Salonlar
  let halls = mockHalls;
  try {
    const hallSetting = await prisma.siteSetting.findUnique({
      where: { key: "admin_custom_halls" },
    });
    if (hallSetting?.value) {
      halls = JSON.parse(hallSetting.value);
    }
  } catch {}

  // 2. Paketler
  let packages: any[] = [];
  try {
    const dbPackages = await prisma.package.findMany({
      include: { features: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
    });
    if (dbPackages.length > 0) {
      packages = dbPackages;
    }
  } catch {}

  if (packages.length === 0) {
    try {
      const customPkg = await prisma.siteSetting.findUnique({
        where: { key: "admin_custom_packages" },
      });
      if (customPkg?.value) {
        packages = JSON.parse(customPkg.value);
      }
    } catch {}
  }
  if (packages.length === 0) {
    packages = mockPackages;
  }

  // 3. Menüler
  let menus = [
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
  try {
    const menuSetting = await prisma.siteSetting.findUnique({
      where: { key: "admin_custom_menus" },
    });
    if (menuSetting?.value) {
      menus = JSON.parse(menuSetting.value);
    }
  } catch {}

  // 4. Etkinlik Türleri
  let events = mockEvents;
  try {
    const eventSetting = await prisma.siteSetting.findUnique({
      where: { key: "admin_custom_events" },
    });
    if (eventSetting?.value) {
      events = JSON.parse(eventSetting.value);
    }
  } catch {}

  // 5. Yorumlar
  let testimonials: any[] = [];
  try {
    const dbTestimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: "asc" },
    });
    if (dbTestimonials.length > 0) {
      testimonials = dbTestimonials;
    }
  } catch {}
  if (testimonials.length === 0) {
    testimonials = mockTestimonials;
  }

  // 6. SSS
  let faqs = mockFaqs;
  try {
    const faqSetting = await prisma.siteSetting.findUnique({
      where: { key: "admin_custom_faqs" },
    });
    if (faqSetting?.value) {
      faqs = JSON.parse(faqSetting.value);
    }
  } catch {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading text-cream">İçerik Yönetimi</h1>
        <p className="text-text-secondary text-sm">
          Salonlar, paketler, yemek menüleri, etkinlik türleri, misafir yorumları ve sıkça sorulan soruları tek panelden yönetin.
        </p>
      </div>

      <ContentManager
        initialHalls={halls}
        initialPackages={packages}
        initialMenus={menus}
        initialEvents={events}
        initialFaqs={faqs}
        initialTestimonials={testimonials}
      />
    </div>
  );
}
