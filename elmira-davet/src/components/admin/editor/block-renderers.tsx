"use client";

import React from "react";
import type { BlockNode } from "@/lib/cms/types";
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

  // Fallback for unknown block types (B-02)
  if (!type) {
    return (
      <div className="p-4 border border-dashed border-red-500/50 bg-red-500/10 rounded-xl text-center text-red-300 text-xs">
        Bilinmeyen veya şemaya uymayan blok verisi.
      </div>
    );
  }

  switch (type) {
    case "hero": {
      return (
        <div
          className="relative rounded-2xl overflow-hidden border border-gold/20 flex flex-col items-center justify-center text-center p-8 md:p-16 min-h-[360px] bg-cover bg-center"
          style={{
            backgroundImage: `url(${attrs.imageUrl || attrs.posterUrl || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1920&q=80"})`,
          }}
        >
          <div
            className="absolute inset-0 bg-black"
            style={{ opacity: (attrs.overlayOpacity ?? 55) / 100 }}
          />

          <div className="relative z-10 max-w-2xl space-y-4">
            <h1 className="text-2xl md:text-4xl font-heading text-cream font-bold drop-shadow">
              {attrs.title || "Hero Başlığı"}
            </h1>
            <p className="text-cream/80 text-sm md:text-base drop-shadow-sm">
              {attrs.subtitle || "Alt açıklama metni"}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="px-5 py-2.5 rounded-xl bg-gold text-charcoal-900 font-semibold text-xs shadow-lg">
                {attrs.primaryButtonText || "Hemen Teklif Al"}
              </span>
              {attrs.secondaryButtonText && (
                <span className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-cream border border-gold/40 text-xs">
                  {attrs.secondaryButtonText}
                </span>
              )}
            </div>
          </div>

          {!attrs.posterUrl && attrs.mediaType === "video" && (
            <div className="absolute top-3 right-3 bg-amber-500/90 text-charcoal-900 px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 shadow">
              <AlertCircle className="w-3 h-3" />
              Video posteri eksik!
            </div>
          )}
        </div>
      );
    }

    case "heading": {
      const level = attrs.level || 2;
      const HeadingTag = `h${level}` as any;
      const isDuplicateH1 = level === 1 && h1Count > 1;

      return (
        <div className={`space-y-2 text-${attrs.align || "center"} py-2`}>
          {attrs.badgeText && (
            <span className="inline-block px-3 py-1 rounded-full text-[10px] tracking-wider uppercase font-semibold bg-gold/15 text-gold border border-gold/30">
              {attrs.badgeText}
            </span>
          )}
          <HeadingTag
            className={`font-heading text-cream font-bold tracking-tight ${
              level === 1
                ? "text-3xl md:text-4xl text-gradient-gold"
                : level === 2
                ? "text-2xl md:text-3xl"
                : level === 3
                ? "text-xl md:text-2xl"
                : "text-lg md:text-xl"
            }`}
          >
            {attrs.text || "Başlık Yazısı"}
          </HeadingTag>
          {attrs.subtitle && (
            <p className="text-cream/70 text-xs md:text-sm max-w-xl mx-auto">
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

    case "text": {
      return (
        <div
          className="prose prose-invert prose-cream text-xs md:text-sm max-w-none py-1 leading-relaxed text-cream/90"
          dangerouslySetInnerHTML={{
            __html: attrs.html || "<p>Metin girilmedi...</p>",
          }}
        />
      );
    }

    case "image": {
      return (
        <div className="space-y-2 py-2">
          <div
            className={`relative rounded-xl overflow-hidden border border-gold/20 mx-auto max-w-3xl ${
              attrs.aspectRatio === "16:9"
                ? "aspect-video"
                : attrs.aspectRatio === "4:3"
                ? "aspect-[4/3]"
                : attrs.aspectRatio === "1:1"
                ? "aspect-square"
                : "aspect-auto max-h-[480px]"
            }`}
          >
            <img
              src={attrs.url || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"}
              alt={attrs.alt || "Görsel"}
              className="w-full h-full object-cover"
            />
          </div>
          {attrs.caption && (
            <p className="text-center text-[11px] text-cream/50 italic">
              {attrs.caption}
            </p>
          )}
          {!attrs.alt && (
            <div className="text-center">
              <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                <AlertCircle className="w-3 h-3" />
                Görsel alt metni eksik! (SEO & Erişilebilirlik)
              </span>
            </div>
          )}
        </div>
      );
    }

    case "gallery": {
      return (
        <div className="p-4 rounded-xl bg-charcoal-800/60 border border-gold/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gold font-semibold">
              <Images className="w-4 h-4" />
              <span>Dinamik Fotoğraf Galerisi</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/25 font-mono">
              Kategori: {attrs.categoryId || "Tümü"} | Düzen: {attrs.layout || "masonry"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-cream/30 text-[10px]"
              >
                Galeri Görseli #{i}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "hall_cards": {
      return (
        <div className="p-4 rounded-xl bg-charcoal-800/60 border border-gold/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gold font-semibold">
              <Building2 className="w-4 h-4" />
              <span>Dinamik Salon Kartları (Sistemden Çekilir)</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/25 font-mono">
              {attrs.displayMode === "all" ? "Tüm Salonlar" : "Özel Seçim"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 py-1">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-semibold text-xs text-cream">Kristal Salon</div>
              <div className="text-[11px] text-cream/60">Kapasite: 600 Kişi | Lüks Kapalı Davet Salonu</div>
              <div className="text-[10px] text-gold font-medium">Saray Konsepti, Kristal Avizeler, Geniş Sahne</div>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-1">
              <div className="font-semibold text-xs text-cream">Kır Bahçesi</div>
              <div className="text-[11px] text-cream/60">Kapasite: 300 Kişi | Doğal Açık Hava Alanı</div>
              <div className="text-[10px] text-gold font-medium">Yıldızlar Altında, Rustik Zarafet, Peri Masalı</div>
            </div>
          </div>
        </div>
      );
    }

    case "packages": {
      return (
        <div className="p-4 rounded-xl bg-charcoal-800/60 border border-gold/20 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gold font-semibold">
              <PackageCheck className="w-4 h-4" />
              <span>Dinamik Paket & Menü Kartları</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-gold/15 text-gold border border-gold/25 font-mono">
              {attrs.layout || "cards"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 py-1">
            {["Altın Düğün Paketi", "Kına Gecesi Özel", "Kokteyl Menüsü"].map((pkg, idx) => (
              <div key={idx} className="p-2.5 bg-white/5 rounded-lg border border-white/10 text-xs text-cream">
                <span className="font-semibold text-gold block mb-1">{pkg}</span>
                <span className="text-[10px] text-cream/50">Yemekli / İkramlı Servis</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "counters": {
      const items = attrs.items || [];
      return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-4 text-center">
          {items.map((it: any, i: number) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-gold/15">
              <div className="text-xl md:text-2xl font-bold text-gold font-heading">
                {it.value}
                <span className="text-sm font-normal ml-0.5">{it.suffix}</span>
              </div>
              <div className="text-[11px] text-cream/70 mt-1 font-medium">{it.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "testimonials": {
      return (
        <div className="p-4 rounded-xl bg-charcoal-800/60 border border-gold/20 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-gold font-semibold">
              <Quote className="w-4 h-4" />
              <span>Müşteri Yorumları (Onaylı Yorumlardan Çekilir)</span>
            </div>
            <span className="text-[10px] text-cream/50">Düzen: {attrs.layout || "slider"}</span>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs italic text-cream/80">
            "Düğünümüz rüya gibi geçti, tüm personele ve şeflere sonsuz teşekkürler..."
            <div className="mt-1 text-[11px] text-gold not-italic font-semibold">— Merve & Berk (Düğün)</div>
          </div>
        </div>
      );
    }

    case "faq": {
      const items = attrs.items || [];
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2 text-gold text-xs font-semibold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>Sıkça Sorulan Sorular (Akordeon)</span>
          </div>
          {items.slice(0, 3).map((faq: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-gold/15 text-xs">
              <div className="font-semibold text-cream flex items-center justify-between">
                <span>{faq.question}</span>
                <span className="text-gold font-mono">+</span>
              </div>
              <p className="text-[11px] text-cream/60 mt-1 line-clamp-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      );
    }

    case "reservation_form": {
      return (
        <div className="p-5 rounded-2xl bg-charcoal-800/90 border border-gold/30 space-y-4 max-w-xl mx-auto shadow-xl">
          <div className="text-center space-y-1">
            <h3 className="font-heading text-lg text-cream font-bold">{attrs.title || "Teklif Alın"}</h3>
            <p className="text-xs text-cream/60">{attrs.subtitle || "Danışmanlarımız 1 saat içinde dönsün"}</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-2 bg-black/40 rounded-lg border border-gold/20 text-cream/40">Adınız Soyadınız</div>
            <div className="p-2 bg-black/40 rounded-lg border border-gold/20 text-cream/40">Telefon Numaranız</div>
            <div className="p-2 bg-black/40 rounded-lg border border-gold/20 text-cream/40">Etkinlik Tarihi</div>
            <div className="p-2 bg-black/40 rounded-lg border border-gold/20 text-cream/40">Zaman: 13:00 - 17:00 / 19:00 - 23:00</div>
          </div>

          <div className="p-2 bg-gold/10 rounded-lg border border-gold/25 text-[10px] text-cream/80 flex items-start gap-1.5">
            <span className="text-gold font-bold">✓</span>
            <span>{attrs.kvkkText || "KVKK aydınlatma metnini okudum ve onaylıyorum."}</span>
          </div>

          <button type="button" className="w-full py-2.5 rounded-xl bg-gold text-charcoal-900 font-semibold text-xs">
            Teklif Talebini Gönder (CRM Senkron)
          </button>
        </div>
      );
    }

    case "map": {
      return (
        <div className="space-y-2 py-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-gold">
            <MapPin className="w-4 h-4" />
            <span>{attrs.title || "Harita & Konum"}</span>
          </div>
          <div className="h-44 bg-charcoal-800 rounded-xl border border-gold/20 flex flex-col items-center justify-center text-center p-4">
            <MapPin className="w-8 h-8 text-gold mb-2 opacity-80" />
            <span className="text-xs font-medium text-cream">{attrs.address}</span>
            <span className="text-[10px] text-cream/40 mt-1">Google Maps İnteraktif Harita Önizlemesi</span>
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
            <span className="text-[10px] text-cream/50">Mobilde otomatik alt alta dizilir</span>
          </div>
          <div className={`grid grid-cols-${attrs.columnsCount || 2} gap-2`}>
            {Array.from({ length: attrs.columnsCount || 2 }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="min-h-[80px] p-2 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center text-center text-[11px] text-cream/40"
              >
                Sütun #{cIdx + 1}
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "button_cta": {
      return (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-gold/15 via-black/40 to-gold/15 border border-gold/30 text-center space-y-3">
          <h4 className="font-heading text-lg font-bold text-cream">{attrs.text || "CTA Başlığı"}</h4>
          <div>
            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gold text-charcoal-900 font-semibold text-xs shadow-md">
              <span>{attrs.buttonText || "Bize Ulaşın"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
          {attrs.buttonUrl && (
            <div className="text-[10px] text-cream/40 font-mono">Hedef: {attrs.buttonUrl}</div>
          )}
        </div>
      );
    }

    case "video": {
      return (
        <div className="space-y-2 py-2">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-gold/25 flex items-center justify-center">
            {attrs.posterUrl ? (
              <img src={attrs.posterUrl} alt="Video Poster" className="w-full h-full object-cover opacity-60" />
            ) : null}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <div className="w-12 h-12 rounded-full bg-gold/90 text-charcoal-900 flex items-center justify-center mb-2 shadow-lg">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
              <span className="text-xs font-semibold text-cream drop-shadow">
                {attrs.source === "youtube" ? "YouTube Video Oynatıcı" : "Özel Video"}
              </span>
              <span className="text-[10px] text-cream/60 font-mono max-w-sm truncate mt-0.5">
                {attrs.url}
              </span>
            </div>
          </div>
        </div>
      );
    }

    case "spacer_divider": {
      return (
        <div
          className="flex items-center justify-center py-2"
          style={{ height: `${attrs.height || 48}px` }}
        >
          {attrs.showDivider && (
            <div className="w-full flex items-center justify-center">
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
              <div className="w-2 h-2 rotate-45 border border-gold bg-charcoal-900 mx-2" />
              <div className="h-[1px] w-24 bg-gradient-to-r from-gold via-gold to-transparent" />
            </div>
          )}
        </div>
      );
    }

    case "saved_block": {
      return (
        <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
          <div className="flex items-center justify-between text-purple-300 font-semibold">
            <span>Kayıtlı Bölüm (Şablon)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 font-mono">
              {attrs.isLinked ? "Bağlı Kopya" : "Bağımsız Kopya"}
            </span>
          </div>
          <p className="text-cream/70 text-[11px]">
            "{attrs.name || "Kayıtlı Şablon"}" içeriği bu alanda dinamik olarak render edilir.
          </p>
        </div>
      );
    }

    case "custom_html": {
      return (
        <div className="p-3 rounded-xl bg-black/60 border border-gold/25 font-mono text-xs text-cream/80 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-amber-300 font-semibold">
            <span>Özel HTML Kodu (XSS Korumalı)</span>
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
