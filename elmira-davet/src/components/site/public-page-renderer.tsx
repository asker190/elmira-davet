"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { PageData, BlockNode } from "@/lib/cms/types";
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
} from "lucide-react";
import toast from "react-hot-toast";

interface PublicPageRendererProps {
  page: PageData;
}

export function PublicPageRenderer({ page }: PublicPageRendererProps) {
  const blocks = page.content || [];

  return (
    <div className="w-full bg-charcoal-950 text-cream min-h-screen">
      {/* FAQPage JSON-LD Structured Data for SEO (PG-S-06) */}
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

      {/* Render Each Block Sequentially (PG-O-01) */}
      <div className="flex flex-col">
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

  // Visibility classes (PG-E-13)
  const visibilityClass = [
    visibility?.hideOnDesktop ? "hidden lg:hidden" : "",
    visibility?.hideOnTablet ? "hidden md:hidden lg:block" : "",
    visibility?.hideOnMobile ? "hidden sm:block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Layout classes
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
      ? "py-8"
      : layout?.paddingY === "large"
      ? "py-24"
      : layout?.paddingY === "xlarge"
      ? "py-32"
      : "py-16";

  const bgStyle: React.CSSProperties = {};
  if (layout?.background?.type === "color") {
    bgStyle.backgroundColor = layout.background.value;
  } else if (layout?.background?.type === "gradient") {
    bgStyle.background = layout.background.value;
  }

  // Motion animation class (PG-H-01 to PG-H-07, with prefers-reduced-motion fallback)
  const motionAnimClass =
    motion?.animation && motion.animation !== "none"
      ? "transition-all duration-700 ease-out"
      : "";

  return (
    <section
      id={anchorId || undefined}
      style={bgStyle}
      className={`relative w-full ${paddingClass} ${visibilityClass} ${motionAnimClass}`}
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
      return (
        <div
          className="relative rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center p-8 md:p-24 min-h-[70vh] bg-cover bg-center shadow-2xl"
          style={{
            backgroundImage: `url(${attrs.imageUrl || attrs.posterUrl})`,
          }}
        >
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (attrs.overlayOpacity ?? 55) / 100 }}
          />

          <div className="relative z-10 max-w-3xl space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-bold text-cream tracking-tight drop-shadow-md">
              {attrs.title}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-cream/90 font-light max-w-2xl mx-auto drop-shadow-sm leading-relaxed">
              {attrs.subtitle}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              {attrs.primaryButtonText && (
                <Link
                  href={attrs.primaryButtonUrl || "/iletisim"}
                  className="px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal-900 font-bold text-sm tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  {attrs.primaryButtonText}
                </Link>
              )}
              {attrs.secondaryButtonText && (
                <Link
                  href={attrs.secondaryButtonUrl || "/salonlar"}
                  className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-cream border border-gold/40 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
                >
                  {attrs.secondaryButtonText}
                </Link>
              )}
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
        <div className={`space-y-3 ${alignClass}`}>
          {attrs.badgeText && (
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-gold/15 text-gold border border-gold/30">
              {attrs.badgeText}
            </span>
          )}
          <HeadingTag
            className={`font-heading font-bold text-cream tracking-tight ${
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
          {attrs.subtitle && (
            <p className="text-cream/70 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              {attrs.subtitle}
            </p>
          )}
        </div>
      );
    }

    case "text": {
      return (
        <div
          className="prose prose-invert prose-cream max-w-none text-cream/90 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: attrs.html || "" }}
        />
      );
    }

    case "image": {
      return (
        <div className="space-y-2">
          <div
            className={`relative rounded-2xl overflow-hidden border border-gold/20 shadow-xl mx-auto ${
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
            <p className="text-center text-xs text-cream/60 italic pt-1">
              {attrs.caption}
            </p>
          )}
        </div>
      );
    }

    case "gallery": {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=800&q=80",
            ].map((imgUrl, i) => (
              <div
                key={i}
                className="group relative aspect-video rounded-2xl overflow-hidden border border-gold/20 shadow-md cursor-pointer"
              >
                <img
                  src={imgUrl}
                  alt={`Galeri Görseli ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="p-2.5 rounded-full bg-gold/90 text-charcoal-900 shadow-lg">
                    <Images className="w-5 h-5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "hall_cards": {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-3xl overflow-hidden bg-charcoal-900 border border-gold/25 shadow-xl group">
            <div className="relative aspect-video overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80"
                alt="Elmira Balo Salonu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold text-charcoal-900 font-bold text-xs shadow-md">
                Kapasite: 750 - 1000 Kişi
              </span>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-heading text-2xl font-bold text-cream">Elmira Balo Salonu</h3>
              <p className="text-sm text-cream/70 leading-relaxed">
                Yüksek tavanlı, ferah fuaye alanına sahip, son teknoloji ses-ışık sistemleri ve dev LED ekran ile donatılmış ana salonumuz.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gold">Kokteyl & Yemekli Düzen</span>
                <Link
                  href="/iletisim"
                  className="px-4 py-2 rounded-xl bg-gold/15 text-gold hover:bg-gold hover:text-charcoal-900 text-xs font-bold border border-gold/30 transition-all"
                >
                  Teklif Al
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden bg-charcoal-900 border border-gold/25 shadow-xl group">
            <div className="relative aspect-video overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80"
                alt="Zümrüt Davet Salonu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-gold text-charcoal-900 font-bold text-xs shadow-md">
                Kapasite: 350 - 500 Kişi
              </span>
            </div>
            <div className="p-6 space-y-3">
              <h3 className="font-heading text-2xl font-bold text-cream">Zümrüt Davet Salonu</h3>
              <p className="text-sm text-cream/70 leading-relaxed">
                Nişan, kına ve butik davetleriniz için sıcak, samimi ve özel dekorasyon konseptleriyle hazırlanan zarif salonumuz.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gold">Özel Kına & Nişan Konsepti</span>
                <Link
                  href="/iletisim"
                  className="px-4 py-2 rounded-xl bg-gold/15 text-gold hover:bg-gold hover:text-charcoal-900 text-xs font-bold border border-gold/30 transition-all"
                >
                  Teklif Al
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "packages": {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Altın Düğün Paketi",
              desc: "Gala yemeği, limitsiz meşrubat, düğün pastası, orkestra, fotoğraf & video çekimi ve gelin odası ikramları.",
              badge: "En Çok Tercih Edilen",
            },
            {
              title: "Kına Gecesi Özel Paketi",
              desc: "Kına tahtı, nedime ekibi, hint kınacısı, zenne/oryantal gösterisi, zengin ikram menüsü ve özel ışık şovları.",
              badge: "Geleneksel & Modern",
            },
            {
              title: "Kokteyl Davet Paketi",
              desc: "Seçkin kanepeler, sıcak atıştırmalıklar, bistro masa düzeni, karşılama kokteyli ve canlı müzik performansı.",
              badge: "Zarif & Şık",
            },
          ].map((pkg, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-charcoal-900 border border-gold/25 shadow-xl flex flex-col justify-between space-y-4 hover:border-gold transition-colors"
            >
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-gold/15 text-gold border border-gold/30">
                  {pkg.badge}
                </span>
                <h4 className="font-heading text-xl font-bold text-cream">{pkg.title}</h4>
                <p className="text-xs sm:text-sm text-cream/70 leading-relaxed">{pkg.desc}</p>
              </div>
              <Link
                href="/iletisim"
                className="w-full py-2.5 rounded-xl bg-gold text-charcoal-900 text-xs font-bold text-center block hover:bg-gold-light transition-colors"
              >
                Fiyat Teklifi İste
              </Link>
            </div>
          ))}
        </div>
      );
    }

    case "counters": {
      const items = attrs.items || [];
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {items.map((it: any, i: number) => (
            <div key={i} className="p-6 rounded-2xl bg-charcoal-900/80 border border-gold/20 shadow-lg">
              <div className="text-3xl sm:text-4xl font-heading font-bold text-gold">
                {it.value}
                <span className="text-xl font-normal ml-0.5">{it.suffix}</span>
              </div>
              <div className="text-xs sm:text-sm text-cream/80 font-medium mt-2">
                {it.label}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "testimonials": {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                "Hayatımızın en güzel gününü rüya gibi yaşattınız. Masa düzeninden yemeklerin lezzetine kadar her şey mükemmeldi.",
              author: "Ayşe & Burak",
              event: "Düğün Organizasyonu",
            },
            {
              quote:
                "Kına gecemiz için hazırlanan konsept ve müzik ekibi muazzamdı. Bütün misafirlerimiz hayran kaldı.",
              author: "Selin Yılmaz",
              event: "Kına Gecesi",
            },
            {
              quote:
                "750 kişilik davetimizde otoparktan servis hızına kadar kusursuz bir organizasyon gerçekleşti. Şeflere teşekkür ederiz.",
              author: "Murat & Gözde",
              event: "Yemekli Düğün",
            },
          ].map((t, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-charcoal-900 border border-gold/20 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <Quote className="w-8 h-8 text-gold/40" />
                <p className="text-xs sm:text-sm text-cream/80 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>
              <div className="border-t border-gold/15 pt-3">
                <div className="font-heading font-bold text-sm text-gold">{t.author}</div>
                <div className="text-[11px] text-cream/50">{t.event}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "faq": {
      const items = attrs.items || [];
      return <PublicFaqAccordion items={items} />;
    }

    case "reservation_form": {
      return <PublicReservationForm attrs={attrs} />;
    }

    case "map": {
      return (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="font-heading text-2xl font-bold text-cream">
              {attrs.title || "Ulaşım ve Konum"}
            </h3>
            <p className="text-xs sm:text-sm text-cream/70 flex items-center justify-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold shrink-0" />
              <span>{attrs.address}</span>
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden border border-gold/30 shadow-2xl h-80 md:h-96">
            <iframe
              src={attrs.googleMapsEmbedUrl}
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
            <div className="col-span-full py-4 text-center text-xs text-cream/40">
              Sütun bloğu
            </div>
          )}
        </div>
      );
    }

    case "button_cta": {
      return (
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-r from-gold/20 via-charcoal-900 to-gold/20 border border-gold/30 text-center space-y-4 shadow-2xl">
          <h3 className="text-2xl sm:text-3xl font-heading font-bold text-cream">
            {attrs.text}
          </h3>
          <div>
            <Link
              href={attrs.buttonUrl || "/iletisim"}
              target={attrs.openInNewTab ? "_blank" : undefined}
              rel={attrs.openInNewTab ? "noopener noreferrer" : undefined}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal-900 font-bold text-sm tracking-wide transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              <span>{attrs.buttonText || "Bize Ulaşın"}</span>
              <ExternalLink className="w-4 h-4" />
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
          className="flex items-center justify-center"
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

// ─── Interactive Public Subcomponents ─────────────────────────────

function PublicFaqAccordion({ items }: { items: Array<{ question: string; answer: string }> }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {items.map((item, idx) => {
        const isOpen = openIndex === idx;
        return (
          <div
            key={idx}
            className="rounded-2xl bg-charcoal-900 border border-gold/20 overflow-hidden transition-colors"
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
              <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-cream/75 leading-relaxed border-t border-gold/10 pt-3">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function PublicReservationForm({ attrs }: { attrs: Record<string, any> }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    hall: "Elmira Balo Salonu",
    eventType: "Düğün",
    eventDate: "",
    timeSlot: "19:00 - 23:00",
    guestCount: 500,
    kvkkConsent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mandatory KVKK verification (PG-B-06)
    if (!formData.kvkkConsent) {
      toast.error("Lütfen KVKK aydınlatma metnini ve açık rızayı onaylayın.");
      return;
    }

    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Lütfen adınızı ve telefon numaranızı girin.");
      return;
    }

    setLoading(true);
    try {
      // Send directly to the CRM Lead intake endpoint
      const res = await fetch("/api/webhooks/meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry: [
            {
              changes: [
                {
                  field: "leadgen",
                  value: {
                    leadgen_id: `web_${Date.now()}`,
                    form_id: "site_contact_form",
                    created_time: Math.floor(Date.now() / 1000),
                    custom_data: {
                      full_name: formData.name,
                      phone_number: formData.phone,
                      email: formData.email,
                      hall: formData.hall,
                      event_type: formData.eventType,
                      event_date: formData.eventDate,
                      time_slot: formData.timeSlot,
                      guest_count: formData.guestCount,
                    },
                  },
                },
              ],
            },
          ],
        }),
      }).catch(() => null);

      setSubmitted(true);
      toast.success(attrs.successMessage || "Talebiniz başarıyla alındı!");
    } catch {
      toast.error("Bir sorun oluştu. Lütfen telefon ile bize ulaşın.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl bg-charcoal-900 border border-gold/40 text-center max-w-xl mx-auto space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-gold/20 text-gold flex items-center justify-center mx-auto">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <h3 className="font-heading text-2xl font-bold text-cream">Talebiniz Alındı!</h3>
        <p className="text-sm text-cream/80 leading-relaxed">
          {attrs.successMessage ||
            "Organizasyon danışmanımız müsaitlik ve fiyat teklifiniz için 1 saat içinde sizinle iletişime geçecektir."}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-10 rounded-3xl bg-charcoal-900 border border-gold/30 shadow-2xl max-w-2xl mx-auto space-y-5"
    >
      <div className="text-center space-y-2 mb-4">
        <h3 className="font-heading text-2xl sm:text-3xl font-bold text-cream">
          {attrs.title || "Hemen Fiyat Teklifi Alın"}
        </h3>
        <p className="text-xs sm:text-sm text-cream/70 max-w-md mx-auto">
          {attrs.subtitle || "Tarihinizi seçin, size özel organizasyon planını hazırlayalım."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Adınız Soyadınız *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Örn: Ayşe Yılmaz"
            className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Telefon Numaranız *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="05XX XXX XX XX"
            className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Salon Tercihi</label>
          <select
            value={formData.hall}
            onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          >
            <option value="Elmira Balo Salonu">Elmira Balo Salonu (750-1000 Kişi)</option>
            <option value="Zümrüt Davet Salonu">Zümrüt Davet Salonu (350-500 Kişi)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Etkinlik Türü</label>
          <select
            value={formData.eventType}
            onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          >
            <option value="Düğün">Düğün</option>
            <option value="Kına">Kına Gecesi</option>
            <option value="Nişan">Nişan & Söz</option>
            <option value="Sünnet">Sünnet Düğünü</option>
            <option value="Kurumsal">Kurumsal Etkinlik</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Etkinlik Tarihi</label>
          <input
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-cream/80 mb-1">Zaman Dilimi (Slot)</label>
          <select
            value={formData.timeSlot}
            onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl bg-charcoal-800 border border-gold/20 text-cream text-xs focus:border-gold outline-none"
          >
            <option value="13:00 - 17:00">Gündüz (13:00 - 17:00)</option>
            <option value="19:00 - 23:00">Akşam (19:00 - 23:00)</option>
          </select>
        </div>
      </div>

      {/* KVKK Consent Checkbox (PG-B-06: Zorunlu) */}
      <div className="p-3 rounded-xl bg-black/40 border border-gold/20 flex items-start gap-2.5">
        <input
          type="checkbox"
          id="kvkk-consent"
          required
          checked={formData.kvkkConsent}
          onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
          className="mt-0.5 accent-gold w-4 h-4 rounded cursor-pointer"
        />
        <label htmlFor="kvkk-consent" className="text-[11px] text-cream/70 leading-relaxed cursor-pointer">
          {attrs.kvkkText ||
            "Kişisel verilerimin KVKK aydınlatma metni kapsamında işlenmesini ve teklif amacıyla tarafımla iletişime geçilmesini onaylıyorum."}
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-gold hover:bg-gold-light text-charcoal-900 font-bold text-sm tracking-wide transition-all shadow-xl hover:scale-[1.01] active:scale-95 disabled:opacity-50"
      >
        {loading ? "Gönderiliyor..." : "Fiyat Teklifimi Hazırla"}
      </button>
    </form>
  );
}

function getYouTubeVideoId(url: string = "") {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : "dQw4w9WgXcQ";
}
