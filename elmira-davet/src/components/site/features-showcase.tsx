"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/animations/reveal";
import { Parallax } from "@/components/animations/parallax";
import { TextReveal } from "@/components/animations/text-reveal";
import {
  MapPin,
  ArrowRight,
  Gem,
  Car,
  Music,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Trees,
} from "lucide-react";

export interface FeatureItem {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

export interface ShowcaseData {
  imageUrl?: string;
  locationBadge?: string;
  title?: string;
  buttonText?: string;
  buttonLink?: string;
}

export interface FeaturesShowcaseProps {
  badge?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  items?: FeatureItem[];
  showcase?: ShowcaseData;
  isEditor?: boolean;
}

const DEFAULT_ITEMS: FeatureItem[] = [
  { id: "feat-1", title: "Kristal Avizeler", description: "6 metre tavan yüksekliği ve görkemli ışık düzeni", icon: "gem" },
  { id: "feat-2", title: "Ücretsiz Otopark & Vale", description: "Misafirleriniz için stressiz ve konforlu karşılama", icon: "car" },
  { id: "feat-3", title: "Akustik Mimari & Sahne", description: "Yankısız kristal berraklığında müzik ve canlı orkestra", icon: "music" },
  { id: "feat-4", title: "Gelin & Damat Süiti", description: "Geniş dinlenme, makyaj ve özel ikram odası", icon: "heart" },
];

export function FeaturesShowcase({
  badge = "Gaziosmanpaşa Merkezde Prestijli Konum",
  title = "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz",
  description = "Elmira Davet Salonu olarak, hayatınızın en özel anlarını unutulmaz kılmak için İstanbul Gaziosmanpaşa'da hizmetinizdeyiz. 600 kişilik lüks Kristal Salonumuz ve 300 kişilik büyüleyici Kır Bahçemiz ile aşkınızın en güzel hikayesine ev sahipliği yapıyoruz. Modern mimarimiz, kristal avizelerimiz, gelişmiş akustik ses sistemlerimiz ve usta şeflerimizin hazırladığı gurme lezzetlerle Gaziosmanpaşa ve çevresinde düğün standartlarını yeniden tanımlıyoruz.",
  buttonText = "Hakkımızda Daha Fazla Bilgi",
  buttonLink = "/hakkimizda",
  items = DEFAULT_ITEMS,
  showcase = {
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
    locationBadge: "İstanbul - Gaziosmanpaşa",
    title: "Unutulmaz Düğünler, Kusursuz Masallar",
    buttonText: "Galeri",
    buttonLink: "/galeri",
  },
  isEditor = false,
}: FeaturesShowcaseProps) {
  const iconMap: Record<string, React.ReactNode> = {
    gem: <Gem className="w-5 h-5" />,
    car: <Car className="w-5 h-5" />,
    music: <Music className="w-5 h-5" />,
    heart: <HeartHandshake className="w-5 h-5" />,
    sparkles: <Sparkles className="w-5 h-5" />,
    shield: <ShieldCheck className="w-5 h-5" />,
    building: <Building2 className="w-5 h-5" />,
    users: <Users className="w-5 h-5" />,
    trees: <Trees className="w-5 h-5" />,
  };

  const featureItems = items && items.length > 0 ? items : DEFAULT_ITEMS;

  const content = (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <Reveal direction="left" delay={0.1} className="space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-gold/30 text-gold text-xs">
          <MapPin className="w-3.5 h-3.5" />
          <span>{badge}</span>
        </div>

        <h2
          id="about-heading"
          className="text-3xl sm:text-4xl lg:text-5xl font-heading text-cream leading-tight"
        >
          {(title || "Bölgenin Standartlarını Zarafetle Yeniden Belirliyoruz")
            .split(" ")
            .map((word, i) => {
              const cleaned = word.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
              const isHighlighted = [
                "zarafetle",
                "yeniden",
                "standartlarını",
                "standartları",
                "standart",
              ].includes(cleaned);
              return (
                <span
                  key={i}
                  className={`inline-block mr-[0.25em] last:mr-0 ${
                    isHighlighted
                      ? "text-gradient-gold italic font-accent"
                      : ""
                  }`}
                >
                  {word}
                </span>
              );
            })}
        </h2>

        <div className="w-16 h-1 bg-gradient-gold rounded-full" />

        <p className="text-text-secondary text-sm sm:text-base leading-relaxed font-sans">
          {description}
        </p>

        {/* Highlights feature bullets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {featureItems.map((feat, idx) => (
            <div
              key={feat.id || idx}
              className="p-4 rounded-2xl bg-surface border border-border flex items-start gap-3"
            >
              <div className="p-2 rounded-xl bg-gold/10 text-gold shrink-0">
                {iconMap[feat.icon || "gem"] || <Gem className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-heading text-sm text-cream font-medium">
                  {feat.title}
                </h3>
                <p className="text-xs text-text-muted mt-0.5 font-sans">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href={buttonLink || "/hakkimizda"}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-gold hover:text-cream font-semibold transition-colors group"
            aria-label="Elmira Davet hakkında daha fazla bilgi edinin"
          >
            <span>{buttonText}</span>
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
                src={showcase?.imageUrl || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80"}
                alt="Elmira Davet Salonu Gaziosmanpaşa İç Mekan ve Masa Düzeni"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 p-5 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold font-medium">
                    {showcase?.locationBadge || "İstanbul - Gaziosmanpaşa"}
                  </p>
                  <p className="text-base font-heading text-cream mt-0.5">
                    {showcase?.title || "Unutulmaz Düğünler, Kusursuz Masallar"}
                  </p>
                </div>
                <Link
                  href={showcase?.buttonLink || "/galeri"}
                  className="px-4 py-2 rounded-xl bg-gradient-gold text-bg-primary text-xs font-semibold uppercase tracking-wider transition-opacity hover:opacity-90"
                  aria-label="Fotoğraf galerisini aç"
                >
                  {showcase?.buttonText || "Galeri"}
                </Link>
              </div>
            </div>
          </Parallax>
        </div>
      </Reveal>
    </div>
  );

  if (isEditor) {
    return <section aria-labelledby="about-heading" className="w-full">{content}</section>;
  }

  return (
    <section
      aria-labelledby="about-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {content}
    </section>
  );
}
