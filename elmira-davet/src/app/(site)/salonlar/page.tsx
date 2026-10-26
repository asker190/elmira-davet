import { mockHalls } from "@/lib/mock-data";
import { getPageContent } from "@/lib/cms/pages";
import { HallCard } from "@/components/site/hall-card";
import Link from "next/link";
import { CalendarCheck2, Sparkles, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const page = await getPageContent("salonlar");
  return {
    title: page.seoTitle || "Salonlarımız & Kapasiteler | Elmira Davet Gaziosmanpaşa",
    description:
      page.seoDescription ||
      "Elmira Davet Salonu bünyesindeki 600 kişilik Kristal Salon ve 300 kişilik Kır Bahçesi alanlarımızı inceleyin.",
  };
}

export default async function HallsPage() {
  const page = await getPageContent("salonlar");

  return (
    <div className="pt-28 pb-20 space-y-20">
      {/* Header Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/80 border border-gold/30 text-gold text-xs tracking-widest uppercase">
          <MapPin className="w-3.5 h-3.5 text-gold" />
          <span>{page.badgeText || "İstanbul - Gaziosmanpaşa"}</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading text-cream">
          {page.title}
        </h1>
        <div className="divider-gold" />
        <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto font-sans leading-relaxed">
          {page.subtitle}
        </p>
      </section>

      {/* Halls Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {mockHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      </section>

      {/* Comparison & Capacity Highlights */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-bg-secondary border border-border text-center space-y-6 shadow-card">
          <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium">
            Hangi Salon Sizin İçin Uygun?
          </span>
          <h2 className="text-2xl sm:text-3xl font-heading text-cream">
            Salonlarımızı Yerinde İncelemek İster Misiniz?
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Gaziosmanpaşa merkezdeki mekanımızı ziyaret edebilir, her iki salonun masa düzenini,
            ışıklandırmasını ve akustiğini birebir deneyimleyebilirsiniz.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/iletisim"
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
            >
              <CalendarCheck2 className="w-4 h-4" />
              <span>Salonu Gezmek İçin Randevu Alın</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
