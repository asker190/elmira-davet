import { mockHalls } from "@/lib/mock-data";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Users, Check, CalendarCheck2, Sparkles, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface HallDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: HallDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const hall = mockHalls.find((h) => h.slug === slug);

  if (!hall) {
    return { title: "Salon Bulunamadı | Elmira Davet" };
  }

  return {
    title: `${hall.name} (${hall.capacity}) | Elmira Davet Gaziosmanpaşa`,
    description: hall.description,
  };
}

export default async function HallDetailPage({ params }: HallDetailPageProps) {
  const { slug } = await params;
  const hall = mockHalls.find((h) => h.slug === slug);

  if (!hall) {
    notFound();
  }

  return (
    <div className="pt-28 pb-20 space-y-16">
      {/* Top Breadcrumb & Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/salonlar"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-text-secondary hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm Salonlarımıza Dön</span>
        </Link>
      </div>

      {/* Main Hero Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-gold/30 text-gold text-xs">
              <Users className="w-3.5 h-3.5" />
              <span>{hall.capacity}</span>
              <span>•</span>
              <span>{hall.area}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-heading text-cream">
              {hall.name}
            </h1>

            <p className="text-xs uppercase tracking-widest text-gold font-medium">
              {hall.tagline}
            </p>

            <div className="w-16 h-1 bg-gradient-gold rounded-full" />

            <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-sans">
              {hall.description}
            </p>

            {/* Technical Highlights list */}
            <div className="pt-2">
              <h3 className="text-xs uppercase tracking-wider text-cream font-semibold mb-3">
                Salon Özellikleri & Donanımı:
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hall.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2.5 text-xs text-text-secondary">
                    <Check className="w-4 h-4 text-gold shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/iletisim"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs tracking-wider uppercase shadow-gold hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
              >
                <CalendarCheck2 className="w-4 h-4" />
                <span>Bu Salon İçin Teklif Alın</span>
              </Link>

              <Link
                href="/galeri"
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-surface hover:bg-surface-hover text-cream border border-border text-xs tracking-wider uppercase transition-colors text-center"
              >
                Fotoğrafları Gör
              </Link>
            </div>
          </div>

          {/* Visual Showcase */}
          <div className="relative h-[450px] sm:h-[550px] rounded-3xl overflow-hidden border border-border shadow-elevated">
            <Image
              src={hall.imageUrl}
              alt={hall.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gold font-medium">
                  İstanbul - Gaziosmanpaşa
                </p>
                <p className="text-sm font-heading text-white mt-0.5">
                  {hall.name} Davet Düzeni
                </p>
              </div>
              <span className="text-xs font-semibold text-cream bg-surface px-3 py-1 rounded-lg border border-border">
                {hall.capacity}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
