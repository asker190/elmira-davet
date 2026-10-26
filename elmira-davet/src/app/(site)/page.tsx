import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/settings";
import { HeroMask } from "@/components/site/hero-mask";
import { Counter } from "@/components/animations/counter";
import { Reveal } from "@/components/animations/reveal";
import { TextReveal } from "@/components/animations/text-reveal";
import { Parallax } from "@/components/animations/parallax";
import { HallCard } from "@/components/site/hall-card";
import { ReservationForm } from "@/components/site/reservation-form";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Star,
  Music,
  Gem,
  MapPin,
  Car,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Clock,
  PhoneCall,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  mockHalls,
  mockPackages,
  mockGalleryImages,
  mockTestimonials,
  mockHeroSlides,
} from "@/lib/mock-data";

export const dynamic = "force-dynamic";

interface SectionConfig {
  id: string;
  name: string;
  badge: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  isEnabled: boolean;
  order: number;
}

const DEFAULT_SECTIONS: SectionConfig[] = [
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
    id: "stats",
    name: "Rakamlarla Elmira (Sayaçlar)",
    badge: "İSTATİSTİK",
    title: "Rakamlarla Başarımız ve Güven",
    subtitle: "Gaziosmanpaşa'da binlerce çiftin en mutlu gününe tanıklık ettik",
    isEnabled: true,
    order: 1,
  },
  {
    id: "halls",
    name: "Salonlarımız (Kristal Salon & Kır Bahçesi)",
    badge: "SALONLAR",
    title: "Salonlarımız & Kapasiteler",
    subtitle: "İki Farklı Atmosfer, Tek Bir Zarafet",
    isEnabled: true,
    order: 2,
  },
  {
    id: "features",
    name: "Neden Elmira Davet? (Avantajlar)",
    badge: "AVANTAJLAR",
    title: "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz",
    subtitle: "Gaziosmanpaşa Merkezde Prestijli Konum",
    isEnabled: true,
    order: 3,
  },
  {
    id: "packages",
    name: "Düğün & Davet Paketleri",
    badge: "PAKETLER",
    title: "Düğün & Davet Paketlerimiz",
    subtitle: "Ayrıcalıklı Seçenekler",
    isEnabled: true,
    order: 4,
  },
  {
    id: "gallery",
    name: "Atmosfer & Galeri",
    badge: "GALERİ",
    title: "Salonlarımızdan Kareler",
    subtitle: "Görsel Zarafet",
    isEnabled: true,
    order: 5,
  },
  {
    id: "testimonials",
    name: "Misafir Yorumları & Referanslar",
    badge: "YORUMLAR",
    title: "Misafirlerimizin Yorumları",
    subtitle: "Mutlu Çiftlerimiz",
    isEnabled: true,
    order: 6,
  },
  {
    id: "reservation",
    name: "Fiyat Teklifi & Randevu Formu",
    badge: "REZERVASYON",
    title: "Tarihinizi Hemen Ayırın",
    subtitle: "Rezervasyon & Bilgi",
    isEnabled: true,
    order: 7,
  },
];

export default async function HomePage() {
  // Query all homepage section data from the database with graceful fallbacks
  const [
    settings,
    heroSlides,
    featuredPackages,
    recentImages,
    testimonials,
    blockedDates,
    sectionsSetting,
  ] = await Promise.all([
    getSiteSettings(),
    prisma.heroSlide
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => mockHeroSlides),
    prisma.package
      .findMany({
        where: { isActive: true },
        include: { features: { orderBy: { sortOrder: "asc" } } },
        orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
        take: 3,
      })
      .catch(() => mockPackages),
    prisma.galleryImage
      .findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { category: true },
      })
      .catch(() => mockGalleryImages),
    prisma.testimonial
      .findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 3,
      })
      .catch(() => mockTestimonials),
    prisma.blockedDate.findMany().catch(() => []),
    prisma.siteSetting
      .findUnique({ where: { key: "home_page_sections" } })
      .catch(() => null),
  ]);

  const activeSlides = heroSlides && heroSlides.length > 0 ? heroSlides : mockHeroSlides;
  const activeSlide = activeSlides[0];

  const activePackages =
    featuredPackages && featuredPackages.length > 0
      ? featuredPackages
      : mockPackages;
  const activeImages =
    recentImages && recentImages.length > 0 ? recentImages : mockGalleryImages;
  const activeTestimonials =
    testimonials && testimonials.length > 0 ? testimonials : mockTestimonials;

  const blockedDateStrings = blockedDates.map(
    (b) => b.date.toISOString().split("T")[0]
  );

  // Parse page sections config
  let configuredSections: SectionConfig[] = DEFAULT_SECTIONS;
  if (sectionsSetting?.value) {
    try {
      const parsed = JSON.parse(sectionsSetting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        configuredSections = parsed;
      }
    } catch {}
  }

  // Quick lookup dictionary for section labels/meta
  const secMeta: Record<string, SectionConfig> = {};
  configuredSections.forEach((s) => {
    secMeta[s.id] = s;
  });

  // Sort enabled sections according to admin order
  const activeSections = configuredSections
    .filter((s) => s.isEnabled)
    .sort((a, b) => a.order - b.order);

  // Render content blocks mapping
  const renderSection = (id: string) => {
    const meta = secMeta[id] || {};

    switch (id) {
      case "hero":
        return (
          <HeroMask
            key="hero"
            title={meta.title || activeSlide?.title || "Aşkınızın En Görkemli Sahnesi"}
            subtitle={
              meta.subtitle ||
              activeSlide?.subtitle ||
              settings.slogan ||
              "İstanbul Gaziosmanpaşa'da hayalinizdeki düğün, kristal avizeler ve büyüleyici kır bahçesiyle gerçeğe dönüşüyor."
            }
            location="İstanbul - Gaziosmanpaşa"
            posterUrl={
              meta.imageUrl ||
              activeSlide?.imageUrl ||
              "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=85"
            }
            videoUrl="https://assets.mixkit.co/videos/preview/mixkit-wedding-couple-walking-in-a-forest-41378-large.mp4"
          />
        );

      case "stats":
        return (
          <section
            key="stats"
            aria-label="Elmira Davet İstatistikleri ve Kapasiteleri"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 sm:-mt-20 relative z-30"
          >
            <Reveal direction="up" delay={0.1} distance={25}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Counter
                  value={1200}
                  suffix="+"
                  label="Mutlu Düğün & Davet"
                  sublabel="Gaziosmanpaşa'da unutulmaz tecrübe"
                />
                <Counter
                  value={600}
                  suffix=" Kişi"
                  label="Kristal Salon"
                  sublabel="Lüks kapalı davet ve balo salonu"
                />
                <Counter
                  value={300}
                  suffix=" Kişi"
                  label="Kır Bahçesi"
                  sublabel="Yıldızlar altında doğal açık hava"
                />
                <Counter
                  value={99}
                  prefix="%"
                  label="Misafir Memnuniyeti"
                  sublabel="Doğrulanmış çift ve aile yorumları"
                />
              </div>
            </Reveal>
          </section>
        );

      case "halls":
        return (
          <section
            key="halls"
            aria-labelledby="halls-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
          >
            <Reveal direction="up" delay={0.1}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                    {meta.subtitle || "İki Farklı Atmosfer, Tek Bir Zarafet"}
                  </span>
                  <h2
                    id="halls-heading"
                    className="text-3xl sm:text-4xl lg:text-5xl font-heading text-cream"
                  >
                    {meta.title || "Salonlarımız & Kapasiteler"}
                  </h2>
                </div>
                <Link
                  href="/salonlar"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors py-1 group"
                  aria-label="Tüm salon detaylarını inceleyin"
                >
                  <span>Tüm Salon Detaylarını İnceleyin</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
              {mockHalls.map((hall, idx) => (
                <Reveal
                  key={hall.id}
                  direction={idx % 2 === 0 ? "left" : "right"}
                  delay={0.15 * (idx + 1)}
                  distance={30}
                >
                  <HallCard hall={hall} />
                </Reveal>
              ))}
            </div>
          </section>
        );

      case "features":
        return (
          <section
            key="features"
            aria-labelledby="about-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <Reveal direction="left" delay={0.1} className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-gold/30 text-gold text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Gaziosmanpaşa Merkezde Prestijli Konum</span>
                </div>

                <TextReveal
                  text={meta.title || "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz"}
                  type="words"
                  highlightWords={["Zarafetle", "Yeniden", "Standartlarını"]}
                  className="text-3xl sm:text-4xl lg:text-5xl font-heading text-cream leading-tight"
                  as="h2"
                />

                <div className="w-16 h-1 bg-gradient-gold rounded-full" />

                <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-sans">
                  {settings.aboutText ||
                    "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz. 600 kişilik lüks Kristal Salonumuz ve 300 kişilik büyüleyici Kır Bahçemiz ile aşkınızın en güzel hikayesine ev sahipliği yapıyoruz."}
                </p>

                {/* Highlights feature bullets */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gold/10 text-gold shrink-0">
                      <Gem className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm text-cream font-medium">
                        Kristal Avizeler
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 font-sans">
                        6 metre tavan yüksekliği ve görkemli ışık düzeni
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gold/10 text-gold shrink-0">
                      <Car className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm text-cream font-medium">
                        Ücretsiz Otopark & Vale
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 font-sans">
                        Misafirleriniz için stressiz ve konforlu karşılama
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gold/10 text-gold shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm text-cream font-medium">
                        Akustik Mimari & Sahne
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 font-sans">
                        Yankısız kristal berraklığında müzik ve canlı orkestra
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-gold/10 text-gold shrink-0">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm text-cream font-medium">
                        Gelin & Damat Süiti
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 font-sans">
                        Geniş dinlenme, makyaj ve özel ikram odası
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/hakkimizda"
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors group"
                    aria-label="Elmira Davet hakkında daha fazla bilgi edinin"
                  >
                    <span>Hakkımızda Daha Fazla Bilgi</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </Reveal>

              {/* Visual Showcase with Subtle Parallax */}
              <Reveal direction="right" delay={0.2}>
                <div className="relative">
                  <Parallax speed={0.08} className="rounded-3xl">
                    <div className="relative h-[480px] sm:h-[540px] rounded-3xl overflow-hidden border border-border shadow-elevated">
                      <Image
                        src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"
                        alt="Elmira Davet Salonu Gaziosmanpaşa İç Mekan ve Masa Düzeni"
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-gold font-medium">
                            İstanbul - Gaziosmanpaşa
                          </p>
                          <p className="text-base font-heading text-cream mt-0.5">
                            Unutulmaz Düğünler, Kusursuz Masallar
                          </p>
                        </div>
                        <Link
                          href="/galeri"
                          className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
                          aria-label="Fotoğraf galerisini aç"
                        >
                          Galeri
                        </Link>
                      </div>
                    </div>
                  </Parallax>
                </div>
              </Reveal>
            </div>
          </section>
        );

      case "packages":
        return (
          <section
            key="packages"
            aria-labelledby="packages-heading"
            className="bg-bg-secondary/40 border-y border-border py-20 relative"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <Reveal direction="up" delay={0.1}>
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                    {meta.subtitle || "Ayrıcalıklı Seçenekler"}
                  </span>
                  <h2
                    id="packages-heading"
                    className="text-3xl sm:text-4xl font-heading text-cream"
                  >
                    {meta.title || "Düğün & Davet Paketlerimiz"}
                  </h2>
                  <div className="divider-gold" />
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    Yemekli ve yemeksiz menüler, canlı orkestra ve özel konsept süslemelerle bütçenize en uygun paketi seçin.
                  </p>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activePackages.map((pkg, idx) => (
                  <Reveal
                    key={pkg.id}
                    direction="up"
                    delay={0.15 * (idx + 1)}
                    distance={35}
                    className="h-full"
                  >
                    <div
                      className={`p-8 rounded-3xl bg-surface border flex flex-col justify-between h-full transition-all duration-300 relative group hover:-translate-y-1.5 ${
                        pkg.isFeatured
                          ? "border-gold shadow-gold ring-1 ring-gold/40"
                          : "border-border hover:border-gold/30 shadow-card"
                      }`}
                    >
                      {pkg.isFeatured && (
                        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-gold text-bg-primary uppercase tracking-wider shadow-md">
                          En Çok Tercih Edilen
                        </span>
                      )}

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-heading text-cream">
                            {pkg.name}
                          </h3>
                          <p className="text-xs text-text-muted mt-2 leading-relaxed font-sans">
                            {pkg.description}
                          </p>
                        </div>

                        <div className="pb-6 border-b border-border">
                          <span className="text-3xl sm:text-4xl font-heading text-gradient-gold font-bold">
                            {pkg.priceLabel ||
                              formatPrice(pkg.price ? Number(pkg.price) : null)}
                          </span>
                        </div>

                        {/* Features List */}
                        <ul className="space-y-3">
                          {pkg.features.map((feat) => (
                            <li
                              key={feat.id}
                              className="flex items-start gap-3 text-xs sm:text-sm text-text-secondary"
                            >
                              <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                              <span>{feat.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-8">
                        <Link
                          href="#randevu"
                          className={`w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                            pkg.isFeatured
                              ? "bg-gradient-gold text-bg-primary hover:opacity-95 shadow-gold"
                              : "bg-surface-hover hover:bg-gold/10 hover:text-gold text-cream border border-border"
                          }`}
                          aria-label={`${pkg.name} için teklif ve randevu alın`}
                        >
                          <span>Teklif Al & Randevu</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal direction="up" delay={0.3} className="text-center pt-4">
                <Link
                  href="/paketler"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors group"
                  aria-label="Tüm paketleri ve menü içeriklerini inceleyin"
                >
                  <span>Tüm Paketleri ve Menü İçeriklerini Gör</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>
          </section>
        );

      case "gallery":
        return (
          <section
            key="gallery"
            aria-labelledby="gallery-heading"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
          >
            <Reveal direction="up" delay={0.1}>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                    {meta.subtitle || "Görsel Zarafet"}
                  </span>
                  <h2
                    id="gallery-heading"
                    className="text-3xl sm:text-4xl font-heading text-cream"
                  >
                    {meta.title || "Salonlarımızdan Kareler"}
                  </h2>
                </div>
                <Link
                  href="/galeri"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors py-1 group"
                  aria-label="Tüm fotoğraf galerisini aç"
                >
                  <span>Tüm Galeriyi Aç (Masonry)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </Reveal>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {activeImages.map((img, idx) => (
                <Reveal
                  key={img.id}
                  direction="up"
                  delay={0.1 * (idx + 1)}
                  distance={25}
                >
                  <div className="group relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-surface border border-border shadow-card">
                    <Image
                      src={img.imageUrl}
                      alt={img.alt || "Elmira Davet Salonu Görsel"}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-5 flex flex-col justify-end">
                      <span className="text-[10px] px-2.5 py-1 rounded-full bg-black/60 text-gold self-start mb-1 backdrop-blur-xs border border-gold/20">
                        {img.category.name}
                      </span>
                      <p className="text-xs sm:text-sm text-cream font-medium">
                        {img.title || img.alt}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        );

      case "testimonials":
        return (
          <section
            key="testimonials"
            aria-labelledby="testimonials-heading"
            className="bg-bg-secondary/40 border-y border-border py-20"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <Reveal direction="up" delay={0.1}>
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                    {meta.subtitle || "Mutlu Çiftlerimiz"}
                  </span>
                  <h2
                    id="testimonials-heading"
                    className="text-3xl sm:text-4xl font-heading text-cream"
                  >
                    {meta.title || "Misafirlerimizin Yorumları"}
                  </h2>
                  <div className="divider-gold" />
                  <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
                    Elmira Davet Salonu&apos;nda dünyaevine giren Gaziosmanpaşa çiftlerinin gerçek deneyimleri
                  </p>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeTestimonials.map((t, idx) => (
                  <Reveal
                    key={t.id}
                    direction="up"
                    delay={0.15 * (idx + 1)}
                    distance={30}
                    className="h-full"
                  >
                    <div className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between space-y-6 hover:border-gold/30 transition-colors shadow-card h-full">
                      <div className="space-y-4">
                        <div
                          className="flex items-center gap-1"
                          aria-label={`${t.rating} yıldızlı değerlendirme`}
                        >
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < t.rating
                                  ? "text-gold fill-current"
                                  : "text-border"
                              }`}
                            />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-text-secondary italic leading-relaxed font-sans">
                          &ldquo;{t.content}&rdquo;
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border flex items-center justify-between">
                        <div>
                          <h3 className="font-heading text-cream text-sm font-semibold">
                            {t.name}
                          </h3>
                          {t.eventType && (
                            <p className="text-[11px] text-text-muted mt-0.5">
                              {t.eventType}
                            </p>
                          )}
                        </div>
                        <span className="text-[11px] text-gold font-accent">
                          Doğrulanmış Çift
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal direction="up" delay={0.3} className="text-center pt-2">
                <Link
                  href="/referanslar"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors group"
                  aria-label="Tüm misafir ve çift yorumlarını okuyun"
                >
                  <span>Daha Fazla Misafir Yorumu Oku</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Reveal>
            </div>
          </section>
        );

      case "reservation":
        return (
          <section
            key="reservation"
            id="randevu"
            aria-labelledby="reservation-heading"
            className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
          >
            <Reveal direction="up" delay={0.1}>
              <div className="text-center space-y-3 mb-10">
                <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
                  {meta.subtitle || "Rezervasyon & Bilgi"}
                </span>
                <h2
                  id="reservation-heading"
                  className="text-3xl sm:text-4xl font-heading text-cream"
                >
                  {meta.title || "Tarihinizi Hemen Ayırın"}
                </h2>
                <div className="divider-gold" />
                <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto font-sans leading-relaxed">
                  Gaziosmanpaşa merkez salonumuzda istediğiniz tarihi seçin; Kristal Salon veya Kır Bahçesi
                  için size özel teklifimizle hemen dönüş yapalım.
                </p>
              </div>
            </Reveal>

            <Reveal direction="up" delay={0.2} distance={30}>
              <ReservationForm
                blockedDateStrings={blockedDateStrings}
                whatsAppNumber={
                  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
                  settings.phone ||
                  "905551234567"
                }
                kvkkText={settings.kvkkText}
              />
            </Reveal>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-24 sm:space-y-32">
      {activeSections.map((sec) => renderSection(sec.id))}
    </div>
  );
}
