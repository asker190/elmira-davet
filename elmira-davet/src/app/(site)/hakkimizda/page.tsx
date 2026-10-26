import { getPageBySlug, extractStaticFields } from "@/lib/cms/page-service";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Music,
  Car,
  HeartHandshake,
  CalendarCheck2,
  MapPin,
  Trees,
} from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageBySlug("hakkimizda");
  const fields = page ? extractStaticFields(page) : null;
  return {
    title: fields?.seoTitle || "Hakkımızda | Elmira Davet Gaziosmanpaşa",
    description:
      fields?.seoDescription ||
      "Elmira Davet Salonu - İstanbul Gaziosmanpaşa'da 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi ile unutulmaz düğünler.",
  };
}

const FEATURE_ICONS: Record<string, any> = {
  Users,
  Trees,
  Music,
  Car,
  HeartHandshake,
  Sparkles,
};

const DEFAULT_FEATURES = [
  { title: "Kapalı Otopark", description: "500+ araçlık ücretsiz ve güvenli kapalı otopark alanı.", icon: "Car" },
  { title: "Profesyonel Ekip", description: "Deneyimli organizasyon, servis ve mutfak ekibiyle kusursuz hizmet.", icon: "Users" },
  { title: "Canlı Müzik", description: "Ödüllü orkestra ve ses sistemiyle geceyi taçlandırın.", icon: "Music" },
  { title: "Geniş Yeşil Alan", description: "300 kişilik romantik Kır Bahçesi ile yıldızlar altında davet.", icon: "Trees" },
  { title: "Özel Konsept", description: "Her çifte özel dekorasyon ve tema tasarımı.", icon: "HeartHandshake" },
  { title: "Premium Hizmet", description: "VIP karşılama, gelin odası ve özel ikramlarla ayrıcalıklı deneyim.", icon: "Sparkles" },
];

export default async function AboutPage() {
  const page = await getPageBySlug("hakkimizda");
  const fields = page
    ? extractStaticFields(page)
    : {
        title: "Hakkımızda",
        subtitle: "Elmira Davet & Balo Salonları",
        badgeText: "İstanbul - Gaziosmanpaşa",
        heroImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80",
        bodyHtml: "",
        seoTitle: "",
        seoDescription: "",
      };

  const paragraphs = fields.bodyHtml
    ? fields.bodyHtml.replace(/<[^>]+>/g, "").split("\n\n").filter(Boolean)
    : [
        "Elmira Davet Salonu, Gaziosmanpaşa merkezde yer alan eşsiz konumu, 600 kişilik kapalı Kristal Salon'u ve 300 kişilik Kır Bahçesi ile yeni evlenen çiftlerimize unutulmaz bir davet deneyimi yaşatıyor.",
        "Rakiplerimizden bizi ayıran en önemli fark; hazır şablonların ötesine geçerek her çiftimize özel konsept tasarımı, kişiye özel menü tadımları ve düğün gününde birebir eşlik eden profesyonel organizasyon ekibimizdir.",
      ];

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/30 text-gold text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>{fields.badgeText || "İstanbul - Gaziosmanpaşa"}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {fields.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {fields.subtitle}
        </p>
      </section>

      {/* Main Story & Visual */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden border border-border shadow-elevated">
            <Image
              src={
                fields.heroImageUrl ||
                "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80"
              }
              alt={fields.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
              <p className="text-xs text-gold font-accent tracking-wider uppercase">
                {fields.badgeText || "Mimari & Atmosfer"}
              </p>
              <p className="text-sm font-heading text-cream mt-1">
                {fields.subtitle}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-heading text-cream">
              Bölgenin En Seçkin Davet Salonu
            </h2>
            <div className="w-16 h-1 bg-gradient-gold rounded-full" />
            <div className="text-text-secondary text-sm sm:text-base leading-relaxed space-y-4 font-sans whitespace-pre-line">
              {paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/iletisim"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Salonu Ziyaret Edin & Randevu Alın</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="bg-surface/50 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
              Konfor ve İhtişam
            </span>
            <h3 className="text-3xl font-heading text-cream">
              Ayrıcalıklarımız & Donanımımız
            </h3>
            <div className="divider-gold" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_FEATURES.map((f, i) => {
              const IconComponent = (f.icon && FEATURE_ICONS[f.icon]) || Sparkles;
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-surface border border-border space-y-4 hover:border-gold/30 transition-colors shadow-card"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-heading text-cream">
                    {f.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
