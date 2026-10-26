"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PageData, BlockNode } from "@/lib/cms/types";
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
  Building2,
  CalendarCheck,
  MapPin,
  HelpCircle,
  Quote,
  Images,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Phone,
  Play,
  Star,
  Check,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface PublicPageRendererProps {
  page: PageData;
}

export function PublicPageRenderer({ page }: PublicPageRendererProps) {
  const blocks = page.content || [];

  return (
    <div className="w-full bg-bg-primary text-cream min-h-screen">
      {/* FAQPage JSON-LD Structured Data for SEO */}
      {blocks.some((b) => b.type === "faq") && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: blocks
                .filter((b) => b.type === "faq")
                .flatMap((b) => b.attrs.items || [])
                .map((it: any) => ({
                  "@type": "Question",
                  name: it.question,
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: it.answer,
                  },
                })),
            }),
          }}
        />
      )}

      {/* Render Each Block Sequentially */}
      <div className="flex flex-col space-y-16 sm:space-y-24">
        {blocks.map((block) => (
          <PublicBlockRenderer key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}

// ─── Individual Public Block Renderer ─────────────────────────────

function PublicBlockRenderer({ block }: { block: BlockNode }) {
  const { type, attrs, motion, layout, visibility, anchorId } = block;

  const visibilityClass = [
    visibility?.hideOnDesktop ? "hidden lg:hidden" : "",
    visibility?.hideOnTablet ? "hidden md:hidden lg:block" : "",
    visibility?.hideOnMobile ? "hidden sm:block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const widthClass =
    layout?.contentWidth === "narrow"
      ? "max-w-3xl mx-auto px-4"
      : layout?.contentWidth === "full"
      ? "w-full"
      : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

  const paddingClass =
    layout?.paddingY === "none"
      ? "py-0"
      : layout?.paddingY === "small"
      ? "py-6"
      : layout?.paddingY === "large"
      ? "py-20"
      : layout?.paddingY === "xlarge"
      ? "py-28"
      : "py-10";

  const bgStyle: React.CSSProperties = {};
  if (layout?.background?.type === "color") {
    bgStyle.backgroundColor = layout.background.value;
  } else if (layout?.background?.type === "gradient") {
    bgStyle.background = layout.background.value;
  }

  return (
    <section
      id={anchorId || undefined}
      style={bgStyle}
      className={`relative w-full ${paddingClass} ${visibilityClass}`}
    >
      <div className={widthClass}>
        {renderBlockContent(type, attrs, block.children)}
      </div>
    </section>
  );
}

// ─── Block Content Switcher ───────────────────────────────────────

function renderBlockContent(type: string, attrs: Record<string, any>, children?: BlockNode[]) {
  switch (type) {
    case "hero": {
      const bgImage =
        attrs.imageUrl ||
        attrs.posterUrl ||
        "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=85";

      return (
        <div className="relative min-h-[580px] lg:min-h-[720px] w-full rounded-3xl overflow-hidden flex items-center justify-center bg-bg-primary select-none p-8 md:p-20 border border-border shadow-elevated">
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

          {/* Atmospheric Glow */}
          <div
            aria-hidden="true"
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gold/10 rounded-full blur-[120px] pointer-events-none z-10"
          />

          <div className="relative z-20 max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/85 border border-gold/30 text-gold text-xs tracking-widest uppercase backdrop-blur-md shadow-card">
              <MapPin className="w-3.5 h-3.5 text-gold shrink-0" />
              <span>İstanbul - Gaziosmanpaşa</span>
              <span className="w-1 h-1 rounded-full bg-gold" />
              <span className="text-cream font-medium">Elmira Davet Salonu</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading text-cream font-normal tracking-tight leading-[1.18] drop-shadow-md">
              {attrs.title || "Aşkınızın En Görkemli Sahnesi"}
            </h1>

            <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed font-sans">
              {attrs.subtitle ||
                "İstanbul Gaziosmanpaşa'da hayalinizdeki düğün, kristal avizeler ve büyüleyici kır bahçesiyle gerçeğe dönüşüyor."}
            </p>

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

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href={attrs.primaryButtonUrl || "/iletisim"}
                className="px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs uppercase tracking-wider transition-opacity hover:opacity-95 shadow-gold flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>{attrs.primaryButtonText || "Teklif & Randevu Al"}</span>
              </Link>
              <Link
                href={attrs.secondaryButtonUrl || "/salonlar"}
                className="px-8 py-3.5 rounded-full bg-surface/80 border border-border text-cream text-xs uppercase tracking-wider font-semibold flex items-center gap-2 hover:border-gold/50 transition-colors"
              >
                <span>{attrs.secondaryButtonText || "Salonlarımızı İnceleyin"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      );
    }

    case "heading": {
      const level = attrs.level || 2;
      const HeadingTag = `h${level}` as any;
      const alignClass =
        attrs.align === "left"
          ? "text-left"
          : attrs.align === "right"
          ? "text-right"
          : "text-center";

      return (
        <div className={`space-y-3 ${alignClass} max-w-3xl mx-auto`}>
          {attrs.badgeText && (
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-medium block">
              {attrs.badgeText}
            </span>
          )}
          <HeadingTag
            className={`font-heading font-normal text-cream tracking-tight ${
              level === 1
                ? "text-4xl sm:text-5xl text-gradient-gold"
                : level === 2
                ? "text-3xl sm:text-4xl"
                : level === 3
                ? "text-2xl sm:text-3xl"
                : "text-xl sm:text-2xl"
            }`}
          >
            {attrs.text}
          </HeadingTag>
          <div className="w-16 h-1 bg-gradient-gold rounded-full mx-auto" />
          {attrs.subtitle && (
            <p className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed max-w-2xl mx-auto">
              {attrs.subtitle}
            </p>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((st: any, idx: number) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-surface border border-border shadow-card flex flex-col items-center justify-center text-center space-y-1.5"
            >
              <div className="text-3xl sm:text-4xl font-heading font-bold text-gold">
                {st.prefix || ""}{st.value}{st.suffix || ""}
              </div>
              <div className="text-xs sm:text-sm font-medium text-cream">{st.label}</div>
              {st.sublabel && (
                <div className="text-[11px] text-text-muted font-sans">{st.sublabel}</div>
              )}
            </div>
          ))}
        </div>
      );
    }

    case "hall_cards": {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {mockHalls.map((hall) => (
            <HallCard key={hall.id} hall={hall} />
          ))}
        </div>
      );
    }

    case "packages": {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockPackages.map((pkg) => (
            <div
              key={pkg.id}
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
                <Link
                  href="#randevu"
                  className={`w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                    pkg.isFeatured
                      ? "bg-gradient-gold text-bg-primary hover:opacity-95 shadow-gold"
                      : "bg-surface-hover hover:bg-gold/10 hover:text-gold text-cream border border-border"
                  }`}
                >
                  <span>Teklif Al & Randevu</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "gallery": {
      return (
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
      );
    }

    case "testimonials": {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockTestimonials.map((t) => (
            <div
              key={t.id}
              className="p-8 rounded-3xl bg-surface border border-border flex flex-col justify-between space-y-6 hover:border-gold/30 transition-colors shadow-card h-full"
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
      );
    }

    case "reservation_form": {
      return (
        <div className="max-w-5xl mx-auto">
          <ReservationForm blockedDateStrings={[]} whatsAppNumber="905551234567" />
        </div>
      );
    }

    case "faq": {
      const items =
        attrs.items && attrs.items.length > 0
          ? attrs.items
          : mockFaqs.map((f) => ({ question: f.q, answer: f.a }));

      return <PublicFaqAccordion items={items} />;
    }

    case "text": {
      return (
        <div
          className="prose prose-invert prose-cream text-sm sm:text-base max-w-none py-2 leading-relaxed text-text-secondary font-sans"
          dangerouslySetInnerHTML={{ __html: attrs.html || "" }}
        />
      );
    }

    case "image": {
      return (
        <div className="space-y-2 py-2">
          <div
            className={`relative rounded-3xl overflow-hidden border border-border shadow-card mx-auto max-w-4xl ${
              attrs.aspectRatio === "16:9"
                ? "aspect-video"
                : attrs.aspectRatio === "4:3"
                ? "aspect-[4/3]"
                : attrs.aspectRatio === "1:1"
                ? "aspect-square"
                : "aspect-auto max-h-[600px]"
            }`}
          >
            <img
              src={attrs.url}
              alt={attrs.alt || "Elmira Davet Görseli"}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                attrs.zoomOnHover ? "hover:scale-105" : ""
              }`}
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

    case "map": {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-heading text-2xl font-bold text-cream">
              {attrs.title || "Ulaşım ve Konum"}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{attrs.address || "Merkez Mahallesi, Gaziosmanpaşa Caddesi No: 42, İstanbul"}</span>
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-border shadow-card h-80 md:h-96">
            <iframe
              src={
                attrs.googleMapsEmbedUrl ||
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48145.43851502476!2d28.8789508!3d41.0664684!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab009c9168475%3A0x67399a9a3b723f6e!2zR2F6aW9zbWFucGHFn2EvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1700000000000"
              }
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      );
    }

    case "columns": {
      return (
        <div className={`grid grid-cols-1 md:grid-cols-${attrs.columnsCount || 2} gap-6`}>
          {children && children.length > 0 ? (
            children.map((child) => (
              <div key={child.id}>
                {renderBlockContent(child.type, child.attrs, child.children)}
              </div>
            ))
          ) : (
            <div className="col-span-full py-4 text-center text-xs text-text-muted">
              Sütun bloğu
            </div>
          )}
        </div>
      );
    }

    case "button_cta": {
      return (
        <div className="p-8 md:p-12 rounded-3xl bg-surface border border-gold/30 text-center space-y-4 shadow-card">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-cream">
            {attrs.text || "Hayalinizdeki Geceyi Birlikte Planlayalım"}
          </h3>
          <div>
            <Link
              href={attrs.buttonUrl || "/iletisim"}
              target={attrs.openInNewTab ? "_blank" : undefined}
              rel={attrs.openInNewTab ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-gold text-bg-primary font-semibold text-xs uppercase tracking-wider transition-opacity hover:opacity-95 shadow-gold"
            >
              <span>{attrs.buttonText || "Bize Ulaşın"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      );
    }

    case "video": {
      return (
        <div className="relative aspect-video rounded-3xl overflow-hidden border border-gold/25 shadow-2xl bg-black">
          {attrs.source === "youtube" ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(attrs.url)}?autoplay=${
                attrs.autoplay ? 1 : 0
              }&mute=${attrs.muted ? 1 : 0}&loop=${attrs.loop ? 1 : 0}`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={attrs.url}
              poster={attrs.posterUrl}
              autoPlay={attrs.autoplay}
              muted={attrs.muted}
              loop={attrs.loop}
              controls={attrs.controls}
              className="w-full h-full object-cover"
            />
          )}
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
        <div
          dangerouslySetInnerHTML={{ __html: attrs.html || "" }}
          className="w-full overflow-hidden"
        />
      );
    }

    default:
      return null;
  }
}

function PublicFaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
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

function getYouTubeVideoId(url?: string): string {
  if (!url) return "";
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : "";
}
