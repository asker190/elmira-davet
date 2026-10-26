"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { BlockNode } from "@/lib/cms/types";
import { HallCard } from "@/components/site/hall-card";
import { ReservationForm } from "@/components/site/reservation-form";
import {
  mockHalls,
  mockPackages,
  mockGalleryImages,
  mockTestimonials,
  mockFaqs,
} from "@/lib/mock-data";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  AlertCircle,
  Building2,
  PackageCheck,
  Quote,
  HelpCircle,
  CalendarCheck,
  MapPin,
  Columns,
  Play,
  Video as VideoIcon,
  Image as ImageIcon,
  Images,
  ExternalLink,
  Star,
  Check,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

interface BlockRendererProps {
  block: BlockNode;
  isSelected: boolean;
  onUpdateAttrs: (attrs: Record<string, any>) => void;
  h1Count?: number;
}

export function BlockCanvasRenderer({
  block,
  isSelected,
  onUpdateAttrs,
  h1Count = 0,
}: BlockRendererProps) {
  const { type, attrs } = block;

  if (!type) {
    return (
      <div className="p-4 border border-dashed border-red-500/50 bg-red-500/10 rounded-xl text-center text-red-300 text-xs">
        Bilinmeyen veya şemaya uymayan blok verisi.
      </div>
    );
  }

  switch (type) {
    case "hero": {
      const bgImage =
        attrs.imageUrl ||
        attrs.posterUrl ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=85";

      return (
        <section className="relative min-h-[520px] lg:min-h-[640px] w-full rounded-3xl overflow-hidden flex items-center justify-center bg-bg-primary select-none p-8 md:p-16 border border-border shadow-elevated">
          {/* Background Poster & Layered Gradients */}
          <div className="absolute inset-0 z-0">
            <img
              src={bgImage}
              alt="Elmira Davet Salonu"
              className="w-full h-full object-cover transition-transform duration-700"
            />
            <div
              className="absolute inset-0 bg-black"
              style={{ opacity: (attrs.overlayOpacity ?? 60) / 100 }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-black/70" />
          </div>

          {/* Gold Glow */}
          <div
            aria-hidden="true"
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[360px] bg-gold/10 rounded-full blur-[100px] pointer-events-none z-10"
          />

          {/* Foreground Hero Content */}
          <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6">
            {/* Location Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/85 border border-gold/30 text-gold text-xs tracking-widest uppercase backdrop-blur-md shadow-card">
              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>İstanbul - Gaziosmanpaşa</span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span className="text-cream font-medium">Elmira Davet Salonu</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading text-cream font-normal tracking-tight leading-[1.2] drop-shadow-md">
              {attrs.title || "Aşkınızın En Görkemli Sahnesi"}
            </h1>

            {/* Subtitle */}
            <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
              {attrs.subtitle ||
                "İstanbul Gaziosmanpaşa'da hayalinizdeki düğün, kristal avizeler ve büyüleyici kır bahçesiyle gerçeğe dönüşüyor."}
            </p>

            {/* Capacity Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <span className="px-3.5 py-1.5 rounded-full bg-surface/80 border border-gold/25 text-xs text-cream flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Kristal Salon – 600 Kişilik Kapasite</span>
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-surface/80 border border-gold/25 text-xs text-cream flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Kır Bahçesi – 300 Kişilik Açık Hava</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
              <span className="px-6 py-3 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs uppercase tracking-wider shadow-gold flex items-center gap-2">
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>{attrs.primaryButtonText || "Teklif & Randevu Al"}</span>
              </span>
              <span className="px-6 py-3 rounded-full bg-surface/80 border border-border text-cream text-xs uppercase tracking-wider font-semibold flex items-center gap-1.5 hover:border-gold/50 transition-colors">
                <span>{attrs.secondaryButtonText || "Salonlarımızı İnceleyin"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </section>
      );
    }

    case "heading": {
      const level = attrs.level || 2;
      const HeadingTag = `h${level}` as any;
      const isDuplicateH1 = level === 1 && h1Count > 1;

      return (
        <div className={`space-y-3 text-${attrs.align || "center"} py-4 max-w-3xl mx-auto`}>
          {attrs.badgeText && (
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium block">
              {attrs.badgeText}
            </span>
          )}
          <HeadingTag
            className={`font-heading text-cream font-normal tracking-tight ${
              level === 1
                ? "text-4xl sm:text-5xl text-gradient-gold"
                : level === 2
                ? "text-3xl sm:text-4xl"
                : level === 3
                ? "text-2xl sm:text-3xl"
                : "text-xl sm:text-2xl"
            }`}
          >
            {attrs.text || "Bölüm Başlığı"}
          </HeadingTag>
          <div className="w-16 h-1 bg-gradient-gold rounded-full mx-auto" />
          {attrs.subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto">
              {attrs.subtitle}
            </p>
          )}

          {isDuplicateH1 && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px]">
              <AlertCircle className="w-3 h-3" />
              Sayfada birden fazla H1 başlık bulundu. SEO için sayfada tek H1 olmalıdır.
            </div>
          )}
        </div>
      );
    }

    case "counters": {
      const defaultItems = [
        { value: 1200, suffix: "+", prefix: "", label: "Mutlu Düğün & Davet", sublabel: "Gaziosmanpaşa'da unutulmaz tecrübe" },
        { value: 600, suffix: " Kişi", prefix: "", label: "Kristal Salon", sublabel: "Lüks kapalı davet ve balo salonu" },
        { value: 300, suffix: " Kişi", prefix: "", label: "Kır Bahçesi", sublabel: "Yıldızlar altında doğal açık hava" },
        { value: 99, prefix: "%", suffix: "", label: "Misafir Memnuniyeti", sublabel: "Doğrulanmış çift ve aile yorumları" },
      ];
      const items = attrs.items && attrs.items.length > 0 ? attrs.items : defaultItems;

      return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-4">
          {items.map((it: any, i: number) => (
            <div
              key={i}
              className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center justify-center text-center space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-heading font-bold text-gold">
                {it.prefix || ""}{it.value}{it.suffix || ""}
              </div>
              <div className="text-xs sm:text-sm font-medium text-cream">{it.label}</div>
              {it.sublabel && (
                <div className="text-[11px] text-text-muted font-sans">{it.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "hall_cards": {
      return (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
            {mockHalls.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        </div>
      );
    }

    case "packages": {
      return (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`p-8 rounded-3xl bg-surface border flex flex-col justify-between h-full transition-all duration-300 relative group ${
                  pkg.isFeatured
                    ? "border-gold shadow-gold ring-1 ring-gold/40"
                    : "border-border shadow-card"
                }`}
              >
                {pkg.isFeatured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold bg-gradient-gold text-bg-primary uppercase tracking-wider shadow-md">
                    En Çok Tercih Edilen
                  </span>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-heading text-cream">{pkg.name}</h3>
                    <p className="text-xs text-text-muted mt-2 leading-relaxed font-sans">
                      {pkg.description}
                    </p>
                  </div>

                  <div className="pb-6 border-b border-border">
                    <span className="text-3xl sm:text-4xl font-heading text-gradient-gold font-bold">
                      {pkg.priceLabel || formatPrice(pkg.price ? Number(pkg.price) : null)}
                    </span>
                  </div>

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
                  <span
                    className={`w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                      pkg.isFeatured
                        ? "bg-gradient-gold text-bg-primary shadow-gold"
                        : "bg-surface-hover text-cream border border-border"
                    }`}
                  >
                    <span>Teklif Al & Randevu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "gallery": {
      return (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {mockGalleryImages.slice(0, 6).map((img) => (
              <div
                key={img.id}
                className="group relative h-64 sm:h-80 rounded-3xl overflow-hidden bg-surface border border-border shadow-card"
              >
                <img
                  src={img.imageUrl}
                  alt={img.alt || img.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
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
            ))}
          </div>
        </div>
      );
    }

    case "testimonials": {
      return (
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mockTestimonials.map((t) => (
              <div
                key={t.id}
                className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between space-y-6 shadow-card h-full"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < t.rating ? "text-gold fill-current" : "text-border"
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
                    <h3 className="font-heading text-cream text-sm font-semibold">{t.name}</h3>
                    {t.eventType && (
                      <p className="text-[11px] text-text-muted mt-0.5">{t.eventType}</p>
                    )}
                  </div>
                  <span className="text-[11px] text-gold font-accent">Doğrulanmış Çift</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "reservation_form": {
      return (
        <div className="py-6 max-w-5xl mx-auto">
          <ReservationForm blockedDateStrings={[]} whatsAppNumber="905551234567" />
        </div>
      );
    }

    case "faq": {
      const items = attrs.items && attrs.items.length > 0 ? attrs.items : mockFaqs.map((f) => ({ question: f.q, answer: f.a }));

      return <EditorFaqAccordion items={items} />;
    }

    case "text": {
      return (
        <div
          className="prose prose-invert prose-cream text-sm sm:text-base max-w-none py-2 leading-relaxed text-text-secondary font-sans"
          dangerouslySetInnerHTML={{
            __html: attrs.html || "<p>Metin girilmedi...</p>",
          }}
        />
      );
    }

    case "image": {
      return (
        <div className="space-y-2 py-4">
          <div
            className={`relative rounded-3xl overflow-hidden border border-border shadow-card mx-auto max-w-4xl ${
              attrs.aspectRatio === "16:9"
                ? "aspect-video"
                : attrs.aspectRatio === "4:3"
                ? "aspect-[4/3]"
                : attrs.aspectRatio === "1:1"
                ? "aspect-square"
                : "aspect-auto max-h-[560px]"
            }`}
          >
            <img
              src={attrs.url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"}
              alt={attrs.alt || "Görsel"}
              className="w-full h-full object-cover"
            />
          </div>
          {attrs.caption && (
            <p className="text-center text-xs text-text-muted italic pt-1 font-sans">
              {attrs.caption}
            </p>
          )}
        </div>
      );
    }

    case "button_cta": {
      return (
        <div className="p-8 sm:p-12 rounded-3xl bg-surface border border-gold/30 text-center space-y-4 shadow-card my-4">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-cream">
            {attrs.text || "Hayalinizdeki Geceyi Birlikte Planlayalım"}
          </h3>
          <div>
            <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs uppercase tracking-wider shadow-gold">
              <span>{attrs.buttonText || "Randevu Alın"}</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      );
    }

    case "video": {
      return (
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-gold/25 shadow-2xl bg-black my-4">
          {attrs.posterUrl ? (
            <img src={attrs.posterUrl} alt="Video Poster" className="w-full h-full object-cover opacity-60" />
          ) : null}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <div className="w-14 h-14 rounded-full bg-gradient-gold text-bg-primary flex items-center justify-center mb-2 shadow-gold">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            <span className="text-sm font-semibold text-cream drop-shadow">
              {attrs.source === "youtube" ? "YouTube Video Oynatıcı" : "Özel Video Oynatıcı"}
            </span>
          </div>
        </div>
      );
    }

    case "map": {
      return (
        <div className="space-y-4 py-4">
          <div className="text-center space-y-1">
            <h3 className="font-heading text-2xl font-bold text-cream">
              {attrs.title || "Ulaşım ve Konum"}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{attrs.address || "Merkez Mahallesi, Gaziosmanpaşa Caddesi No: 42, İstanbul"}</span>
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border shadow-card h-72 sm:h-80 bg-surface flex flex-col items-center justify-center text-center p-6">
            <MapPin className="w-10 h-10 text-gold mb-2 opacity-80" />
            <span className="text-sm font-medium text-cream">{attrs.address || "Gaziosmanpaşa / İstanbul"}</span>
            <span className="text-xs text-text-muted mt-1 font-sans">Google Maps İnteraktif Harita Alanı</span>
          </div>
        </div>
      );
    }

    case "columns": {
      return (
        <div className="p-3 rounded-xl border border-dashed border-gold/40 bg-gold/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-gold font-semibold">
            <div className="flex items-center gap-1.5">
              <Columns className="w-4 h-4" />
              <span>Sütun Konteyneri ({attrs.columnsCount || 2} Sütun)</span>
            </div>
          </div>
          <div className={`grid grid-cols-${attrs.columnsCount || 2} gap-4`}>
            {Array.from({ length: attrs.columnsCount || 2 }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="min-h-[100px] p-4 rounded-xl bg-surface border border-border flex items-center justify-center text-center text-xs text-text-muted"
              >
                Sütun #{cIdx + 1}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "spacer_divider": {
      return (
        <div
          className="flex items-center justify-center py-4"
          style={{ height: `${attrs.height || 48}px` }}
        >
          {attrs.showDivider && (
            <div className="w-full flex items-center justify-center">
              <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="w-2.5 h-2.5 rotate-45 border border-gold bg-charcoal-900 mx-3" />
              <div className="h-[1px] w-32 bg-gradient-to-r from-gold via-gold to-transparent" />
            </div>
          )}
        </div>
      );
    }

    case "custom_html": {
      return (
        <div className="p-3 rounded-xl bg-black/60 border border-gold/25 font-mono text-xs text-cream/80 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-amber-300 font-semibold">
            <span>Özel HTML Kodu</span>
            <span>Yalnızca ADMIN</span>
          </div>
          <div className="p-2 bg-charcoal-900 rounded border border-white/5 overflow-x-auto text-[11px] text-emerald-400">
            {attrs.html || "<!-- HTML kodu -->"}
          </div>
        </div>
      );
    }

    default:
      return (
        <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center text-xs text-cream/60">
          {type} bloğu önizlemesi
        </div>
      );
  }
}

function EditorFaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto py-4">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-surface border border-border overflow-hidden transition-colors"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm sm:text-base font-semibold text-cream hover:text-gold transition-colors"
            >
              <span>{item.question}</span>
              <ChevronDown
                className={`w-4 h-4 text-gold shrink-0 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border pt-3 font-sans">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
